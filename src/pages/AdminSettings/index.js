import { useState } from 'react';
import { message } from 'antd';
import '../../css/admin.scss';

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="admin-settings">
      <div className="settings-tabs">
        {[
          { key: 'general', icon: 'fa-gear', label: 'Cài đặt chung' },
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