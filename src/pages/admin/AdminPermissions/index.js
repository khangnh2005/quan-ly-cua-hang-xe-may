import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { get, post } from '../../../untils/requests';
import '../../../css/admin.scss';

const emptyEmployee = {
  tenDangNhap: '',
  matKhau: '',
  vaiTroId: '',
  hoTen: '',
  soDienThoai: '',
  email: '',
  trangThai: true,
  coQuyenThem: false,
  coQuyenSua: false,
  coQuyenXoa: false,
};

function AdminPermissions() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyEmployee });
  const [vaiTroList, setVaiTroList] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchVaiTro();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await get('admin/employees');
      setEmployees(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Fetch employees error:', err);
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaiTro = async () => {
    try {
      const res = await get('roles');
      setVaiTroList(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Fetch vaiTro error:', err);
    }
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      const vaiTro = record.vaiTro;
      setForm({
        tenDangNhap: record.tenDangNhap || '',
        matKhau: '',
        vaiTroId: (typeof vaiTro === 'object' && vaiTro) ? (vaiTro._id || '') : '',
        hoTen: record.hoTen || record.fullName || '',
        soDienThoai: record.soDienThoai || record.phoneNumber || '',
        email: record.email || '',
        trangThai: record.trangThai !== undefined ? record.trangThai : true,
        coQuyenThem: record.coQuyenThem || false,
        coQuyenSua: record.coQuyenSua || false,
        coQuyenXoa: record.coQuyenXoa || false,
      });
      setEditingId(record._id || record.id);
    } else {
      setForm({ ...emptyEmployee });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ ...emptyEmployee });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.hoTen.trim()) return message.error('Vui lòng nhập họ tên!');
    if (!form.email.trim()) return message.error('Vui lòng nhập email!');
    if (!editingId && !form.tenDangNhap.trim()) return message.error('Vui lòng nhập tên đăng nhập!');
    if (!editingId && !form.matKhau.trim()) return message.error('Vui lòng nhập mật khẩu!');
    if (!form.vaiTroId) return message.error('Vui lòng chọn vai trò!');

    setSubmitting(true);
    try {
      let res;
      if (editingId) {
        const payload = {
          hoTen: form.hoTen.trim(),
          email: form.email.trim(),
          soDienThoai: form.soDienThoai.trim(),
          vaiTroId: form.vaiTroId,
          trangThai: form.trangThai,
          coQuyenThem: form.coQuyenThem,
          coQuyenSua: form.coQuyenSua,
          coQuyenXoa: form.coQuyenXoa,
        };
        if (form.matKhau.trim()) payload.matKhau = form.matKhau.trim();
        res = await post(`admin/employees/update/${editingId}`, payload);
      } else {
        res = await post('admin/auth/sign-up', {
          tenDangNhap: form.tenDangNhap.trim(),
          matKhau: form.matKhau.trim(),
          vaiTroId: form.vaiTroId,
          hoTen: form.hoTen.trim(),
          soDienThoai: form.soDienThoai.trim(),
          email: form.email.trim(),
          trangThai: form.trangThai,
        });
      }

      if (res && (res.message?.toLowerCase().includes('success') || res.data?._id || res._id)) {
        message.success(res.message || (editingId ? 'Cập nhật thành công!' : 'Thêm thành công!'));
        handleCloseModal();
        fetchEmployees();
      } else {
        message.error(res?.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Save employee error:', err);
      message.error('Thao tác thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const id = emp._id || emp.id;
    const newStatus = !emp.trangThai;
    const label = newStatus ? 'Hoạt động' : 'Khóa';
    Modal.confirm({
      title: `Chuyển trạng thái nhân viên?`,
      content: `Bạn có chắc muốn chuyển "${emp.hoTen || emp.fullName}" sang "${label}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await post(`admin/employees/change-status/${id}`, { trangThai: newStatus });
          if (res) {
            message.success(`Đã chuyển sang "${label}"!`);
            fetchEmployees();
          } else message.error(res?.message || 'Thất bại!');
        } catch (err) {
          message.error('Không thể thay đổi trạng thái!');
        }
      },
    });
  };

  const getTenVaiTro = (emp) => {
    if (!emp?.vaiTro) return 'Nhân viên';
    if (typeof emp.vaiTro === 'object') return emp.vaiTro.tenVaiTro || 'Nhân viên';
    return emp.vaiTro;
  };

  const getPermissionIcons = (emp) => {
    const items = [];
    if (emp.coQuyenThem) items.push(<span key="add" className="permission-badge success"><i className="fa-solid fa-plus"></i> Thêm</span>);
    if (emp.coQuyenSua) items.push(<span key="edit" className="permission-badge warning"><i className="fa-solid fa-pen"></i> Sửa</span>);
    if (emp.coQuyenXoa) items.push(<span key="delete" className="permission-badge danger"><i className="fa-solid fa-trash"></i> Xóa</span>);
    return items.length ? items : <span className="text-muted">Chưa có quyền</span>;
  };

  // Role priority for sorting (thấp → cao: Admin → Quản Lý → Nhân viên)
  const rolePriority = {
    'Admin': 1,
    'Quản lý': 2,
    'Quản Lý': 2,
    'Nhân viên': 3,
  };

  const getRoleName = (emp) => {
    if (!emp?.vaiTro) return 'Nhân viên';
    if (typeof emp.vaiTro === 'object') return emp.vaiTro.tenVaiTro || 'Nhân viên';
    return emp.vaiTro;
  };

  const getRolePriority = (emp) => {
    const roleName = getRoleName(emp);
    return rolePriority[roleName] || 99;
  };

  const filteredEmployees = employees
    .filter(emp => {
      if (!searchTerm) return true;
      const k = searchTerm.toLowerCase();
      const ten = (typeof emp.vaiTro === 'object' ? emp.vaiTro?.tenVaiTro || '' : emp.vaiTro || '').toLowerCase();
      return (emp.hoTen || '').toLowerCase().includes(k)
        || (emp.email || '').toLowerCase().includes(k)
        || (emp.soDienThoai || '').toLowerCase().includes(k)
        || ten.includes(k);
    })
    .sort((a, b) => {
      // Sort by role priority first (thấp → cao), then by name if same role
      const pA = getRolePriority(a);
      const pB = getRolePriority(b);
      if (pA !== pB) return pA - pB;
      return (a.hoTen || '').localeCompare(b.hoTen || '');
    });

  return (
    <div className="admin-permissions">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Tìm kiếm nhân viên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm nhân viên
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
                  <th>Tên nhân viên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      {searchTerm ? 'Không tìm thấy' : 'Chưa có nhân viên nào'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, idx) => (
                    <tr key={emp._id || emp.id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar"><i className="fa-solid fa-user-tie"></i></div>
                          <span>{emp.hoTen || emp.fullName || ''}</span>
                        </div>
                      </td>
                      <td>{emp.email || ''}</td>
                      <td>{emp.soDienThoai || emp.phoneNumber || ''}</td>
                      <td><span className="role-badge">{getTenVaiTro(emp)}</span></td>
                      <td>
                        <span className={`status-badge ${emp.trangThai === true || emp.trangThai === 'true' ? 'success' : 'danger'}`}>
                          {emp.trangThai === true || emp.trangThai === 'true' ? 'Hoạt động' : 'Khóa'}
                        </span>
                      </td>
                      <td>
                        {getRoleName(emp) === 'Admin' ? (
                          <span
                            className="action-btns"
                            style={{ color: '#999', fontSize: 12, fontStyle: 'italic' }}
                            title="Tài khoản Admin không thể chỉnh sửa/khóa"
                          >
                            <i className="fa-solid fa-shield-halved"></i> Admin
                          </span>
                        ) : (
                          <div className="action-btns">
                            <button className={`btn-icon ${emp.trangThai ? 'warning' : 'success'}`}
                              title={emp.trangThai ? 'Khóa' : 'Mở khóa'}
                              onClick={() => handleToggleStatus(emp)}>
                              <i className={`fa-solid ${emp.trangThai ? 'fa-lock' : 'fa-unlock'}`}></i>
                            </button>
                            <button className="btn-icon edit" title="Sửa" onClick={() => handleOpenModal(emp)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i> {editingId ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
              <button className="modal-close" onClick={handleCloseModal}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Thông tin nhân viên</h4>
                    <div className="modal-field">
                      <label>Họ tên <span className="required">*</span></label>
                      <input type="text" name="hoTen" value={form.hoTen} onChange={handleInput} placeholder="Nhập họ tên" required />
                    </div>
                    <div className="modal-field">
                      <label>Email <span className="required">*</span></label>
                      <input type="email" name="email" value={form.email} onChange={handleInput} placeholder="Nhập email" required />
                    </div>
                    <div className="modal-field">
                      <label>Số điện thoại</label>
                      <input type="text" name="soDienThoai" value={form.soDienThoai} onChange={handleInput} placeholder="Nhập số điện thoại" />
                    </div>
                    {!editingId && (
                      <>
                        <div className="modal-field">
                          <label>Tên đăng nhập <span className="required">*</span></label>
                          <input type="text" name="tenDangNhap" value={form.tenDangNhap} onChange={handleInput} placeholder="Nhập tên đăng nhập" required />
                        </div>
                        <div className="modal-field">
                          <label>Mật khẩu <span className="required">*</span></label>
                          <input type="password" name="matKhau" value={form.matKhau} onChange={handleInput} placeholder="Nhập mật khẩu" required />
                        </div>
                      </>
                    )}
                    {editingId && (
                      <div className="modal-field">
                        <label>Mật khẩu (để trống nếu không đổi)</label>
                        <input type="password" name="matKhau" value={form.matKhau} onChange={handleInput} placeholder="Nhập mật khẩu mới" />
                      </div>
                    )}
                    <div className="modal-field">
                      <label>Vai trò <span className="required">*</span></label>
                      <select name="vaiTroId" value={form.vaiTroId} onChange={handleInput} required>
                        <option value="">-- Chọn vai trò --</option>
                        {vaiTroList.map(vt => (
                          <option key={vt._id} value={vt._id}>{vt.tenVaiTro}</option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-field">
                      <label>Trạng thái</label>
                      <select name="trangThai" value={form.trangThai} onChange={handleInput}>
                        <option value={true}>Hoạt động</option>
                        <option value={false}>Khóa</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={handleCloseModal}>Hủy bỏ</button>
                <button type="submit" className="btn-admin-primary" disabled={submitting}>
                  {submitting ? <><i className="fa fa-spinner fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm nhân viên'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPermissions;