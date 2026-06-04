import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { checkAdminLogin } from '../../actions/checkAdminLogin';
import { deleteCookie, deleteAllCookies, getCookie } from '../../helpers/cookie';
import AdminLogin from '../../pages/AdminLogin';
import '../../css/admin.scss';

// Cấu hình menu theo vai trò
const roleMenuConfig = {
  Admin: {
    allowedPaths: [
      '/admin/dashboard',
      '/admin/vehicles', '/admin/vehicle-models', '/admin/vehicle-categories',
      '/admin/orders',
      '/admin/customers',
      '/admin/permissions',
      '/admin/roles',
      '/admin/settings',
    ],
    label: 'Admin'
  },
  'Quản Lý': {
    allowedPaths: [
      '/admin/dashboard',
      '/admin/vehicles', '/admin/vehicle-models', '/admin/vehicle-categories',
      '/admin/orders',
      '/admin/customers',
      '/admin/settings',
    ],
    label: 'Quản Lý'
  },
  'Nhân Viên': {
    allowedPaths: [
      '/admin/dashboard',
      '/admin/orders',
      '/admin/settings',
    ],
    label: 'Nhân Viên'
  }
};

// Danh sách tất cả menu items (dùng để render sau khi lọc)
const allMenuItems = [
  { path: '/admin/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
  { path: '/admin/vehicles', icon: 'fa-motorcycle', label: 'Sản phẩm',
    children: [
      { path: '/admin/vehicles', label: 'Danh sách xe' },
      { path: '/admin/vehicle-models', label: 'Hãng xe' },
      { path: '/admin/vehicle-categories', label: 'Loại xe' },
    ]
   },
  { path: '/admin/orders', icon: 'fa-clipboard-list', label: 'Đơn hàng' },
  { path: '/admin/customers', icon: 'fa-users', label: 'Khách hàng' },
  { path: '/admin/permissions', icon: 'fa-lock', label: 'Phân quyền' },
  { path: '/admin/roles', icon: 'fa-user-tag', label: 'Vai trò' },
  { path: '/admin/settings', icon: 'fa-gear', label: 'Cài đặt' },
];

// Lọc menu items dựa trên vai trò
function filterMenuByRole(role) {
  const config = roleMenuConfig[role];
  if (!config) return [];

  return allMenuItems.filter(item => {
    // Nếu item có children, kiểm tra nếu bất kỳ child nào được phép
    if (item.children) {
      return item.children.some(child => config.allowedPaths.includes(child.path));
    }
    // Nếu không có children, kiểm tra trực tiếp
    return config.allowedPaths.includes(item.path);
  }).map(item => {
    // Nếu item có children, lọc children
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => config.allowedPaths.includes(child.path))
      };
    }
    return item;
  });
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check auth state
  const adminState = useSelector(state => state.adminReducer);
  const isAdmin = typeof adminState === 'boolean' ? adminState : adminState?.isAdmin;
  const adminToken = getCookie('adminToken');
  const userRole = getCookie('adminRole') || 'Admin';

  // Lọc menu items dựa trên vai trò
  const menuItems = filterMenuByRole(userRole);

  // Lấy danh sách các path được phép truy cập
  const config = roleMenuConfig[userRole];
  const allowedPaths = config ? config.allowedPaths : [];

  // Nếu chưa đăng nhập, redirect về /admin
  useEffect(() => {
    if (!isAdmin && !adminToken && location.pathname !== '/admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, adminToken, location.pathname, navigate]);

  // Kiểm tra quyền truy cập trang hiện tại
  useEffect(() => {
    if (isAdmin || adminToken) {
      const currentPath = location.pathname;
      // Nếu không phải trang dashboard và không nằm trong danh sách được phép thì redirect
      if (currentPath.startsWith('/admin/') && currentPath !== '/admin') {
        const isAllowed = allowedPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
        if (!isAllowed && menuItems.length > 0) {
          message.warning('Bạn không có quyền truy cập trang này!');
          navigate(menuItems[0].path, { replace: true });
        }
      }
    }
  }, [isAdmin, adminToken, location.pathname, allowedPaths, menuItems, navigate]);

  // Tự động mở sub-menu khi đang ở trang con
  useEffect(() => {
    const activeParent = menuItems.find(item =>
      item.children && item.children.some(child => child.path === location.pathname)
    );
    if (activeParent) {
      setOpenMenu(activeParent.path);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    deleteAllCookies();
    dispatch(checkAdminLogin(false));
    message.success('Đã đăng xuất!');
    // Force navigate to admin login page
    window.location.href = '/admin';
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
            {!collapsed && <span className="sidebar-brand">LONG <span>MOTO</span> ADMIN</span>}
          </Link>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <div key={item.path}>
              <Link
                to={item.children ? '#' : item.path}
                className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => item.children ? setOpenMenu(openMenu === item.path ? null : item.path) : setMenuOpen(false)}
              >
                <i className={`fa-solid ${item.icon}`}></i>
                {!collapsed && <span>{item.label}</span>}
                {item.children && !collapsed && (
                  <i className={`fa-solid ${openMenu === item.path ? 'fa-chevron-down' : 'fa-chevron-right'} ml-auto`}></i>
                )}
              </Link>
              
              {/* Render sub-menu */}
              {item.children && openMenu === item.path && !collapsed && (
                <div className="sub-menu">
                  {item.children.map(child => (
                    <Link key={child.path} to={child.path} className={`sub-nav-item ${location.pathname === child.path ? 'active' : ''}`}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
              <span className="user-name">{userRole}</span>
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