import { getCookie , setCookie } from '../../helpers/cookie';
import '../../css/style.scss';
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { post, uploadFile } from '../../untils/requests';
import { Button, Space } from 'antd';

// Helper để lưu/đọc avatar ở localStorage (không bị xóa khi logout)
const LS_AVATAR_KEY = 'saved_avatar';
function getSavedAvatar() {
  return localStorage.getItem(LS_AVATAR_KEY) || '';
}
function saveAvatarToLocal(avatarUrl) {
  if (avatarUrl) localStorage.setItem(LS_AVATAR_KEY, avatarUrl);
}

function Profile() {
  const savedAvatar = getSavedAvatar();
  const [avatarUrl, setAvatarUrl] = useState(savedAvatar || 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);
  const getAvatarFromData = (obj) => obj?.avatar || obj?.avatarPath || '';
  const fullNameFromCookie = getCookie('fullName') || getCookie('hoTen') || '';
  const user = {
    hoTen: fullNameFromCookie,
    fullName: fullNameFromCookie,
    email: getCookie('email') || '',
    soDienThoai: getCookie('phoneNumber') || getCookie('soDienThoai') || '',
    diaChi: getCookie('address') || getCookie('diaChi') || '',
    cccd: getCookie('cccd') || '',
    avatar: getCookie('avatar') || getCookie('avatarPath') || getSavedAvatar(),
    trangThai: getCookie('trangThai') === 'true',
    userId: getCookie('userId') || '',
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
            <li className="profile-menu-item active">
              <i className="fa-solid fa-user"></i>
              <span>Hồ sơ của tôi</span>
            </li>
            <li className="profile-menu-item">
              <i className="fa-solid fa-box"></i>
              <span>Lịch sử mua hàng</span>
            </li>
          </ul>
        </div>

        {/* Main Content - Render từ data (response API hoặc cookie) */}
        <div className="profile-main">
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
        </div>
      </div>
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
    </div>
  );
}

export default Profile;