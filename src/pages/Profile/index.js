import { getCookie , setCookie } from '../../helpers/cookie';
import '../../css/style.scss';
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { post, uploadFile } from '../../untils/requests';
import { Button, Space, Modal } from 'antd';

function Profile() {
  const [avatarUrl, setAvatarUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
  const [uploading, setUploading] = useState(false);
  
  const user = {
    hoTen: getCookie('fullName') || getCookie('hoTen') || 'User',
    email: getCookie('email') || '',
    soDienThoai: getCookie('phoneNumber') || getCookie('soDienThoai') || 'Chưa cập nhật',
    diaChi: getCookie('address') || getCookie('diaChi') || 'Chưa cập nhật',
    cccd: getCookie('cccd') || 'Chưa cập nhật',
    avatar: getCookie('avatar') || '',
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
      avatar: getCookie('avatar') || '',
  });

  useEffect(() => {
   if (user.avatar) setAvatarUrl(user.avatar);
  }, []);

  const handleOpenEdit = () => {
    setEditForm({
      hoTen: getCookie('fullName') || getCookie('hoTen') || '',
      email: getCookie('email') || '',
      soDienThoai: getCookie('phoneNumber') || getCookie('soDienThoai') || '',
      cccd: getCookie('cccd') || '',
      diaChi: getCookie('address') || getCookie('diaChi') || '',
      avatar: getCookie('avatar') || '',
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

      // Upload to server
      const res = await uploadFile('uploads/single', formData);
          const newAvatarUrl = res?.data?.url || res?.avatarUrl || res?.url;

     if (newAvatarUrl) {
      setAvatarUrl(newAvatarUrl);
      setEditForm(prev => ({ ...prev, avatar: newAvatarUrl })); // sync vào form
      setCookie('avatar', newAvatarUrl);

      // ✅ FIX 2: gửi URL lên server để lưu vào DB
      const userId = getCookie('userId');
      if (userId) {
        await post(`customers/update/${userId}`, { avatar: newAvatarUrl });
      }

      message.success('Cập nhật ảnh đại diện thành công!');
    } else {
      message.error('Không lấy được URL ảnh từ server!');
      setAvatarUrl(getCookie('avatar') || 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
    }
    }catch (err) {
    console.error('Upload avatar error:', err);
    message.error('Upload ảnh thất bại! Vui lòng thử lại.');
    setAvatarUrl(getCookie('avatar') || 'https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg');
  } finally {
    setUploading(false);
  }
  };

  // Gửi API update
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

      // Send multiple possible field names to match backend schema
      const payload = {
        fullName: editForm.hoTen,     // Gửi 1 tên chuẩn nhất
        email: editForm.email,
        phoneNumber: editForm.soDienThoai,
        address: editForm.diaChi,
        cccd: editForm.cccd,
        avatar: avatarUrl
      };

      console.log('Profile update payload:', payload);

      const res = await post(`customers/update/${userId}`, payload);
      console.log('Update response:', res);

      // Heuristics to detect success from various API shapes
      const ok = !!(res && (res.success === true || res.message === 'Success' || res.modifiedCount > 0 || res.updatedAt || res.user || res.message && /success/i.test(res.message)));
      if (ok) {
        message.success('Cập nhật thành công!');
        // Sync cookies with server values
        setCookie('fullName', editForm.hoTen);
        setCookie('hoTen', editForm.hoTen);
        setCookie('phoneNumber', editForm.soDienThoai);
        setCookie('soDienThoai', editForm.soDienThoai);
        setCookie('address', editForm.diaChi);
        setCookie('diaChi', editForm.diaChi);
        setCookie('email', editForm.email);
        setCookie('cccd', editForm.cccd);
        setCookie('avatar', avatarUrl);

        setShowModal(false);
        window.location.reload();
      } else {
        const errMsg = res?.message || JSON.stringify(res) || 'Cập nhật thất bại!';
        console.error('Update failed response:', res);
        message.error(errMsg);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      message.error('Cập nhật thất bại! Vui lòng kiểm tra Console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-header">
            <div className="profile-avatar">
              <img
                src={avatarUrl}
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

        {/* Main Content */}
        <div className="profile-main">
          <h2 className="profile-title">Thông tin cá nhân</h2>
          <p className="profile-subtitle">
            Quản lý thông tin cá nhân để bảo mật tài khoản của bạn
          </p>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <label>Họ và tên</label>
              <p>{user.hoTen}</p>
            </div>
            <div className="profile-info-item">
              <label>Email</label>
              <p>{user.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="profile-info-item">
              <label>Số điện thoại</label>
              <p>{user.soDienThoai}</p>
            </div>
            <div className="profile-info-item">
              <label>CCCD</label>
              <p>{user.cccd}</p>
            </div>
          </div>

          <div className="profile-info-item" style={{ marginBottom: '20px' }}>
            <label>Địa chỉ</label>
            <p>{user.diaChi}</p>
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
          <img src={avatarUrl} alt="avatar preview" className="modal-avatar-preview" />
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