import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { checkAdminLogin } from '../../actions/checkAdminLogin';
import { setCookie, getCookie, deleteCookie } from '../../helpers/cookie';
import { post } from '../../untils/requests';
import '../../css/admin.scss';

// Demo admin credentials (hardcoded for testing without backend)
const DEMO_ADMIN = {
  username: 'admin',
  password: '123456',
  fullName: 'Admin LongMoto',
  email: 'admin@longmoto.vn',
  id: 'DEMO_ADMIN_001',
};

function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminState = useSelector(state => state.adminReducer);
  const isAdmin = typeof adminState === 'boolean' ? adminState : adminState?.isAdmin;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
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

  // Hàm đăng nhập demo - KHÔNG cần API backend
  const handleDemoLogin = () => {
    // Bypass API - đăng nhập ngay với tài khoản demo
    setCookie('adminToken', DEMO_ADMIN.id, 1);
    setCookie('adminName', DEMO_ADMIN.fullName, 1);
    setCookie('adminEmail', DEMO_ADMIN.email, 1);

    dispatch(checkAdminLogin(true, DEMO_ADMIN.id));
    message.success(`Chào mừng Admin ${DEMO_ADMIN.fullName} (Demo Mode)`);
    navigate('/admin/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ưu tiên kiểm tra demo account trước
      if (formData.username === DEMO_ADMIN.username && formData.password === DEMO_ADMIN.password) {
        handleDemoLogin();
        setLoading(false);
        return;
      }

      const response = await post('auth/sign-in', {
        username: formData.username,
        password: formData.password,
      });

      if (response && response.message === 'Sign-in successful') {
        const user = response.user;

        // Check if user is admin (by role or specific admin credentials)
        if (user.role === 'admin' || formData.username === 'admin' || formData.username.startsWith('admin')) {
          setCookie('adminToken', user.id, 1);
          setCookie('adminName', user.fullName, 1);
          setCookie('adminEmail', user.email, 1);

          dispatch(checkAdminLogin(true, user.id));
          message.success(`Chào mừng Admin ${user.fullName}`);
          navigate('/admin/dashboard');
        } else {
          message.error('Bạn không có quyền truy cập trang Admin!');
        }
      } else {
        message.error('Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      message.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
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
            {/* Demo Account Info */}
            <div className="admin-demo-info">
              <i className="fa-solid fa-flask"></i>
              <div className="demo-text">
                <strong>Tài khoản Demo:</strong> admin / 123456
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-field">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
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

            <div className="admin-demo-divider">
              <span>HOẶC</span>
            </div>

            <button 
              type="button" 
              className="admin-demo-btn" 
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <i className="fa-solid fa-rocket"></i>
              Đăng nhập Demo (Không cần API)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;