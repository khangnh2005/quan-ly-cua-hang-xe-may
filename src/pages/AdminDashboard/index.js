import { useState, useEffect } from 'react';
import { get } from '../../untils/requests';
import '../../css/admin.scss';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, ordersRes] = await Promise.all([
          get('vehicles'),
          get('orders'),
        ]);
        setStats({
          totalProducts: vehiclesRes?.data?.length || 0,
          totalOrders: ordersRes?.data?.length || 0,
          totalCustomers: ordersRes?.customers || 12,
          revenue: ordersRes?.revenue || 185000000,
        });
        setRecentOrders(ordersRes?.data?.slice(0, 5) || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price) => {
    if (!price) return '0₫';
    return price.toLocaleString('vi-VN') + '₫';
  };

  const statCards = [
    { title: 'Tổng sản phẩm', value: stats.totalProducts, icon: 'fa-motorcycle', color: '#4361ee', bg: '#eef0ff' },
    { title: 'Đơn hàng', value: stats.totalOrders, icon: 'fa-clipboard-list', color: '#f72585', bg: '#ffe0f0' },
    { title: 'Khách hàng', value: stats.totalCustomers, icon: 'fa-users', color: '#4cc9f0', bg: '#e0f7ff' },
    { title: 'Doanh thu', value: formatPrice(stats.revenue), icon: 'fa-chart-line', color: '#06d6a0', bg: '#e0fff0' },
  ];

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div className="stat-card" key={index} style={{ '--card-color': card.color, '--card-bg': card.bg }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">{card.title}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-clock-rotate-left"></i> Đơn hàng gần đây</h3>
            <a href="/admin/orders" className="card-link">Xem tất cả</a>
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
                  {recentOrders.map((order, idx) => (
                    <tr key={order._id || idx}>
                      <td><span className="order-id">#{String(order._id || idx + 1).slice(-6)}</span></td>
                      <td>{order.customerName || 'Nguyễn Văn A'}</td>
                      <td>{order.productName || 'Xe máy'}</td>
                      <td className="price-col">{formatPrice(order.totalAmount || 45000000)}</td>
                      <td>
                        <span className={`status-badge ${(order.status || 'pending') === 'completed' ? 'success' : 'warning'}`}>
                          {order.status === 'completed' ? 'Hoàn thành' : 'Chờ xử lý'}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                <div className="qsi-value">3</div>
                <div className="qsi-change up">+2 so với hôm qua</div>
              </div>
              <div className="quick-stat-item">
                <div className="qsi-label">Tồn kho thấp</div>
                <div className="qsi-value">2</div>
                <div className="qsi-change down">Cần nhập thêm</div>
              </div>
              <div className="quick-stat-item">
                <div className="qsi-label">Doanh thu tháng</div>
                <div className="qsi-value price-col">{formatPrice(85000000)}</div>
                <div className="qsi-change up">+15% so với tháng trước</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3><i className="fa-solid fa-bolt"></i> Hoạt động gần đây</h3>
        </div>
        <div className="card-body">
          <div className="activity-list">
            {[
              { icon: 'fa-plus-circle', color: '#06d6a0', text: 'Thêm sản phẩm mới: Honda SH 2025', time: '2 phút trước' },
              { icon: 'fa-check-circle', color: '#4361ee', text: 'Đơn hàng #12345 đã được xác nhận', time: '15 phút trước' },
              { icon: 'fa-user-plus', color: '#f72585', text: 'Khách hàng mới: Trần Thị B đăng ký', time: '1 giờ trước' },
              { icon: 'fa-truck', color: '#ff9f1c', text: 'Đơn hàng #12340 đã giao thành công', time: '2 giờ trước' },
              { icon: 'fa-exclamation-triangle', color: '#e63946', text: 'Tồn kho xe Vision sắp hết', time: '3 giờ trước' },
            ].map((activity, idx) => (
              <div className="activity-item" key={idx}>
                <div className="activity-icon" style={{ color: activity.color }}>
                  <i className={`fa-solid ${activity.icon}`}></i>
                </div>
                <div className="activity-info">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;