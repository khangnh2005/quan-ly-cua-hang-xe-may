import { getCookie , setCookie } from '../../helpers/cookie';
import '../../css/style.scss';
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { post, uploadFile, get } from '../../untils/requests';
import { Button, Space } from 'antd';

// Helper để lưu/đọc avatar ở localStorage (không bị xóa khi logout)
const LS_AVATAR_KEY = 'saved_avatar';
function getSavedAvatar() {
  return localStorage.getItem(LS_AVATAR_KEY) || '';
}
function saveAvatarToLocal(avatarUrl) {
  if (avatarUrl) localStorage.setItem(LS_AVATAR_KEY, avatarUrl);
}

// Status map giống AdminOrders
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

function Profile() {
  const savedAvatar = getSavedAvatar();
  const [avatarUrl, setAvatarUrl] = useState(savedAvatar || 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);
  const getAvatarFromData = (obj) => obj?.avatar || obj?.avatarPath || '';
  const fullNameFromCookie = getCookie('fullName') || getCookie('hoTen') || '';
  const userId = getCookie('userId') || '';
  const user = {
    hoTen: fullNameFromCookie,
    fullName: fullNameFromCookie,
    email: getCookie('email') || '',
    soDienThoai: getCookie('phoneNumber') || getCookie('soDienThoai') || '',
    diaChi: getCookie('address') || getCookie('diaChi') || '',
    cccd: getCookie('cccd') || '',
    avatar: getCookie('avatar') || getCookie('avatarPath') || getSavedAvatar(),
    trangThai: getCookie('trangThai') === 'true',
    userId: userId,
  };

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
      hoTen: getCookie('fullName') || getCookie('hoTen') || '',
      email: getCookie('email') || '',
      soDienThoai: getCookie('phoneNumber') || getCookie('soDienThoai') || '',
      cccd: getCookie('cccd') || '',
      diaChi: getCookie('address') || getCookie('diaChi') || '',
      avatar: getCookie('avatar') || getCookie('avatarPath') || getSavedAvatar(),
  });

  // State cho tab & lịch sử mua hàng
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Khôi phục avatar từ localStorage khi mount (tồn tại qua logout)
  useEffect(() => {
    const saved = getSavedAvatar();
    if (saved && avatarUrl === 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg') {
      setAvatarUrl(saved);
    }
  }, []);

  const handleOpenEdit = () => {
    const sourceData = updateResult || userData || user;

    setEditForm({
      hoTen: sourceData.fullName || sourceData.hoTen || '',
      email: sourceData.email || '',
      soDienThoai: sourceData.phoneNumber || sourceData.soDienThoai || '',
      cccd: sourceData.cccd || '',
      diaChi: sourceData.address || sourceData.diaChi || '',
      avatar: getAvatarFromData(sourceData) || avatarUrl,
    });

    setShowModal(true);
  };



  // Cập nhật state khi gõ
  const handleInput = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Xử lý upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không vượt quá 5MB!');
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    setUploading(true);
    try {
      // Create FormData and append avatar file
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload to server to get URL
      const res = await uploadFile('uploads/single', formData);
      // Backend trả về URL trong res.data (ví dụ: res.data = { url: "..." })
      const newAvatarUrl = res?.data?.url || res?.data || res?.avatarUrl || res?.url;

      if (newAvatarUrl) {
        // Chỉ cập nhật state; ảnh chỉ lưu vĩnh viễn sau khi bấm "Lưu thay đổi"
        setAvatarUrl(newAvatarUrl);
        setEditForm(prev => ({ ...prev, avatar: newAvatarUrl }));
        message.success('Tải ảnh lên thành công!');
      } else {
        message.error('Không lấy được URL ảnh từ server!');
        setAvatarUrl(getCookie('avatar') || 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
      message.error('Upload ảnh thất bại! Vui lòng thử lại.');
      setAvatarUrl(getCookie('avatar') || 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userId = user.userId;
      if (!userId) {
        message.error('Không tìm thấy thông tin người dùng!');
        setSubmitting(false);
        return;
      }

      const payload = {
        fullName: editForm.hoTen,
        email: editForm.email,
        phoneNumber: editForm.soDienThoai,
        address: editForm.diaChi,
        cccd: editForm.cccd,
        avatar: editForm.avatar || avatarUrl,
        avatarPath: editForm.avatar || avatarUrl
      };

      const res = await post(`customers/update/${userId}`, payload);
      console.log('Update response:', res);

      // Lấy data từ response API (ưu tiên res.user, res.data, hoặc chính res)
      const updatedUser = res?.user || res?.data || res;

      if (updatedUser && (updatedUser.id || updatedUser._id || updatedUser.fullName)) {
        message.success('Cập nhật thành công!');
        const finalAvatar = getAvatarFromData(updatedUser) || payload.avatar || avatarUrl;

        // Cập nhật cookies (30 ngày)
        setCookie('fullName', updatedUser.fullName || editForm.hoTen, 30);
        setCookie('hoTen', updatedUser.hoTen || editForm.hoTen, 30);
        setCookie('phoneNumber', updatedUser.phoneNumber || editForm.soDienThoai, 30);
        setCookie('soDienThoai', updatedUser.soDienThoai || editForm.soDienThoai, 30);
        setCookie('address', updatedUser.address || editForm.diaChi, 30);
        setCookie('diaChi', updatedUser.diaChi || editForm.diaChi, 30);
        setCookie('email', updatedUser.email || editForm.email, 30);
        setCookie('cccd', updatedUser.cccd || editForm.cccd, 30);
        setCookie('avatar', updatedUser.avatar, 30);
        setCookie('avatarPath', finalAvatar, 30);
        saveAvatarToLocal(finalAvatar);
        setAvatarUrl(finalAvatar);
        
        // Đồng bộ state từ dữ liệu mới để hiển thị ngay và giữ nhất quán
        const mergedUser = { ...updatedUser, avatar: finalAvatar, avatarPath: finalAvatar };
        setUserData(mergedUser);
        setUpdateResult(mergedUser);
        setEditForm((prev) => ({ ...prev, avatar: finalAvatar }));

        setShowModal(false);
      } else {
        const errMsg = res?.message || JSON.stringify(res) || 'Cập nhật thất bại!';
        message.error(errMsg);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      message.error('Cập nhật thất bại! Vui lòng kiểm tra Console.');
    } finally {
      setSubmitting(false);
    }
  };

  // Lấy thông tin hiển thị: ưu tiên data từ response update, fallback về cookie (user)
  const data = updateResult || userData || user;

  // ===== XỬ LÝ LỊCH SỬ MUA HÀNG =====
  const fetchOrders = async () => {
    if (ordersFetched) return;
    setOrdersLoading(true);
    try {
      const res = await get('orders');
      console.log('Profile - Orders API response:', res);
      const list = Array.isArray(res) ? res : (res?.data || []);
      // Lọc đơn hàng theo userId hiện tại
      const myOrders = list.filter(o => {
        const khId = o.khachHang?._id || o.khachHang?.id || '';
        return khId === userId;
      });
      setOrders(myOrders);
      setOrdersFetched(true);
    } catch (err) {
      console.error('Fetch orders error:', err);
      message.error('Không thể tải lịch sử mua hàng');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders' && !ordersFetched) {
      fetchOrders();
    }
  };

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
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

  const getPaymentMethod = (order) => {
    if (order.trangThaiDonHang === 'DaThanhToan' || order.trangThaiDonHang === 'Đã thanh toán') {
      return 'Chuyển khoản';
    }
    return 'Chưa thanh toán';
  };

  // Render chi tiết đơn hàng (modal)
  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;
    const order = selectedOrder;
    const xe = order?.chiTiet?.xe || {};
    const dongXe = xe?.dongXe || {};
    const loaiXe = dongXe?.loaiXe || {};
    const displayStatus = getDisplayStatus(order.trangThaiDonHang);

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
            <button type="button" className="profile-btn-secondary" onClick={handleCloseDetail}>
              <i className="fa-solid fa-xmark"></i> Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render danh sách đơn hàng
  const renderOrderHistory = () => {
    return (
      <div className="profile-order-history">
        <h2 className="profile-title">Lịch sử mua hàng</h2>
        <p className="profile-subtitle">Theo dõi tình trạng đơn hàng của bạn</p>

        {ordersLoading ? (
          <div className="profile-orders-loading">
            <i className="fa fa-spinner fa-spin"></i> Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className="profile-orders-empty">
            <i className="fa-solid fa-box-open"></i>
            <h3>Bạn chưa có đơn hàng nào</h3>
            <p>Khi bạn đặt mua xe, đơn hàng sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="profile-orders-list">
            {orders.map((order, idx) => {
              const displayStatus = getDisplayStatus(order.trangThaiDonHang);
              const xe = order?.chiTiet?.xe || {};
              const dongXe = xe?.dongXe || {};
              return (
                <div key={order._id || idx} className="profile-order-card">
                  <div className="profile-order-card-left">
                    {xe.hinhAnh && xe.hinhAnh.length > 0 && xe.hinhAnh[0] && xe.hinhAnh[0].trim() ? (
                      <img
                        src={xe.hinhAnh[0]}
                        alt={dongXe.tenDongXe || 'xe'}
                        className="profile-order-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="profile-order-img-placeholder">
                        <i className="fa-solid fa-motorcycle"></i>
                      </div>
                    )}
                  </div>
                  <div className="profile-order-card-body">
                    <div className="profile-order-card-header">
                      <div className="profile-order-id">
                        <i className="fa-solid fa-receipt"></i> #{order._id ? order._id.slice(-6).toUpperCase() : ''}
                      </div>
                      <span className={`status-badge ${displayStatus.class}`}>
                        {displayStatus.label}
                      </span>
                    </div>
                    <div className="profile-order-product">
                      <strong>{dongXe.tenDongXe || 'Không xác định'}</strong>
                      {xe.mauSac && <span> - {xe.mauSac}</span>}
                    </div>
                    <div className="profile-order-meta">
                      <span className="profile-order-date">
                        <i className="fa-regular fa-calendar"></i> {formatDate(order.ngayDat)}
                      </span>
                      <span className="profile-order-total">
                        Tổng: <strong>{formatPrice(order.tongTien)}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="profile-order-card-action">
                    <button
                      className="profile-btn-view"
                      onClick={() => handleViewOrderDetail(order)}
                      title="Xem chi tiết"
                    >
                      <i className="fa-solid fa-eye"></i>
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-header">
            <div className="profile-avatar">
              <img
                src={data.avatar}
                alt="avatar"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                }}
              />
            </div>
            <p className="profile-avatar-hint">Ảnh đại diện</p>
            {/* Avatar upload button in sidebar */}
            <label className="profile-avatar-upload-btn">
              <i className="fa-solid fa-camera"></i>
              <span>Đổi ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {uploading && (
              <p className="profile-avatar-uploading">
                <i className="fa fa-spinner fa-spin"></i> Đang upload...
              </p>
            )}
          </div>
          <ul className="profile-menu">
            <li
              className={`profile-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabClick('profile')}
            >
              <i className="fa-solid fa-user"></i>
              <span>Hồ sơ của tôi</span>
            </li>
            <li
              className={`profile-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabClick('orders')}
            >
              <i className="fa-solid fa-box"></i>
              <span>Lịch sử mua hàng</span>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {activeTab === 'profile' && (
            <>
              <h2 className="profile-title">Thông tin cá nhân</h2>
              <p className="profile-subtitle">
                Quản lý thông tin cá nhân để bảo mật tài khoản của bạn
              </p>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Họ và tên</label>
                  <p>{data.fullName || data.hoTen || 'Chưa cập nhật'}</p>
                </div>
                <div className="profile-info-item">
                  <label>Email</label>
                  <p>{data.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="profile-info-item">
                  <label>Số điện thoại</label>
                  <p>{data.phoneNumber || data.soDienThoai || 'Chưa cập nhật'}</p>
                </div>
                <div className="profile-info-item">
                  <label>CCCD</label>
                  <p>{data.cccd || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="profile-info-item" style={{ marginBottom: '20px' }}>
                <label>Địa chỉ</label>
                <p>{data.address || data.diaChi || 'Chưa cập nhật'}</p>
              </div>

              <button className="profile-btn-edit" onClick={handleOpenEdit}>
                <i className="fa-solid fa-pen"></i> Chỉnh sửa hồ sơ
              </button>
            </>
          )}

          {activeTab === 'orders' && renderOrderHistory()}
        </div>
      </div>

      {/* Modal chỉnh sửa hồ sơ */}
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-container">
      <h3>Chỉnh sửa hồ sơ</h3>
      
      {/* Avatar upload section in modal */}
      <div className="modal-avatar-section">
        <label>Ảnh đại diện</label>
        <div className="modal-avatar-upload">
          <img src={data.avatar} alt="avatar preview" className="modal-avatar-preview" />
          <label className="modal-avatar-btn">
            <i className="fa-solid fa-camera"></i>
            <span>Chọn ảnh khác</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          {uploading && (
            <span className="modal-avatar-uploading">
              <i className="fa fa-spinner fa-spin"></i> Đang upload...
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div className="modal-field">
          <label>Họ và tên</label>
          <input name="hoTen" value={editForm.hoTen} onChange={handleInput} />
        </div>
        <div className="modal-field">
          <label>Số điện thoại</label>
          <input name="soDienThoai" value={editForm.soDienThoai} onChange={handleInput} />
        </div>
        <div className="modal-field">
          <label>Địa chỉ</label>
          <input name="diaChi" value={editForm.diaChi} onChange={handleInput} />
        </div>
        <div className="modal-field">
          <label>Email</label>
          <input name="email" value={editForm.email} onChange={handleInput} />
        </div>
        <div className="modal-field">
          <label>CCCD</label>
          <input name="cccd" value={editForm.cccd} onChange={handleInput} />
        </div>

        <div className="modal-footer" style={{ textAlign: 'right', marginTop: '20px' }}>
          <Space>
            <Button onClick={() => setShowModal(false)}>
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && renderOrderDetailModal()}
    </div>
  );
}

export default Profile;