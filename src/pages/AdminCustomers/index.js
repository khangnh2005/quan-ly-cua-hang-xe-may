import { useState } from 'react';
import '../../css/admin.scss';

const sampleCustomers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0901234567', totalOrders: 2, totalSpent: 127000000, joined: '15/03/2026' },
  { id: 2, name: 'Trần Thị B', email: 'thib@gmail.com', phone: '0912345678', totalOrders: 1, totalSpent: 45000000, joined: '20/04/2026' },
  { id: 3, name: 'Lê Văn C', email: 'vanc@gmail.com', phone: '0923456789', totalOrders: 3, totalSpent: 96000000, joined: '05/02/2026' },
  { id: 4, name: 'Phạm Thị D', email: 'thid@gmail.com', phone: '0934567890', totalOrders: 1, totalSpent: 55000000, joined: '10/05/2026' },
  { id: 5, name: 'Hoàng Văn E', email: 'vane@gmail.com', phone: '0945678901', totalOrders: 0, totalSpent: 0, joined: '01/06/2026' },
];

function AdminCustomers() {
  const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';

  return (
    <div className="admin-customers">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Tìm kiếm khách hàng..." />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-secondary">
            <i className="fa-solid fa-file-csv"></i> Xuất danh sách
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="admin-table full-width">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Số đơn hàng</th>
                <th>Tổng chi tiêu</th>
                <th>Ngày tham gia</th>
                <th style={{ width: '80px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sampleCustomers.map((customer, idx) => (
                <tr key={customer.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <span>{customer.name}</span>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td><span className="order-count">{customer.totalOrders}</span></td>
                  <td className="price-col">{formatPrice(customer.totalSpent)}</td>
                  <td>{customer.joined}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon view" title="Xem"><i className="fa-solid fa-eye"></i></button>
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

export default AdminCustomers;