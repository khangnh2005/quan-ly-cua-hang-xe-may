import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getCookie, setCookie } from '../../../helpers/cookie';
import { get, post } from '../../../untils/requests';
import '../../../css/admin.scss';

// Helper lấy thông tin admin từ cookies + localStorage
const LS_ADMIN_INFO = 'adminInfo';

function getAdminInfo() {
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

const AVATAR_MAP = {
  'Nguyễn Hoàng Khang': 'https://i.ibb.co/LzgjJGTh/k.png',
  'Mao Bảo Long': 'https://i.ibb.co/Q7Nmxrx3/l.jpg',
  'Nguyễn Nhật Hoàng': 'https://i.ibb.co/jvb8V2CF/h.png',
  'Bùi Thanh Minh': 'https://i.ibb.co/LDtCsqcr/m.png',
  'Trịnh Đan Huy': 'https://i.ibb.co/0jpdGVhQ/huy.png',
  'Phan Văn Lộc': 'https://i.ibb.co/27V1bsCt/vl.png',
  'Huỳnh Minh Trí': 'https://i.ibb.co/xt7krN1z/t.jpg',
  'Nguyễn Thanh Thuận': 'https://i.ibb.co/Pzfc3nP2/thuan.jpg',
};

function getAvatarUrl(hoTen, storedAvatar) {
  if (storedAvatar) return storedAvatar;
  const mapped = AVATAR_MAP[hoTen?.trim()];
  if (mapped) return mapped;
  return '';
}

function AdminProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Build thông tin cơ bản từ cookies + localStorage
  const initialFromStorage = (() => {
    const stored = getAdminInfo() || {};
    const hoTen = stored.hoTen || getCookie('adminName') || '';
    return {
      _id: stored._id || stored.id || getCookie('adminId') || '',
      hoTen: hoTen,
      tenDangNhap: stored.tenDangNhap || getCookie('adminUsername') || '',
      email: stored.email || getCookie('adminEmail') || '',
      soDienThoai: stored.soDienThoai || stored.phoneNumber || '',
      diaChi: stored.diaChi || stored.address || '',
      vaiTro: stored.vaiTro || { tenVaiTro: getCookie('adminRole') || 'Admin' },
      avatar: getAvatarUrl(hoTen, stored.avatar || stored.avatarPath || ''),
      trangThai: stored.trangThai !== undefined ? stored.trangThai : true,
      ngayTao: stored.ngayTao || stored.createdAt || '',
    };
  })();

  // ===== Fetch thông tin admin từ server =====
  const fetchAdminProfile = async () => {
    const stored = getAdminInfo();
    const adminId = initialFromStorage._id || (stored?._id || stored?.id || '');

    if (!adminId) {
      setUserData(initialFromStorage);
      return;
    }

    setLoading(true);
    try {
      const res = await get(`admin/employees/${adminId}`);
      console.log('AdminProfile - API response:', res);

      const data = res?.user || res?.data || (res && !res.message ? res : null);
      if (data && (data._id || data.id || data.tenDangNhap || data.hoTen)) {
        // Áp dụng avatar cứng nếu có mapping
        const hardAvatar = getAvatarUrl(data.hoTen, data.avatar || data.avatarPath || '');
        if (hardAvatar) {
          data.avatar = hardAvatar;
          data.avatarPath = hardAvatar;
        }
        setUserData(data);
        saveAdminInfo({ ...getAdminInfo(), ...data });
      } else {
        setUserData(initialFromStorage);
      }
    } catch (err) {
      console.error('Fetch admin profile error:', err);
      setUserData(initialFromStorage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = userData || initialFromStorage;

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
                    src={data.avatar || data.avatarPath || ''}
                    alt="avatar"
                    onError={(e) => {
                      e.target.src = '';
                    }}
                  />
                </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;