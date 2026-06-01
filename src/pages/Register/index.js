import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { checkLogin } from '../../actions/checkLogin';
import { setCookie } from '../../helpers/cookie';
import { post } from '../../untils/requests';
import '../../css/style.scss';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    cccd: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await post('auth/sign-up', {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        cccd: formData.cccd,
        address: formData.address,
      });

      if (response && response.message === 'Sign-up successful') {
        message.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        message.error('Đăng ký thất bại! Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Register error:', err);
      message.error('Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.');
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
              Đại lý xe máy uy tín hàng đầu TP.HCM với hơn 12 năm kinh nghiệm.
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
              <h1 className="login-title">Tạo tài khoản mới</h1>
              <p className="login-subtitle">Đăng ký để trải nghiệm dịch vụ</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form-body">
              <div className="login-field">
                <label htmlFor="username">Tên đăng nhập *</label>
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

              <div className="login-field">
                <label htmlFor="fullName">Họ và tên *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="phoneNumber">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="cccd">CCCD *</label>
                <input
                  type="text"
                  id="cccd"
                  name="cccd"
                  value={formData.cccd}
                  onChange={handleInputChange}
                  placeholder="Nhập số CCCD"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="address">Địa chỉ *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">Mật khẩu *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
              </div>

              <button type="submit" className="login-btn-primary" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            <div className="login-card-footer" style={{ marginTop: '20px' }}>
              <p>Đã có tài khoản? <Link to="/login" className="login-signup">Đăng nhập ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;