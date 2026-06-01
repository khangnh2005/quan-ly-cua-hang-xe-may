import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { checkLogin } from '../../actions/checkLogin';
import { setCookie } from '../../helpers/cookie';
import { post } from '../../untils/requests';
import '../../css/style.scss';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await post('auth/sign-in', {
        username: formData.username,
        password: formData.password,
      });

      if (response && response.message === 'Sign-in successful') {
        const user = response.user;
        
        // Save token & user info to cookie
        // rememberMe=true: 30-day persistent cookie, rememberMe=false: session cookie (expires when browser closes)
        const days = formData.rememberMe ? 30 : 0;
        setCookie('token', user.id, days);
        setCookie('userId', user.id, days);
        setCookie('fullName', user.fullName, days);
        setCookie('email', user.email, days);
        setCookie('phoneNumber', user.phoneNumber || '', days);
        setCookie('address', user.address || '', days);
        setCookie('cccd', user.cccd || '', days);

        // Dispatch login to Redux
        dispatch(checkLogin(true));
        
        message.success(`Đăng nhập thành công! Xin chào ${user.fullName}`);
        navigate('/');
      } else {
        message.error('Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      console.error('Login error:', err);
      message.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand-section">
          <div className="login-brand-content">
            <div className="login-brand-logo-large">
              <div className="brand-logo-circle">
                <img 
                  src="https://i.ibb.co/N2M6KQF1/z7790788363527-56ca27f711c0b500b4470863fd7c81c2-1.jpg" 
                  alt="Long Moto Logo" 
                />
              </div>
              <h2 className="login-brand-title">LONG <span>MOTO</span></h2>
            </div>
            <p className="login-brand-desc">
              Đại lý xe máy uy tín hàng đầu TP.HCM với hơn 12 năm kinh nghiệm. Cam kết xe chính hãng, giá tốt nhất, dịch vụ tận tâm.
            </p>
            <div className="login-brand-features">
              <div className="brand-feature-item">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Xe chính hãng 100%</span>
              </div>
              <div className="brand-feature-item">
                <i className="fa-solid fa-tags"></i>
                <span>Giá tốt nhất thị trường</span>
              </div>
              <div className="brand-feature-item">
                <i className="fa-solid fa-hand-holding-dollar"></i>
                <span>Hỗ trợ trả góp đến 80%</span>
              </div>
              <div className="brand-feature-item">
                <i className="fa-solid fa-headset"></i>
                <span>Hỗ trợ 24/7 tận tâm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-card">
            <div className="login-card-header">
              <Link to="/" className="login-logo-link">
                <div className="login-logo-wrapper">
                  <img 
                    src="https://i.ibb.co/N2M6KQF1/z7790788363527-56ca27f711c0b500b4470863fd7c81c2-1.jpg" 
                    alt="Long Moto Logo" 
                  />
                </div>
                <div className="login-brand-text">
                  LONG <span>MOTO</span>
                </div>
              </Link>
              <h1 className="login-title">Chào mừng trở lại</h1>
              <p className="login-subtitle">Đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form-body">
              <div className="login-field">
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

              <div className="login-field" style={{ position: 'relative' }}>
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  style={{ paddingRight: '40px' }} // Chừa chỗ cho icon
                />
                <i 
                  className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '38px', // Bạn có thể tinh chỉnh số này tùy theo chiều cao label của bạn
                    cursor: 'pointer',
                    color: '#888'
                  }}
                ></i>
              </div>

              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span>Ghi nhớ tôi</span>
                </label>
                <a href="#" className="login-forgot">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="login-btn-primary" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

             
            </form>

            <div className="login-card-footer">
              <p>Chưa có tài khoản? <Link to="/register" className="login-signup">Đăng ký ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;