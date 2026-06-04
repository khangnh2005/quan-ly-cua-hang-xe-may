import { useState, useEffect } from 'react';
import { message } from 'antd';
import { get, post } from '../../../untils/requests';
import '../../../css/admin.scss';

const statusMap = {
  DaThanhToan: { label: 'Đã thanh toán', class: 'success' },
  ChoXuLy: { label: 'Chờ xử lý', class: 'info' },
  DangXuLy: { label: 'Đang xử lý', class: 'warning' },
  DaHuy: { label: 'Đã hủy', class: 'danger' },
};

// Fallback map for Vietnamese keys
const statusVnMap = {
  'Đã thanh toán': 'DaThanhToan',
  'Chờ xử lý': 'ChoXuLy',
  'Đang xử lý': 'DangXuLy',
  'Đã hủy': 'DaHuy',
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    trangThaiDonHang: '',
    ghiChu: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
   
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await get('orders');
      console.log('Orders API response:', res);
      const list = Array.isArray(res) ? res : (res?.data || []);
      console.log('Orders list:', list);
      setOrders(list);
    } catch (err) {
      console.error('Fetch orders error:', err);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => (price || 0).toLocaleString('vi-VN') + '₫';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) { return ''; }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) { return ''; }
  };

  const normalizeStatus = (status) => {
    if (!status) return status;
    if (statusVnMap[status]) return statusVnMap[status];
    if (statusMap[status]) return status;
    const found = Object.keys(statusMap).find(
      (k) => k.toLowerCase() === status?.toLowerCase()
    );
    return found || status;
  };

  const getDisplayStatus = (status) => {
    const key = normalizeStatus(status);
    return statusMap[key] || { label: status || 'Không xác định', class: 'default' };
  };

  const getProductName = (order) => {
    return order?.chiTiet?.xe?.dongXe?.tenDongXe || '';
  };

  const getPaymentMethod = (order) => {
    if (order.trangThaiDonHang === 'DaThanhToan' || order.trangThaiDonHang === 'Đã thanh toán') {
      return 'Chuyển khoản';
    }
    return 'Chưa thanh toán';
  };

  const getVehicleStatus = (trangThaiXe) => {
    if (trangThaiXe === 'ConHang') return { label: 'Còn hàng', class: 'success' };
    if (trangThaiXe === 'DaBan') return { label: 'Đã bán', class: 'danger' };
    return null;
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setEditFormData({
      trangThaiDonHang: normalizeStatus(order.trangThaiDonHang),
      ghiChu: order.ghiChu || '',
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditOrder(null);
    setEditFormData({ trangThaiDonHang: '', ghiChu: '' });
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editOrder || !editFormData.trangThaiDonHang) {
      message.warning('Vui lòng chọn trạng thái đơn hàng');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        trangThaiDonHang: editFormData.trangThaiDonHang,
      };
      if (editFormData.ghiChu) {
        payload.ghiChu = editFormData.ghiChu;
      }
      const res = await post(`orders/update/${editOrder._id}`, payload);
      if (res._ok || res.success) {
        message.success('Cập nhật đơn hàng thành công');
        handleCloseEdit();
        fetchOrders();
      } else {
        message.error(res.message || 'Không thể cập nhật đơn hàng');
      }
    } catch (err) {
      console.error('Update order error:', err);
      message.error('Lỗi khi cập nhật đơn hàng');
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => {
        const key = normalizeStatus(o.trangThaiDonHang);
        return key === filter;
      });

  const filterTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'ChoXuLy', label: 'Chờ xử lý' },
    { key: 'DangXuLy', label: 'Đang xử lý' },
    { key: 'DaThanhToan', label: 'Đã thanh toán' },
    { key: 'DaHuy', label: 'Đã hủy' },
  ];

  const renderDetailModal = () => {
    if (!selectedOrder) return null;
    const order = selectedOrder;
    const xe = order?.chiTiet?.xe || {};
    const dongXe = xe?.dongXe || {};
    const loaiXe = dongXe?.loaiXe || {};
    const displayStatus = getDisplayStatus(order.trangThaiDonHang);
    const xeStatus = getVehicleStatus(xe.trangThaiXe);
    
    return (
      <div className="modal-overlay" onClick={handleCloseDetail}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h3>
              <i className="fa-solid fa-receipt"></i> Chi tiết đơn hàng
              <span style={{ fontSize: '14px', marginLeft: '10px', fontWeight: 'normal', color: '#666' }}>
                #{order._id ? order._id.slice(-6).toUpperCase() : ''}
              </span>
            </h3>
            <button className="modal-close" onClick={handleCloseDetail}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="modal-body">
            {/* Thông tin đơn hàng */}
            <div className="modal-section">
              <h4 className="section-label"><i className="fa-solid fa-circle-info"></i> Thông tin đơn hàng</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Mã đơn hàng:</span>
                  <span className="detail-value">#{order._id ? order._id.slice(-6).toUpperCase() : ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày đặt:</span>
                  <span className="detail-value">{formatDateTime(order.ngayDat)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tổng tiền:</span>
                  <span className="detail-value" style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '16px' }}>
                    {formatPrice(order.tongTien)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${displayStatus.class}`}>{displayStatus.label}</span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Thanh toán:</span>
                  <span className="detail-value">{getPaymentMethod(order)}</span>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="modal-section">
              <h4 className="section-label"><i className="fa-solid fa-user"></i> Thông tin khách hàng</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Họ tên:</span>
                  <span className="detail-value">{order.khachHang?.hoTen || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{order.khachHang?.email || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số điện thoại:</span>
                  <span className="detail-value">{order.khachHang?.soDienThoai || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">CCCD:</span>
                  <span className="detail-value">{order.khachHang?.cccd || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Địa chỉ:</span>
                  <span className="detail-value">{order.khachHang?.diaChi || ''}</span>
                </div>
              </div>
            </div>

            {/* Thông tin nhân viên xử lý */}
            {order.nhanVien && (
              <div className="modal-section">
                <h4 className="section-label"><i className="fa-solid fa-user-tie"></i> Nhân viên xử lý</h4>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Họ tên:</span>
                    <span className="detail-value">{order.nhanVien.hoTen || ''}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{order.nhanVien.email || ''}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">{order.nhanVien.soDienThoai || ''}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin sản phẩm đã mua */}
            <div className="modal-section">
              <h4 className="section-label"><i className="fa-solid fa-motorcycle"></i> Sản phẩm đã mua</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Dòng xe:</span>
                  <span className="detail-value">{dongXe.tenDongXe || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Loại xe:</span>
                  <span className="detail-value">{loaiXe.tenLoaiXe || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Màu sắc:</span>
                  <span className="detail-value">{xe.mauSac || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Năm sản xuất:</span>
                  <span className="detail-value">{xe.namSanXuat || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số khung:</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace' }}>{xe.soKhung || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số máy:</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace' }}>{xe.soMay || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái xe:</span>
                  <span className="detail-value">
                    {xeStatus ? (
                      <span className={`status-badge ${xeStatus.class}`}>{xeStatus.label}</span>
                    ) : ''}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Giá bán:</span>
                  <span className="detail-value" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                    {formatPrice(order.chiTiet?.giaBan)}
                  </span>
                </div>
              </div>
              {xe.hinhAnh && xe.hinhAnh.length > 0 && xe.hinhAnh[0] && xe.hinhAnh[0].trim() && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={xe.hinhAnh[0]}
                    alt={dongXe.tenDongXe || 'xe'}
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-admin-secondary" onClick={handleCloseDetail}>
              <i className="fa-solid fa-xmark"></i> Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editOrder) return null;
    const order = editOrder;
    const displayStatus = getDisplayStatus(order.trangThaiDonHang);

    return (
      <div className="modal-overlay" onClick={handleCloseEdit}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
          <div className="modal-header">
            <h3>
              <i className="fa-solid fa-pen-to-square"></i> Sửa đơn hàng
              <span style={{ fontSize: '14px', marginLeft: '10px', fontWeight: 'normal', color: '#666' }}>
                #{order._id ? order._id.slice(-6).toUpperCase() : ''}
              </span>
            </h3>
            <button className="modal-close" onClick={handleCloseEdit}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-section">
              <h4 className="section-label"><i className="fa-solid fa-circle-info"></i> Thông tin đơn hàng</h4>
              <div className="detail-grid" style={{ marginBottom: '20px' }}>
                <div className="detail-row">
                  <span className="detail-label">Khách hàng:</span>
                  <span className="detail-value">{order.khachHang?.hoTen || ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sản phẩm:</span>
                  <span className="detail-value">{getProductName(order)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tổng tiền:</span>
                  <span className="detail-value" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                    {formatPrice(order.tongTien)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái hiện tại:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${displayStatus.class}`}>{displayStatus.label}</span>
                  </span>
                </div>
              </div>

              <div className="modal-field">
                <label>Trạng thái đơn hàng <span className="required">*</span></label>
                <select
                  value={editFormData.trangThaiDonHang}
                  onChange={(e) => handleEditInputChange('trangThaiDonHang', e.target.value)}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {Object.entries(statusMap).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Ghi chú</label>
                <textarea
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)..."
                  value={editFormData.ghiChu}
                  onChange={(e) => handleEditInputChange('ghiChu', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-admin-secondary" onClick={handleCloseEdit}>
              <i className="fa-solid fa-xmark"></i> Hủy
            </button>
            <button
              type="button"
              className="btn-admin-primary"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <><i className="fa fa-spinner fa-spin"></i> Đang lưu...</>
              ) : (
                <><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-orders">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="filter-tabs">
            {filterTabs.map((tab) => (
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
          
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="table-loading"><i className="fa fa-spinner fa-spin"></i> Đang tải...</div>
          ) : (
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
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const displayStatus = getDisplayStatus(order.trangThaiDonHang);
                    return (
                      <tr key={order._id || idx}>
                        <td>
                          <span className="order-id">
                            #{order._id ? order._id.slice(-6).toUpperCase() : ''}
                          </span>
                        </td>
                        <td>{order.khachHang?.hoTen || ''}</td>
                        <td>{getProductName(order)}</td>
                        <td className="price-col">{formatPrice(order.tongTien)}</td>
                        <td>{formatDate(order.ngayDat)}</td>
                        <td>{getPaymentMethod(order)}</td>
                        <td>
                          <span className={`status-badge ${displayStatus.class}`}>
                            {displayStatus.label}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon view" title="Chi tiết" onClick={() => handleViewDetail(order)}>
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button className="btn-icon edit" title="Sửa" onClick={() => handleEdit(order)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {renderDetailModal()}

      {/* Edit Modal */}
      {showEditModal && renderEditModal()}
    </div>
  );
}

export default AdminOrders;