import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { checkAdminLogin } from '../../actions/checkAdminLogin';
import { deleteCookie, getCookie } from '../../helpers/cookie';
import AdminLogin from '../../pages/AdminLogin';
import '../../css/admin.scss';

const menuItems = [
  { path: '/admin/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
  { path: '/admin/products', icon: 'fa-motorcycle', label: 'Sản phẩm' },
  { path: '/admin/orders', icon: 'fa-clipboard-list', label: 'Đơn hàng' },
  { path: '/admin/customers', icon: 'fa-users', label: 'Khách hàng' },
  { path: '/admin/settings', icon: 'fa-gear', label: 'Cài đặt' },
];

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check auth state
  const adminState = useSelector(state => state.adminReducer);
  const isAdmin = typeof adminState === 'boolean' ? adminState : adminState?.isAdmin;
  const adminToken = getCookie('adminToken');

  // Nếu chưa đăng nhập, redirect về /admin
  useEffect(() => {
    if (!isAdmin && !adminToken && location.pathname !== '/admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, adminToken, location.pathname, navigate]);

  const handleLogout = () => {
    deleteCookie('adminToken');
    deleteCookie('adminName');
    deleteCookie('adminEmail');
    dispatch(checkAdminLogin(false));
    message.success('Đã đăng xuất!');
    navigate('/admin');
  };

  // Nếu chưa đăng nhập → hiển thị form login
  if (!isAdmin && !adminToken) {
    return <AdminLogin />;
  }

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* Mobile overlay */}
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${menuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="sidebar-logo">
            <img src="https://i.ibb.co/N2M6KQF1/z7790788363527-56ca27f711c0b500b4470863fd7c81c2-1.jpg" alt="Logo" />
            {!collapsed && <span className="sidebar-brand">LONG <span>MOTO</span></span>}
          </Link>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <i className="fa-solid fa-arrow-left"></i>
            {!collapsed && <span>Về trang chủ</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="topbar-left">
            {/* Mobile menu toggle */}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h2 className="page-title">
              {menuItems.find(m => m.path === location.pathname)?.label || 'Admin'}
            </h2>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <i className="fa-solid fa-search"></i>
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            <div className="topbar-notification">
              <i className="fa-solid fa-bell"></i>
              <span className="notif-badge">3</span>
            </div>
            <div className="topbar-user" onClick={handleLogout} title="Đăng xuất">
              <i className="fa-solid fa-circle-user"></i>
              <span className="user-name">Admin</span>
              <i className="fa-solid fa-right-from-bracket logout-icon"></i>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;