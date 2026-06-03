import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../untils/requests';
import '../../css/admin.scss';

const statusMap = {
  DaThanhToan: { label: 'Đã thanh toán', class: 'success' },
  ChoXuLy: { label: 'Chờ xử lý', class: 'info' },
  DangXuLy: { label: 'Đang xử lý', class: 'warning' },
  DaHuy: { label: 'Đã hủy', class: 'danger' },
};

const statusVnMap = {
  'Đã thanh toán': 'DaThanhToan',
  'Chờ xử lý': 'ChoXuLy',
  'Đang xử lý': 'DangXuLy',
  'Đã hủy': 'DaHuy',
};

const normalizeStatus = (status) => {
  if (!status) return status;
  if (statusVnMap[status]) return statusVnMap[status];
  if (statusMap[status]) return status;
  const found = Object.keys(statusMap).find(
    (k) => k.toLowerCase() === String(status).toLowerCase()
  );
  return found || status;
};

const getDisplayStatus = (status) => {
  const key = normalizeStatus(status);
  return statusMap[key] || { label: status || 'Không xác định', class: 'default' };
};

function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehiclesRes, ordersRes, customersRes] = await Promise.all([
          get('vehicles'),
          get('orders'),
          get('customers'),
        ]);

        const vehicleList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
        const orderList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
        const customerList = Array.isArray(customersRes) ? customersRes : (customersRes?.data || []);

        setVehicles(vehicleList);
        setOrders(orderList);
        setCustomers(customerList);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter(o => normalizeStatus(o.trangThaiDonHang) === 'DaThanhToan')
      .reduce((sum, o) => sum + (Number(o.tongTien) || 0), 0);

    return {
      totalProducts: vehicles.length,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      revenue: totalRevenue,
    };
  }, [vehicles, orders, customers]);

  const quickStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const todayOrders = orders.filter(o => new Date(o.ngayDat) >= startOfToday);
    const yesterdayOrders = orders.filter(o => {
      const d = new Date(o.ngayDat);
      return d >= startOfYesterday && d < startOfToday;
    });

    const inStock = vehicles.filter(v => v.trangThaiXe === 'ConHang').length;

    const monthRevenue = orders
      .filter(o => {
        const d = new Date(o.ngayDat);
        return d >= startOfMonth && normalizeStatus(o.trangThaiDonHang) === 'DaThanhToan';
      })
      .reduce((sum, o) => sum + (Number(o.tongTien) || 0), 0);

    const prevMonthRevenue = orders
      .filter(o => {
        const d = new Date(o.ngayDat);
        return d >= startOfPrevMonth && d < startOfMonth && normalizeStatus(o.trangThaiDonHang) === 'DaThanhToan';
      })
      .reduce((sum, o) => sum + (Number(o.tongTien) || 0), 0);

    let monthChange = 0;
    if (prevMonthRevenue > 0) {
      monthChange = Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
    } else if (monthRevenue > 0) {
      monthChange = 100;
    }

    return {
      todayCount: todayOrders.length,
      todayChange: todayOrders.length - yesterdayOrders.length,
      lowStock: inStock,
      monthRevenue,
      monthChange,
    };
  }, [orders, vehicles]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.ngayDat || 0) - new Date(a.ngayDat || 0))
      .slice(0, 5);
  }, [orders]);

  const recentActivities = useMemo(() => {
    const activities = [];

    orders
      .slice()
      .sort((a, b) => new Date(b.ngayDat || 0) - new Date(a.ngayDat || 0))
      .slice(0, 3)
      .forEach(o => {
        const status = normalizeStatus(o.trangThaiDonHang);
        let icon = 'fa-clipboard-list';
        let color = '#4361ee';
        let text = `Đơn hàng mới từ ${o?.khachHang?.hoTen || 'khách hàng'}`;
        const orderCode = (o._id || '').slice(-6).toUpperCase();
        if (status === 'DaThanhToan') {
          icon = 'fa-check-circle';
          color = '#06d6a0';
          text = `Đơn hàng #${orderCode} đã thanh toán`;
        } else if (status === 'DangXuLy') {
          icon = 'fa-truck';
          color = '#ff9f1c';
          text = `Đơn hàng #${orderCode} đang xử lý`;
        } else if (status === 'DaHuy') {
          icon = 'fa-times-circle';
          color = '#e63946';
          text = `Đơn hàng #${orderCode} đã bị hủy`;
        } else if (status === 'ChoXuLy') {
          icon = 'fa-hourglass-half';
          color = '#4cc9f0';
          text = `Đơn hàng #${orderCode} đang chờ xử lý`;
        }
        activities.push({
          icon, color, text,
          _sortTime: new Date(o.ngayDat || 0).getTime(),
        });
      });

    customers
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return tb - ta;
      })
      .slice(0, 2)
      .forEach(c => {
        const name = c.hoTen || c.fullName || 'Khách hàng';
        activities.push({
          icon: 'fa-user-plus',
          color: '#f72585',
          text: `Khách hàng mới: ${name} đăng ký`,
          _sortTime: new Date(c.createdAt || c.updatedAt || 0).getTime(),
        });
      });

    activities.sort((a, b) => b._sortTime - a._sortTime);
    return activities.slice(0, 5);
  }, [orders, customers]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0₫';
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '—';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const statCards = [
    { title: 'Tổng sản phẩm', value: stats.totalProducts, icon: 'fa-motorcycle', color: '#4361ee', bg: '#eef0ff', link: '/admin/vehicles' },
    { title: 'Đơn hàng', value: stats.totalOrders, icon: 'fa-clipboard-list', color: '#f72585', bg: '#ffe0f0', link: '/admin/orders' },
    { title: 'Khách hàng', value: stats.totalCustomers, icon: 'fa-users', color: '#4cc9f0', bg: '#e0f7ff', link: '/admin/customers' },
    { title: 'Doanh thu', value: formatPrice(stats.revenue), icon: 'fa-chart-line', color: '#06d6a0', bg: '#e0fff0', link: '/admin/orders' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <Link to={card.link} className="stat-card-link" key={index} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ '--card-color': card.color, '--card-bg': card.bg }}>
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">{card.title}</span>
                <span className="stat-value">{card.value}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-clock-rotate-left"></i> Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="card-link">Xem tất cả</Link>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="table-loading"><i className="fa fa-spinner fa-spin"></i> Đang tải...</div>
            ) : recentOrders.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => {
                    const displayStatus = getDisplayStatus(order.trangThaiDonHang);
                    return (
                      <tr key={order._id || idx}>
                        <td><span className="order-id">#{(order._id || String(idx + 1)).slice(-6).toUpperCase()}</span></td>
                        <td>{order?.khachHang?.hoTen || '—'}</td>
                        <td>{order?.chiTiet?.xe?.dongXe?.tenDongXe || '—'}</td>
                        <td className="price-col">{formatPrice(order.tongTien)}</td>
                        <td>
                          <span className={`status-badge ${displayStatus.class}`}>
                            {displayStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-inbox"></i>
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-simple"></i> Thống kê nhanh</h3>
          </div>
          <div className="card-body">
            <div className="quick-stats">
              <div className="quick-stat-item">
                <div className="qsi-label">Đơn hôm nay</div>
                <div className="qsi-value">{quickStats.todayCount}</div>
                <div className={`qsi-change ${quickStats.todayChange >= 0 ? 'up' : 'down'}`}>
                  {quickStats.todayChange >= 0 ? '+' : ''}{quickStats.todayChange} so với hôm qua
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="qsi-label">Xe còn hàng</div>
                <div className="qsi-value">{quickStats.lowStock}</div>
                <div className="qsi-change up">Trong kho</div>
              </div>
              <div className="quick-stat-item">
                <div className="qsi-label">Doanh thu tháng</div>
                <div className="qsi-value price-col">{formatPrice(quickStats.monthRevenue)}</div>
                <div className={`qsi-change ${quickStats.monthChange >= 0 ? 'up' : 'down'}`}>
                  {quickStats.monthChange >= 0 ? '+' : ''}{quickStats.monthChange}% so với tháng trước
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3><i className="fa-solid fa-bolt"></i> Hoạt động gần đây</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="table-loading"><i className="fa fa-spinner fa-spin"></i> Đang tải...</div>
          ) : recentActivities.length > 0 ? (
            <div className="activity-list">
              {recentActivities.map((activity, idx) => (
                <div className="activity-item" key={idx}>
                  <div className="activity-icon" style={{ color: activity.color }}>
                    <i className={`fa-solid ${activity.icon}`}></i>
                  </div>
                  <div className="activity-info">
                    <p className="activity-text">{activity.text}</p>
                    <span className="activity-time">{formatTimeAgo(activity._sortTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>Chưa có hoạt động nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
