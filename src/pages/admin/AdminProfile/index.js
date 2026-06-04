import { useState, useEffect, useRef } from 'react';
import { message, Space } from 'antd';
import { getCookie, setCookie } from '../../../helpers/cookie';
import { get, post, uploadFile } from '../../../untils/requests';
import '../../../css/admin.scss';

// Helper lấy thông tin admin từ cookies + localStorage
const LS_ADMIN_INFO = 'adminInfo';
const LS_ADMIN_AVATAR = 'adminAvatar';

function getAdminInfo() {
  // Ưu tiên localStorage adminInfo (lưu đầy đủ object từ lúc login)
  try {
    const raw = localStorage.getItem(LS_ADMIN_INFO);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function saveAdminInfo(info) {
  if (!info) return;
  try {
    localStorage.setItem(LS_ADMIN_INFO, JSON.stringify(info));
  } catch (e) { /* ignore */ }
}

function getSavedAvatar() {
  return localStorage.getItem(LS_ADMIN_AVATAR) || '';
}

function saveAvatarToLocal(url) {
  if (url) localStorage.setItem(LS_ADMIN_AVATAR, url);
}

const DEFAULT_AVATAR =
  'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg';

function AdminProfile() {
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(null); // dữ liệu từ server
  const [updateResult, setUpdateResult] = useState(null); // dữ liệu sau update
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Build thông tin cơ bản từ cookies + localStorage (display ngay khi mount)
  const initialFromStorage = (() => {
    const stored = getAdminInfo() || {};
    return {
      _id: stored._id || stored.id || getCookie('adminId') || '',
      hoTen: stored.hoTen || getCookie('adminName') || '',
      tenDangNhap: stored.tenDangNhap || getCookie('adminUsername') || '',
      email: stored.email || getCookie('adminEmail') || '',
      soDienThoai: stored.soDienThoai || stored.phoneNumber || '',
      diaChi: stored.diaChi || stored.address || '',
      vaiTro: stored.vaiTro || { tenVaiTro: getCookie('adminRole') || 'Admin' },
      avatar: stored.avatar || stored.avatarPath || getSavedAvatar() || DEFAULT_AVATAR,
      trangThai: stored.trangThai !== undefined ? stored.trangThai : true,
      ngayTao: stored.ngayTao || stored.createdAt || '',
    };
  })();

  const [avatarUrl, setAvatarUrl] = useState(
    initialFromStorage.avatar || DEFAULT_AVATAR
  );

  // Form chỉnh sửa
  const [editForm, setEditForm] = useState({
    hoTen: initialFromStorage.hoTen || '',
    email: initialFromStorage.email || '',
    soDienThoai: initialFromStorage.soDienThoai || '',
    diaChi: initialFromStorage.diaChi || '',
    avatar: initialFromStorage.avatar || DEFAULT_AVATAR,
  });

  // ===== Fetch thông tin admin từ server =====
  const fetchAdminProfile = async () => {
    const stored = getAdminInfo();
    const adminId = initialFromStorage._id || (stored?._id || stored?.id || '');

    if (!adminId) {
      // Không có id → dùng data local
      setUserData(initialFromStorage);
      return;
    }

    setLoading(true);
    try {
      // Gọi API lấy thông tin admin (employees)
      const res = await get(`admin/employees/${adminId}`);
      console.log('AdminProfile - API response:', res);

      const data = res?.user || res?.data || (res && !res.message ? res : null);
      if (data && (data._id || data.id || data.tenDangNhap || data.hoTen)) {
        setUserData(data);
        // đồng bộ localStorage
        saveAdminInfo({ ...getAdminInfo(), ...data });
        const fetchedAvatar = data.avatar || data.avatarPath;
        if (fetchedAvatar) {
          setAvatarUrl(fetchedAvatar);
          saveAvatarToLocal(fetchedAvatar);
        }
      } else {
        setUserData(initialFromStorage);
      }
    } catch (err) {
      console.error('Fetch admin profile error:', err);
      // fallback dùng data từ cookies/localStorage
      setUserData(initialFromStorage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dữ liệu hiển thị: ưu tiên data từ update → server → storage
  const data = updateResult || userData || initialFromStorage;

  // ===== Mở modal edit =====
  const handleOpenEdit = () => {
    setEditForm({
      hoTen: data.hoTen || data.fullName || '',
      email: data.email || '',
      soDienThoai: data.soDienThoai || data.phoneNumber || '',
      diaChi: data.diaChi || data.address || '',
      avatar: data.avatar || data.avatarPath || avatarUrl,
    });
    setShowEditModal(true);
  };

  const handleInput = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ===== Upload avatar =====
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không vượt quá 5MB!');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await uploadFile('uploads/single', formData);
      const newUrl = res?.data?.url || res?.data || res?.avatarUrl || res?.url;
      if (newUrl) {
        setAvatarUrl(newUrl);
        setEditForm((prev) => ({ ...prev, avatar: newUrl }));
        message.success('Tải ảnh lên thành công!');
      } else {
        message.error('Không lấy được URL ảnh từ server!');
        setAvatarUrl(data.avatar || data.avatarPath || DEFAULT_AVATAR);
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
      message.error('Upload ảnh thất bại! Vui lòng thử lại.');
      setAvatarUrl(data.avatar || data.avatarPath || DEFAULT_AVATAR);
    } finally {
      setUploading(false);
      // reset input value để có thể chọn lại cùng 1 file
      if (e.target) e.target.value = '';
    }
  };

  // ===== Submit update thông tin =====
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const adminId = data._id || data.id || initialFromStorage._id;
    if (!adminId) {
      message.error('Không tìm thấy ID admin để cập nhật!');
      return;
    }
    if (!editForm.hoTen.trim()) {
      message.error('Vui lòng nhập họ tên!');
      return;
    }
    if (!editForm.email.trim()) {
      message.error('Vui lòng nhập email!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hoTen: editForm.hoTen.trim(),
        fullName: editForm.hoTen.trim(),
        email: editForm.email.trim(),
        soDienThoai: editForm.soDienThoai.trim(),
        phoneNumber: editForm.soDienThoai.trim(),
        diaChi: editForm.diaChi.trim(),
        address: editForm.diaChi.trim(),
        avatar: editForm.avatar || avatarUrl,
        avatarPath: editForm.avatar || avatarUrl,
      };

      const res = await post(`admin/employees/update/${adminId}`, payload);
      console.log('Update admin profile response:', res);

      const updated = res?.user || res?.data || res;
      const okFlag =
        res?._ok === true ||
        res?.success === true ||
        (updated && (updated._id || updated.id || updated.tenDangNhap || updated.hoTen)) ||
        (res && !res.message?.toLowerCase?.().includes('lỗi') && !res.error);

      if (okFlag && updated && (updated._id || updated.id || updated.tenDangNhap || updated.hoTen)) {
        message.success(res?.message || 'Cập nhật thông tin thành công!');

        // Cập nhật cookies
        setCookie('adminName', updated.hoTen || editForm.hoTen, 30);
        setCookie('adminEmail', updated.email || editForm.email, 30);

        // Cập nhật localStorage
        const merged = { ...getAdminInfo(), ...updated };
        saveAdminInfo(merged);

        // Cập nhật state hiển thị
        setUserData(merged);
        setUpdateResult(merged);

        const finalAvatar = updated.avatar || updated.avatarPath || payload.avatar;
        if (finalAvatar) {
          setAvatarUrl(finalAvatar);
          saveAvatarToLocal(finalAvatar);
        }

        setShowEditModal(false);
      } else {
        const errMsg = res?.message || 'Cập nhật thất bại!';
        message.error(errMsg);
      }
    } catch (err) {
      console.error('Update admin profile error:', err);
      message.error('Cập nhật thất bại! Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Lưu avatar (chỉ cập nhật avatar, dùng cùng API update) =====
  const handleSaveAvatarOnly = async () => {
    const adminId = data._id || data.id || initialFromStorage._id;
    if (!adminId) {
      message.error('Không tìm thấy ID admin để cập nhật!');
      return;
    }
    if (!avatarUrl || avatarUrl === data.avatar) {
      // Không có thay đổi
      setShowAvatarModal(false);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        hoTen: data.hoTen || data.fullName || '',
        fullName: data.hoTen || data.fullName || '',
        email: data.email || '',
        soDienThoai: data.soDienThoai || data.phoneNumber || '',
        phoneNumber: data.soDienThoai || data.phoneNumber || '',
        diaChi: data.diaChi || data.address || '',
        address: data.diaChi || data.address || '',
        avatar: avatarUrl,
        avatarPath: avatarUrl,
      };
      const res = await post(`admin/employees/update/${adminId}`, payload);
      const updated = res?.user || res?.data || res;
      const okFlag =
        res?._ok === true ||
        res?.success === true ||
        (updated && (updated._id || updated.id || updated.tenDangNhap || updated.hoTen));

      if (okFlag) {
        message.success(res?.message || 'Cập nhật ảnh đại diện thành công!');
        const merged = { ...getAdminInfo(), ...(updated || {}), avatar: avatarUrl, avatarPath: avatarUrl };
        saveAdminInfo(merged);
        setUserData(merged);
        setUpdateResult(merged);
        saveAvatarToLocal(avatarUrl);
        setShowAvatarModal(false);
      } else {
        message.error(res?.message || 'Cập nhật ảnh thất bại!');
      }
    } catch (err) {
      console.error('Save avatar error:', err);
      message.error('Cập nhật ảnh thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const roleName = data?.vaiTro?.tenVaiTro || getCookie('adminRole') || 'Admin';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-grid">
        {/* ===== CỘT TRÁI: AVATAR + TÓM TẮT ===== */}
        <div className="admin-profile-sidebar">
          <div className="dashboard-card admin-profile-summary">
            <div className="card-body">
              <div className="admin-profile-avatar-wrap">
                <div className="admin-profile-avatar">
                  <img
                    src={data.avatar || data.avatarPath || DEFAULT_AVATAR}
                    alt="avatar"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="admin-profile-avatar-edit"
                  onClick={() => setShowAvatarModal(true)}
                  title="Đổi ảnh đại diện"
                >
                  <i className="fa-solid fa-camera"></i>
                </button>
              </div>

              <h3 className="admin-profile-name">
                {data.hoTen || data.fullName || 'Admin'}
              </h3>
              <p className="admin-profile-username">
                <i className="fa-solid fa-user-shield"></i>{' '}
                {data.tenDangNhap || '—'}
              </p>

              <span className="role-badge" style={{ marginTop: 10 }}>
                <i className="fa-solid fa-shield-halved"></i> {roleName}
              </span>

              <div className="admin-profile-actions">
                <button
                  type="button"
                  className="btn-admin-primary"
                  onClick={handleOpenEdit}
                  style={{ width: '100%' }}
                >
                  <i className="fa-solid fa-pen"></i> Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-circle-info"></i> Trạng thái
              </h3>
            </div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className="detail-value">
                    <span
                      className={`status-badge ${
                        data.trangThai === false || data.trangThai === 'false'
                          ? 'danger'
                          : 'success'
                      }`}
                    >
                      {data.trangThai === false || data.trangThai === 'false'
                        ? 'Bị khóa'
                        : 'Đang hoạt động'}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày tạo:</span>
                  <span className="detail-value">{formatDate(data.ngayTao || data.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {data._id || data.id || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CỘT PHẢI: THÔNG TIN CHI TIẾT ===== */}
        <div className="admin-profile-main">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-id-card"></i> Thông tin cá nhân
              </h3>
              {loading && (
                <span style={{ fontSize: 12, color: '#888' }}>
                  <i className="fa fa-spinner fa-spin"></i> Đang đồng bộ...
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="admin-profile-info-grid">
                <div className="admin-profile-info-item">
                  <label>
                    <i className="fa-solid fa-user"></i> Họ và tên
                  </label>
                  <p>{data.hoTen || data.fullName || 'Chưa cập nhật'}</p>
                </div>
                <div className="admin-profile-info-item">
                  <label>
                    <i className="fa-solid fa-envelope"></i> Email
                  </label>
                  <p>{data.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="admin-profile-info-item">
                  <label>
                    <i className="fa-solid fa-phone"></i> Số điện thoại
                  </label>
                  <p>{data.soDienThoai || data.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div className="admin-profile-info-item">
                  <label>
                    <i className="fa-solid fa-user-shield"></i> Tên đăng nhập
                  </label>
                  <p>{data.tenDangNhap || '—'}</p>
                </div>
                <div className="admin-profile-info-item admin-profile-info-full">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> Địa chỉ
                  </label>
                  <p>{data.diaChi || data.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <button type="button" className="btn-admin-primary" onClick={handleOpenEdit}>
                  <i className="fa-solid fa-pen"></i> Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL CHỈNH SỬA HỒ SƠ ===== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-pen-to-square"></i> Chỉnh sửa hồ sơ
              </h3>
              <button
                className="modal-close"
                onClick={() => !submitting && setShowEditModal(false)}
                disabled={submitting}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Ảnh đại diện</h4>
                    <div className="admin-profile-modal-avatar">
                      <div className="admin-profile-modal-avatar-img">
                        <img
                          src={editForm.avatar || avatarUrl || DEFAULT_AVATAR}
                          alt="avatar"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                      </div>
                      <label className="btn-upload-image">
                        <i className="fa-solid fa-camera"></i>
                        {uploading ? 'Đang tải...' : 'Chọn ảnh mới'}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {uploading && (
                        <span style={{ fontSize: 12, color: '#888' }}>
                          <i className="fa fa-spinner fa-spin"></i> Đang upload...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4 className="section-label">Thông tin cá nhân</h4>
                    <div className="modal-field">
                      <label>Họ và tên <span className="required">*</span></label>
                      <input
                        type="text"
                        name="hoTen"
                        value={editForm.hoTen}
                        onChange={handleInput}
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>
                    <div className="modal-field">
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInput}
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                    <div className="modal-field">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        name="soDienThoai"
                        value={editForm.soDienThoai}
                        onChange={handleInput}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="modal-field">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="diaChi"
                        value={editForm.diaChi}
                        onChange={handleInput}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  <i className="fa-solid fa-xmark"></i> Hủy bỏ
                </button>
                <button type="submit" className="btn-admin-primary" disabled={submitting}>
                  {submitting ? (
                    <><i className="fa fa-spinner fa-spin"></i> Đang lưu...</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL ĐỔI ẢNH ĐẠI DIỆN (NHANH) ===== */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowAvatarModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-camera"></i> Đổi ảnh đại diện
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowAvatarModal(false)}
                disabled={submitting}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="admin-profile-modal-avatar" style={{ padding: '10px 0' }}>
                <div className="admin-profile-modal-avatar-img">
                  <img
                    src={avatarUrl || DEFAULT_AVATAR}
                    alt="avatar preview"
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  />
                </div>
                <label className="btn-upload-image">
                  <i className="fa-solid fa-camera"></i>
                  {uploading ? 'Đang tải...' : 'Chọn ảnh mới'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                {uploading && (
                  <span style={{ fontSize: 12, color: '#888' }}>
                    <i className="fa fa-spinner fa-spin"></i> Đang upload...
                  </span>
                )}
                <p style={{ fontSize: 12, color: '#888', marginTop: 10, textAlign: 'center' }}>
                  Hỗ trợ JPG, PNG, GIF. Tối đa 5MB.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setShowAvatarModal(false)}
                disabled={submitting}
              >
                <i className="fa-solid fa-xmark"></i> Hủy
              </button>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={handleSaveAvatarOnly}
                disabled={uploading || submitting}
              >
                {submitting ? (
                  <><i className="fa fa-spinner fa-spin"></i> Đang lưu...</>
                ) : (
                  <><i className="fa-solid fa-floppy-disk"></i> Lưu ảnh</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
