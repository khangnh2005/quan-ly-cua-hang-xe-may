import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { del, get, post, patch } from '../../../untils/requests';
import '../../../css/admin.scss';

// Initial state for form
const emptyVehicleCategory = {
  tenLoaiXe: '',
  moTa: '',
  deleted: false,
};

function AdminVehicleCategories() {
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyVehicleCategory });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVehicleCategories();
  }, []);

  // Fetch vehicle categories
  const fetchVehicleCategories = async () => {
    try {
      setLoading(true);
      const res = await get('vehicle-categories');
      const list = Array.isArray(res) ? res : (res?.data || []);
      // Filter out deleted items
      const activeList = list.filter(item => !item.deleted);
      setVehicleCategories(activeList);
    } catch (err) {
      console.error('Fetch vehicle categories error:', err);
      message.error('Không thể tải danh sách loại xe');
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
        tenLoaiXe: record.tenLoaiXe || '',
        moTa: record.moTa || '',
        deleted: false,
      });
      setEditingId(record._id);
    } else {
      setForm({ ...emptyVehicleCategory });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ ...emptyVehicleCategory });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.tenLoaiXe.trim()) {
      message.error('Vui lòng nhập tên loại xe!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tenLoaiXe: form.tenLoaiXe.trim(),
        moTa: form.moTa?.trim() || '',
      };

      let res;
      if (editingId) {
        // Update existing
        res = await post(`vehicle-categories/update/${editingId}`, payload);
      } else {
        // Create new
        res = await post('vehicle-categories/add', payload);
      }

      if (res && (res.message?.includes('success') || res.data?._id || res._id)) {
        message.success(editingId ? 'Cập nhật loại xe thành công!' : 'Thêm loại xe thành công!');
        handleCloseModal();
        fetchVehicleCategories();
      } else {
        message.error(res?.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Save vehicle category error:', err);
      const errMsg = err?.response?.message || err?.response?.error || err?.message || 'Thao tác thất bại!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter by search
  const filteredVehicleCategories = vehicleCategories.filter(vc => {
    if (!searchTerm) return true;
    const keyword = searchTerm.toLowerCase();
    const name = (vc.tenLoaiXe || '').toLowerCase();
    const desc = (vc.moTa || '').toLowerCase();
    return name.includes(keyword) || desc.includes(keyword);
  });

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa loại xe này?',
      content: 'Hành động này sẽ xóa vĩnh viễn loại xe khỏi hệ thống.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await del(`vehicle-categories/delete/${id}`);
          if (res) {
            message.success('Đã xóa loại xe thành công!');
            fetchVehicleCategories();
          }
        } catch (err) {
          message.error('Không thể xóa loại xe!');
        }
      },
      onCancel() {
        console.log('Đã hủy xóa');
      },
    });
  };

  return (
    <div className="admin-products">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm loại xe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm loại xe
          </button>
          <button className="btn-admin-secondary">
            <i className="fa-solid fa-download"></i> Xuất Excel
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
                  <th style={{ width: '50px' }}>STT</th>
                  <th>Tên loại xe</th>
                  <th>Mô tả</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicleCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      {searchTerm ? 'Không tìm thấy loại xe phù hợp' : 'Chưa có loại xe nào'}
                    </td>
                  </tr>
                ) : (
                  filteredVehicleCategories.map((vc, idx) => (
                    <tr key={vc._id || idx}>
                      <td>{idx + 1}</td>
                      <td><span className="product-name">{vc.tenLoaiXe || '-'}</span></td>
                      <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vc.moTa || '-'}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-icon edit"
                            title="Sửa"
                            onClick={() => handleOpenModal(vc)}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="btn-icon view" title="Xem">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Xóa"
                            onClick={() => handleDelete(vc._id)}
                          >
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

      {/* Add/Edit Vehicle Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                {editingId ? 'Sửa loại xe' : 'Thêm loại xe mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Thông tin loại xe</h4>

                    <div className="modal-field">
                      <label>Tên loại xe <span className="required">*</span></label>
                      <input
                        type="text"
                        name="tenLoaiXe"
                        value={form.tenLoaiXe}
                        onChange={handleInput}
                        placeholder="VD: Xe số, Xe tay ga, Xe côn tay..."
                        required
                      />
                    </div>

                    <div className="modal-field full-width">
                      <label>Mô tả</label>
                      <textarea
                        name="moTa"
                        value={form.moTa}
                        onChange={handleInput}
                        placeholder="Nhập mô tả chi tiết về loại xe..."
                        rows="3"
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
                    <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm loại xe'}</>
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

export default AdminVehicleCategories;
