import { useState } from 'react';
import '../../css/admin.scss';

const sampleOrders = [
  { id: '#12345', customer: 'Nguyễn Văn A', product: 'Honda SH 2025', amount: 85000000, date: '01/06/2026', status: 'completed', payment: 'Chuyển khoản' },
  { id: '#12344', customer: 'Trần Thị B', product: 'Yamaha Exciter', amount: 45000000, date: '31/05/2026', status: 'processing', payment: 'Tiền mặt' },
  { id: '#12343', customer: 'Lê Văn C', product: 'Honda Vision', amount: 32000000, date: '30/05/2026', status: 'pending', payment: 'Trả góp' },
  { id: '#12342', customer: 'Phạm Thị D', product: 'Suzuki Raider', amount: 55000000, date: '29/05/2026', status: 'completed', payment: 'Chuyển khoản' },
  { id: '#12341', customer: 'Hoàng Văn E', product: 'Honda Air Blade', amount: 42000000, date: '28/05/2026', status: 'cancelled', payment: 'Tiền mặt' },
  { id: '#12340', customer: 'Đặng Thị F', product: 'Yamaha Janus', amount: 38000000, date: '27/05/2026', status: 'completed', payment: 'Chuyển khoản' },
];

const statusMap = {
  completed: { label: 'Hoàn thành', class: 'success' },
  processing: { label: 'Đang xử lý', class: 'warning' },
  pending: { label: 'Chờ xác nhận', class: 'info' },
  cancelled: { label: 'Đã hủy', class: 'danger' },
};

function AdminOrders() {
  const [filter, setFilter] = useState('all');

  const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';

  const filteredOrders = filter === 'all' ? sampleOrders : sampleOrders.filter(o => o.status === filter);

  return (
    <div className="admin-orders">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: 'Chờ xác nhận' },
              { key: 'processing', label: 'Đang xử lý' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-secondary">
            <i className="fa-solid fa-file-export"></i> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="admin-table full-width">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Số tiền</th>
                <th>Ngày đặt</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => (
                <tr key={idx}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td className="price-col">{formatPrice(order.amount)}</td>
                  <td>{order.date}</td>
                  <td>{order.payment}</td>
                  <td>
                    <span className={`status-badge ${statusMap[order.status]?.class}`}>
                      {statusMap[order.status]?.label}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon view" title="Chi tiết"><i className="fa-solid fa-eye"></i></button>
                      <button className="btn-icon edit" title="Sửa"><i className="fa-solid fa-pen"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;