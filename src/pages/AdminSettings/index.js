import { useState } from 'react';
import { message } from 'antd';
import { setCookie, getCookie } from '../../helpers/cookie';
import '../../css/admin.scss';

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [tokenInput, setTokenInput] = useState('');

  const handleSetToken = () => {
    if (!tokenInput.trim()) {
      message.error('Vui lòng nhập token!');
      return;
    }
    // Save to both cookies and localStorage
    setCookie('token', tokenInput.trim(), 1);
    setCookie('adminToken', tokenInput.trim(), 1);
    localStorage.setItem('adminToken', tokenInput.trim());
    localStorage.setItem('token', tokenInput.trim());
    message.success('Token đã được cập nhật! Token hiện tại: ' + tokenInput.trim().substring(0, 20) + '...');
    setTokenInput('');
  };

  const handleClearToken = () => {
    setCookie('token', '', -1);
    setCookie('adminToken', '', -1);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    message.success('Đã xóa token!');
  };

  const currentToken = getCookie('adminToken') || localStorage.getItem('adminToken') || 'Chưa có';

  return (
    <div className="admin-settings">
      <div className="settings-tabs">
        {[
          { key: 'general', icon: 'fa-gear', label: 'Cài đặt chung' },
          { key: 'token', icon: 'fa-key', label: 'Token API' },
          { key: 'payment', icon: 'fa-credit-card', label: 'Thanh toán' },
          { key: 'shipping', icon: 'fa-truck', label: 'Vận chuyển' },
          { key: 'notification', icon: 'fa-bell', label: 'Thông báo' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-sliders"></i> 
            {activeTab === 'general' ? 'Cài đặt chung' : 
             activeTab === 'token' ? 'Quản lý Token API' :
             activeTab === 'payment' ? 'Cấu hình thanh toán' :
             activeTab === 'shipping' ? 'Cấu hình vận chuyển' : 'Cấu hình thông báo'}
          </h3>
        </div>
        <div className="card-body">
          {activeTab === 'general' && (
            <div className="settings-form">
              <div className="setting-group">
                <label>Tên cửa hàng</label>
                <input type="text" defaultValue="LongMoto - Xe Máy Chính Hãng" />
              </div>
              <div className="setting-group">
                <label>Email liên hệ</label>
                <input type="email" defaultValue="info@longmoto.vn" />
              </div>
              <div className="setting-group">
                <label>Số điện thoại</label>
                <input type="text" defaultValue="1800 800 800" />
              </div>
              <div className="setting-group">
                <label>Địa chỉ</label>
                <input type="text" defaultValue="Quận 10, TP.HCM" />
              </div>
              <div className="setting-group">
                <label>Mô tả cửa hàng</label>
                <textarea rows={3} defaultValue="Đại lý xe máy uy tín hàng đầu TP.HCM với hơn 12 năm kinh nghiệm."></textarea>
              </div>
              <button className="btn-admin-primary" onClick={() => message.success('Đã lưu cài đặt!')}>
                <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
              </button>
            </div>
          )}

          {activeTab === 'token' && (
            <div className="settings-form">
              <div className="setting-group">
                <label>Token hiện tại</label>
                <input 
                  type="text" 
                  value={currentToken} 
                  readOnly 
                  style={{ background: '#f5f5f5', color: '#666' }}
                />
              </div>
              <div className="setting-group">
                <label>Nhập token mới từ Backend (Swagger/Direct API)</label>
                <input 
                  type="text" 
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  placeholder="VD: nBSJ2dZz5x2XfNHm4fn7miJCpnRKab"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-admin-primary" onClick={handleSetToken}>
                  <i className="fa-solid fa-save"></i> Lưu Token
                </button>
                <button className="btn-admin-secondary" onClick={handleClearToken}>
                  <i className="fa-solid fa-trash"></i> Xóa Token
                </button>
              </div>
              <p style={{ marginTop: '16px', fontSize: '13px', color: '#888' }}>
                Nếu gặp lỗi "Invalid token", hãy dán token từ backend vào đây và bấm Lưu.
                Sau đó thử lại thao tác thêm sản phẩm.
              </p>
            </div>
          )}

          {(activeTab === 'payment' || activeTab === 'shipping' || activeTab === 'notification') && (
            <div className="empty-state">
              <i className="fa-solid fa-tools"></i>
              <p>Tính năng đang được phát triển</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;