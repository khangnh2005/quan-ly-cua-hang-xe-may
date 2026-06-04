import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { get, post } from '../../../untils/requests';
import '../../../css/admin.scss';

const emptyCustomer = {
  hoTen: '',
  email: '',
  soDienThoai: '',
  diaChi: '',
  cccd: '',
};

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyCustomer });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await get('customers');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setCustomers(list);
    } catch (err) {
      console.error('Fetch customers error:', err);
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setForm({
        hoTen: record.hoTen || record.fullName || '',
        email: record.email || '',
        soDienThoai: record.soDienThoai || record.phoneNumber || '',
        diaChi: record.diaChi || record.address || '',
        cccd: record.cccd || '',
        trangThai: record.trangThai !== undefined ? record.trangThai : true,
      });
      setEditingId(record._id || record.id);
    } else {
      setForm({ ...emptyCustomer, trangThai: true });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ ...emptyCustomer });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.hoTen.trim()) {
      message.error('Vui lòng nhập họ tên!');
      return;
    }
    if (!form.email.trim()) {
      message.error('Vui lòng nhập email!');
      return;
    }
    setSubmitting(true);
    try {
      let payload;
      let res;
      if (editingId) {
        payload = {
          hoTen: form.hoTen.trim(),
          fullName: form.hoTen.trim(),
          email: form.email.trim(),
          soDienThoai: form.soDienThoai.trim(),
          phoneNumber: form.soDienThoai.trim(),
          diaChi: form.diaChi.trim(),
          cccd: form.cccd.trim(),
          trangThai: form.trangThai,
        };
        res = await post(`customers/update/${editingId}`, payload);
      } else {
        payload = {
          fullName: form.hoTen.trim(),
          email: form.email.trim(),
          phoneNumber: form.soDienThoai.trim(),
          address: form.diaChi.trim(),
          cccd: form.cccd.trim(),
          trangThai: form.trangThai,
        };
        res = await post('auth/sign-up', payload);
      }

      if (res) {
        message.success(res.message || (editingId ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!'));
        handleCloseModal();
        fetchCustomers();
      } else {
        message.error(res?.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Save customer error:', err);
      message.error('Thao tác thất bại, vui lòng kiểm tra lại dữ liệu!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    const id = customer._id || customer.id;
    const newStatus = !customer.trangThai;
    const label = newStatus ? 'Hoạt động' : 'Khóa';

    Modal.confirm({
      title: `Chuyển trạng thái khách hàng?`,
      content: `Bạn có chắc muốn chuyển trạng thái khách hàng "${customer.hoTen || customer.fullName}" sang "${label}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await post(`customers/change-status/${id}`, { trangThai: newStatus });
          if (res) {
            message.success(`Đã chuyển trạng thái sang "${label}"!`);
            fetchCustomers();
          } else {
            message.error(res?.message || 'Thay đổi trạng thái thất bại!');
          }
        } catch (err) {
          message.error('Không thể thay đổi trạng thái!');
        }
      },
    });
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const keyword = searchTerm.toLowerCase();
    const name = (c.hoTen || c.fullName || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.soDienThoai || c.phoneNumber || '').toLowerCase();
    return name.includes(keyword) || email.includes(keyword) || phone.includes(keyword);
  });

  const getTrangThaiLabel = (val) => {
    if (val === true || val === 'true') return 'Hoạt động';
    return 'Khóa';
  };

  const getTrangThaiClass = (val) => {
    if (val === true || val === 'true') return 'success';
    return 'danger';
  };

  return (
    <div className="admin-customers">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm khách hàng
          </button>
          <button className="btn-admin-secondary">
            <i className="fa-solid fa-file-csv"></i> Xuất danh sách
          </button>
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
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>CCCD</th>
                  <th>Trạng thái</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, idx) => (
                    <tr key={customer._id || customer.id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar">
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <span>{customer.hoTen || customer.fullName || ''}</span>
                        </div>
                      </td>
                      <td>{customer.email || ''}</td>
                      <td>{customer.soDienThoai || customer.phoneNumber || ''}</td>
                      <td>{customer.diaChi || customer.address || ''}</td>
                      <td>{customer.cccd || ''}</td>
                      <td>
                        <span className={`status-badge ${getTrangThaiClass(customer.trangThai)}`}>
                          {getTrangThaiLabel(customer.trangThai)}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className={`btn-icon ${customer.trangThai ? 'warning' : 'success'}`}
                            title={customer.trangThai ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            onClick={() => handleToggleStatus(customer)}
                          >
                            <i className={`fa-solid ${customer.trangThai ? 'fa-lock' : 'fa-unlock'}`}></i>
                          </button>
                          <button className="btn-icon edit" title="Sửa" onClick={() => handleOpenModal(customer)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                {editingId ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Thông tin cá nhân</h4>

                    <div className="modal-field">
                      <label>Họ và tên <span className="required">*</span></label>
                      <input
                        type="text"
                        name="hoTen"
                        value={form.hoTen}
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
                        value={form.email}
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
                        value={form.soDienThoai}
                        onChange={handleInput}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="modal-field">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="diaChi"
                        value={form.diaChi}
                        onChange={handleInput}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    <div className="modal-field">
                      <label>CCCD</label>
                      <input
                        type="text"
                        name="cccd"
                        value={form.cccd}
                        onChange={handleInput}
                        placeholder="Nhập số CCCD"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={handleCloseModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-admin-primary" disabled={submitting}>
                  {submitting ? (
                    <><i className="fa fa-spinner fa-spin"></i> Đang lưu...</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm khách hàng'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;