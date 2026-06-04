import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { get, post, del } from '../../untils/requests';
import '../../css/admin.scss';

function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    tenVaiTro: '',
    moTa: '',
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await get('roles');
      setRoles(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Fetch roles error:', err);
      message.error('Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setForm({
        tenVaiTro: record.tenVaiTro || '',
        moTa: record.moTa || '',
      });
      setEditingId(record._id || record.id);
    } else {
      setForm({ tenVaiTro: '', moTa: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ tenVaiTro: '', moTa: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tenVaiTro.trim()) {
      return message.error('Vui lòng nhập tên vai trò!');
    }

    setSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await post(`roles/update/${editingId}`, {
          tenVaiTro: form.tenVaiTro.trim(),
          moTa: form.moTa.trim(),
        });
      } else {
        res = await post('roles/add', {
          tenVaiTro: form.tenVaiTro.trim(),
          moTa: form.moTa.trim(),
        });
      }

      if (res && (res._ok || res.success || res.message?.toLowerCase().includes('success') || res.data?._id || res._id)) {
        message.success(res.message || (editingId ? 'Cập nhật vai trò thành công!' : 'Thêm vai trò thành công!'));
        handleCloseModal();
        fetchRoles();
      } else {
        message.error(res?.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Save role error:', err);
      message.error('Thao tác thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa vai trò?',
      content: 'Bạn có chắc muốn xóa vai trò này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await del(`roles/delete/${id}`);
          if (res && (res._ok || res.success)) {
            message.success('Đã xóa vai trò thành công!');
            fetchRoles();
          } else {
            message.error(res?.message || 'Không thể xóa vai trò!');
          }
        } catch (err) {
          console.error('Delete role error:', err);
          message.error('Không thể xóa vai trò!');
        }
      },
    });
  };

  const filteredRoles = roles.filter(r => {
    if (!searchTerm) return true;
    const k = searchTerm.toLowerCase();
    return (r.tenVaiTro || '').toLowerCase().includes(k)
      || (r.moTa || '').toLowerCase().includes(k);
  });

  return (
    <div className="admin-permissions">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Tìm kiếm vai trò..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm vai trò
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
                  <th style={{ width: '60px' }}>STT</th>
                  <th>Tên vai trò</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      {searchTerm ? 'Không tìm thấy vai trò nào' : 'Chưa có vai trò nào'}
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, idx) => (
                    <tr key={role._id || role.id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="role-badge">{role.tenVaiTro || ''}</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon edit" title="Sửa" onClick={() => handleOpenModal(role)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(role._id || role.id)}>
                            <i className="fa-solid fa-trash"></i>
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                {editingId ? 'Sửa vai trò' : 'Thêm vai trò mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-section">
                  <h4 className="section-label">Thông tin vai trò</h4>
                  <div className="modal-field">
                    <label>Tên vai trò <span className="required">*</span></label>
                    <input
                      type="text"
                      name="tenVaiTro"
                      value={form.tenVaiTro}
                      onChange={handleInput}
                      placeholder="VD: Quản lý, Nhân viên..."
                      required
                    />
                  </div>
                  <div className="modal-field">
                    <label>Mô tả</label>
                    <textarea
                      name="moTa"
                      rows={3}
                      value={form.moTa}
                      onChange={handleInput}
                      placeholder="Nhập mô tả cho vai trò này..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={handleCloseModal}>
                  <i className="fa-solid fa-xmark"></i> Hủy
                </button>
                <button type="submit" className="btn-admin-primary" disabled={submitting}>
                  {submitting ? (
                    <><i className="fa fa-spinner fa-spin"></i> Đang lưu...</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm vai trò'}</>
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

export default AdminRoles;