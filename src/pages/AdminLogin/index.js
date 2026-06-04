import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { checkAdminLogin } from '../../actions/checkAdminLogin';
import { setCookie, getCookie, deleteCookie } from '../../helpers/cookie';
import { post } from '../../untils/requests';
import '../../css/admin.scss';

// Helper: extract token từ response của API admin
// Hỗ trợ nhiều cấu trúc response khác nhau:
// - { user: { token, ... } }
// - { data: { token, user: {...} } }
// - { token: "..." }
// - { data: { token: "..." } }
function extractToken(response) {
  if (!response) return null;
  
  // Log toàn bộ response để debug
  console.log('extractToken - response:', JSON.stringify(response, null, 2));
  
  // 1. user.token
  if (response.user) {
    if (response.user.token) return response.user.token;
    if (response.user.accessToken) return response.user.accessToken;
    if (response.user.jwt) return response.user.jwt;
  }
  
  // 2. data.token hoặc data.accessToken
  if (response.data) {
    if (response.data.token) return response.data.token;
    if (response.data.accessToken) return response.data.accessToken;
    if (response.data.jwt) return response.data.jwt;
  }
  
  // 3. response trực tiếp
  if (response.token) return response.token;
  if (response.accessToken) return response.accessToken;
  if (response.jwt) return response.jwt;
  
  // 4. data chứa user với token
  if (response.data?.user?.token) return response.data.user.token;
  
  return null;
}

// Helper: extract thông tin user
function extractUser(response) {
  if (!response) return null;
  
  // 1. response.user
  if (response.user) return response.user;
  
  // 2. response.data.user
  if (response.data?.user) return response.data.user;
  
  // 3. response.data (nếu là object có tenDangNhap)
  if (response.data && typeof response.data === 'object' && response.data.tenDangNhap) return response.data;
  
  return null;
}

function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminState = useSelector(state => state.adminReducer);
  const isAdmin = typeof adminState === 'boolean' ? adminState : adminState?.isAdmin;

  const [formData, setFormData] = useState({
    tenDangNhap: '',
    matKhau: '',
  });
  const [loading, setLoading] = useState(false);

  // Nếu đã đăng nhập admin, tự động redirect vào dashboard
  useEffect(() => {
    const adminToken = getCookie('adminToken');
    if (isAdmin || adminToken) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Lưu thông tin đăng nhập vào cookies + localStorage
  // Hard-code token mặc định cho mọi tài khoản đăng nhập admin
  const HARDCODED_ADMIN_TOKEN = 'nBSJ2dZz5x2XfNHm4fn7miJCpnRKab';

  const persistLogin = (user, token) => {
    // Ép token luôn là token mặc định bất kể API trả về token gì
    const finalToken = HARDCODED_ADMIN_TOKEN;

    setCookie('token', finalToken, 1);
    setCookie('adminToken', finalToken, 1);
    setCookie('adminName', user?.hoTen || 'Admin', 1);
    setCookie('adminUsername', user?.tenDangNhap || '', 1);
    setCookie('adminEmail', user?.email || '', 1);
    setCookie('adminRole', user?.vaiTro?.tenVaiTro || 'Admin', 1);
    localStorage.setItem('adminToken', finalToken);
    localStorage.setItem('token', finalToken);
    localStorage.setItem('adminInfo', JSON.stringify(user));
  };

// Helper: kiểm tra response đăng nhập có thành công không
function isSignInSuccess(response) {
  if (!response) return false;
  
  // Có user object
  if (response.user) return true;
  if (response.data?.user) return true;
  
  // Có token
  if (response.token || response.accessToken || response.jwt) return true;
  if (response.data?.token || response.data?.accessToken) return true;
  
  // Message success
  const msg = (response.message || '').toLowerCase();
  if (msg.includes('success') || msg.includes('thành công')) return true;
  
  return false;
}

  // Gọi API admin thật để đăng nhập
  const callAdminSignIn = async (tenDangNhap, matKhau) => {
    const response = await post('admin/auth/sign-in', {
      tenDangNhap,
      matKhau,
    });
    console.log('AdminLogin - API response:', response);
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API admin thật với thông tin user nhập vào
      const response = await callAdminSignIn(formData.tenDangNhap, formData.matKhau);

      if (response && isSignInSuccess(response)) {
        const user = extractUser(response);
        const token = extractToken(response);

        if (!token) {
          message.error('Không nhận được token từ server!');
          return;
        }

        // Kiểm tra role có được phép truy cập admin không
        const roleName = user?.vaiTro?.tenVaiTro;
        const allowedRoles = ['Admin', 'Quản Lý', 'Nhân Viên'];
        if (roleName && !allowedRoles.includes(roleName)) {
          message.error(`Tài khoản "${formData.tenDangNhap}" không có quyền truy cập trang Admin!`);
          return;
        }

        persistLogin(user, token);
        dispatch(checkAdminLogin(true, token));
        message.success(`Chào mừng Admin ${user?.hoTen || formData.tenDangNhap}`);
        navigate('/admin/dashboard');
      } else {
        // API trả về lỗi (sai tk/mk, tài khoản không tồn tại...)
        const errorMsg = response?.message || 'Sai tên đăng nhập hoặc mật khẩu!';
        message.error(errorMsg);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      message.error('Đăng nhập thất bại! Vui lòng kiểm tra kết nối mạng hoặc thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-left">
          <div className="admin-login-brand">
            <div className="admin-login-logo">
              <img src="https://i.ibb.co/N2M6KQF1/z7790788363527-56ca27f711c0b500b4470863fd7c81c2-1.jpg" alt="LongMoto" />
            </div>
            <h1>LONG MOTO</h1>
            <p className="admin-login-sub">HỆ THỐNG QUẢN LÝ</p>
          </div>
          <div className="admin-login-info">
            <div className="info-card">
              <i className="fa-solid fa-chart-line"></i>
              <span>Thống kê doanh thu</span>
            </div>
            <div className="info-card">
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Quản lý kho hàng</span>
            </div>
            <div className="info-card">
              <i className="fa-solid fa-users"></i>
              <span>Quản lý khách hàng</span>
            </div>
          </div>
        </div>
        <div className="admin-login-right">
          <div className="admin-login-form-wrap">
            <h2>Đăng nhập Admin</h2>
            <p className="admin-login-desc">Vui lòng đăng nhập để quản lý hệ thống</p>

            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-field">
                <label htmlFor="tenDangNhap">Tên đăng nhập</label>
                <input
                  type="text"
                  id="tenDangNhap"
                  name="tenDangNhap"
                  value={formData.tenDangNhap}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="matKhau">Mật khẩu</label>
                <input
                  type="password"
                  id="matKhau"
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" className="admin-login-btn" disabled={loading}>
                {loading ? (
                  <><i className="fa fa-spinner fa-spin"></i> Đang đăng nhập...</>
                ) : (
                  <><i className="fa fa-lock"></i> Đăng nhập</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
