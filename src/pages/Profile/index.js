import { getCookie } from '../../helpers/cookie';
import '../../css/style.scss';

function Profile() {
  const user = {
    fullName: getCookie('fullName') || 'User',
    email: getCookie('email') || '',
    phoneNumber: getCookie('phoneNumber') || 'Chưa cập nhật',
    address: getCookie('address') || 'Chưa cập nhật',
    cccd: getCookie('cccd') || 'Chưa cập nhật',
    userId: getCookie('userId') || '',
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

          <button className="profile-btn-edit">
            <i className="fa-solid fa-pen"></i> Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;