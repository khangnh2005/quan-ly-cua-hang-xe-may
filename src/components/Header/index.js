import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { checkLogin } from '../../actions/checkLogin';
import { deleteAllCookies, getCookie } from '../../helpers/cookie';
import { message } from 'antd';

function Header() {
  const loginState = useSelector(state => state.loginReducer);
  const isLogin = typeof loginState === 'boolean' ? loginState : loginState?.isLogin;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fullName = getCookie('fullName');

  function handleLogout() {
    deleteAllCookies();
    dispatch(checkLogin(false));
    message.success('Đã đăng xuất thành công!');
    navigate('/');
  }

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        <div className="logo-wrapper">
          <img src="https://i.ibb.co/N2M6KQF1/z7790788363527-56ca27f711c0b500b4470863fd7c81c2-1.jpg" alt="Long Moto Logo" />
        </div>
        <div className="logo-text">
          LONG MOTO
        </div>
      </Link>
      <ul className="nav-links">
        <li><a href="#">Sản phẩm</a></li>
        <li><a href="#">Dịch vụ</a></li>
        <li><a href="#">Tin tức</a></li>
        <Link to="/about">Về chúng tôi</Link>
      </ul>
      <div className="nav-actions">
        {isLogin ? (
          <>
            <a href="#" className="nav-icon-btn" title="Theo dõi đơn hàng">
              <i className="fa-solid fa-truck-fast"></i>
            </a>
            
            <Link to="/profile" className="nav-icon-btn" title={fullName || 'User'}>
              <i className="fa-solid fa-circle-user"></i>
              <span style={{ marginLeft: '4px', fontSize: '12px', color: '#fff' }}>{fullName || 'User'}</span>
            </Link>
            <button className="btn-login" onClick={handleLogout} style={{ background: '#333' }}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
            <Link to="/register" className="btn-login" style={{ background: '#fff', color: '#000', textDecoration: 'none' }}>Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header;
