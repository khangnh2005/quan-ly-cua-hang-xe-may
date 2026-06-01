import { getCookie , setCookie } from '../../helpers/cookie';
import '../../css/style.scss';
import { useState } from 'react';
import { message } from 'antd';
import { post } from '../../untils/requests';
import { Button, Space, Modal } from 'antd';

function Profile() {
  const user = {
    fullName: getCookie('fullName') || 'User',
    email: getCookie('email') || '',
    phoneNumber: getCookie('phoneNumber') || 'Chưa cập nhật',
    address: getCookie('address') || 'Chưa cập nhật',
    cccd: getCookie('cccd') || 'Chưa cập nhật',
    userId: getCookie('userId') || '',
  };
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: getCookie('fullName') || '',
    email: getCookie('email') || '',
    phoneNumber: getCookie('phoneNumber') || '',
    cccd: getCookie('cccd') || '',
    address: getCookie('address') || '',
  });

  const handleOpenEdit = () => {
    setEditForm({
     fullName: getCookie('fullName') || '',
      email: getCookie('email') || '',
      phoneNumber: getCookie('phoneNumber') || '',
      cccd: getCookie('cccd') || '',
      address: getCookie('address') || ''
    });
    setShowModal(true);
  };

  // Cập nhật state khi gõ
  const handleInput = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Gửi API update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Gọi API update (Hãy thay đường dẫn API khớp với Backend của bạn)
      const res = await post('auth/update-profile', editForm);
      
      if (res) {
        message.success('Cập nhật thành công!');
        // Cập nhật lại Cookies sau khi sửa thành công
        setCookie('fullName', editForm.fullName);
        setCookie('phoneNumber', editForm.phoneNumber);
        setCookie('address', editForm.address);
        
        setShowModal(false);
        window.location.reload(); // Reload để render lại thông tin mới
      }
    } catch (err) {
      message.error('Cập nhật thất bại!');
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
                src="https://upload.wikimedia.org/wikipedia/commons/0/09/Icon_Google_Material_Design_Account_circle.svg"
                alt="avatar"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                }}
              />
            </div>
            <p className="profile-avatar-hint">Ảnh đại diện</p>
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
              <p>{user.fullName}</p>
            </div>
            <div className="profile-info-item">
              <label>Email</label>
              <p>{user.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="profile-info-item">
              <label>Số điện thoại</label>
              <p>{user.phoneNumber}</p>
            </div>
            <div className="profile-info-item">
              <label>CCCD</label>
              <p>{user.cccd}</p>
            </div>
          </div>

          <div className="profile-info-item" style={{ marginBottom: '20px' }}>
            <label>Địa chỉ</label>
            <p>{user.address}</p>
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
      <form onSubmit={handleUpdateProfile}>
        <div className="modal-field">
          <label>Họ và tên</label>
          <input name="fullName" value={editForm.fullName} onChange={handleInput} />
        </div>
        <div className="modal-field">
          <label>Số điện thoại</label>
          <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleInput} />
        </div>
        <div className="modal-field">
          <label>Địa chỉ</label>
          <input name="address" value={editForm.address} onChange={handleInput} />
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
              loading={submitting} // Sử dụng state submitting có sẵn của bạn
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