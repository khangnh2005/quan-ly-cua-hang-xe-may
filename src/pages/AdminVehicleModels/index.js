import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { del, get, post, patch } from '../../untils/requests';
import '../../css/admin.scss';

// Initial state for form
// Lưu ý: API dùng tên trường "loaiXe" (KHÔNG phải loaiXeId)
const emptyVehicleModel = {
  tenDongXe: '',
  loaiXeId: '',
  giaNiemYet: '',
  dungTichXiLanh: '',
  namSanXuat: '',
  mucTieuThuNhienLieu: '',
  moTa: '',
};

function AdminVehicleModels() {
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyVehicleModel });
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVehicleModels();
    fetchVehicleCategories();
  }, []);

  // Fetch vehicle categories for dropdown - API trả về {message, data: [...]}
  const fetchVehicleCategories = async () => {
    try {
      const res = await get('vehicle-categories');
      const categories = Array.isArray(res) ? res : (res?.data || []);
      setVehicleCategories(categories);
      console.log('Loaded vehicle categories:', categories);
    } catch (err) {
      console.error('Fetch categories error:', err);
      message.error('Không thể tải danh sách loại xe!');
    }
  };

  // Fetch vehicle models - API trả về {message, data: [...]}
  // Cấu trúc mỗi model: { _id, tenDongXe, loaiXe: { _id, tenLoaiXe, moTa }, giaNiemYet, ... }
  const fetchVehicleModels = async () => {
    try {
      setLoading(true);
      const res = await get('vehicle-models');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setVehicleModels(list);
      console.log('Loaded vehicle models:', list);
    } catch (err) {
      console.error('Fetch vehicle models error:', err);
      message.error('Không thể tải danh sách dòng xe');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0₫';
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      // record.loaiXe có thể là object { _id, tenLoaiXe } hoặc null
      // record.loaiXe là object { _id, tenLoaiXe, moTa } - lấy _id để set vào form
      setForm({
        tenDongXe: record.tenDongXe || '',
        loaiXeId: record.loaiXe?._id || '',
        giaNiemYet: record.giaNiemYet || '',
        dungTichXiLanh: record.dungTichXiLanh || '',
        namSanXuat: record.namSanXuat || '',
        mucTieuThuNhienLieu: record.mucTieuThuNhienLieu || '',
        moTa: record.moTa || '',
      });
      setEditingId(record._id);
    } else {
      setForm({ ...emptyVehicleModel });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ ...emptyVehicleModel });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.tenDongXe.trim()) {
      message.error('Vui lòng nhập tên dòng xe!');
      return;
    }
    if (!form.loaiXeId) {
      message.error('Vui lòng chọn loại xe!');
      return;
    }
    if (!form.giaNiemYet) {
      message.error('Vui lòng nhập giá niêm yết!');
      return;
    }
    if (!form.dungTichXiLanh) {
      message.error('Vui lòng nhập dung tích xy-lanh!');
      return;
    }

    setSubmitting(true);
    try {
      // Payload gọi API - dùng tên trường khớp với schema: loaiXe thay vì loaiXeId
      const payload = {
        tenDongXe: form.tenDongXe.trim(),
        loaiXeId: form.loaiXeId,
        giaNiemYet: Number(form.giaNiemYet),
        dungTichXiLanh: Number(form.dungTichXiLanh),
        namSanXuat: Number(form.namSanXuat) || new Date().getFullYear(),
        mucTieuThuNhienLieu: Number(form.mucTieuThuNhienLieu) || 0,
        moTa: form.moTa?.trim() || '',
      };

      console.log('Save vehicle model payload:', payload);

      let res;
      if (editingId) {
        // Update existing
        res = await post(`vehicle-models/update/${editingId}`, payload);
      } else {
        // Create new
        res = await post('vehicle-models/add', payload);
      }

      console.log('Save response:', res);

      if (res && (res.message?.toLowerCase().includes('success') || res.data?._id || res._id)) {
        message.success(res.message || (editingId ? 'Cập nhật dòng xe thành công!' : 'Thêm dòng xe thành công!'));
        handleCloseModal();
        fetchVehicleModels();
      } else {
        message.error(res?.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Save vehicle model error:', err);
      const errMsg = err?.response?.message || err?.response?.error || err?.message || 'Thao tác thất bại!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter by search
  const filteredVehicleModels = vehicleModels.filter(vm => {
    if (!searchTerm) return true;
    const keyword = searchTerm.toLowerCase();
    const name = (vm.tenDongXe || '').toLowerCase();
    const category = (vm.loaiXe?.tenLoaiXe || '').toLowerCase();
    return name.includes(keyword) || category.includes(keyword);
  });

  // Get category name helper
  const getCategoryName = (loaiXe) => {
    if (!loaiXe) return '-';
    if (typeof loaiXe === 'string') {
      const category = vehicleCategories.find(c => c._id === loaiXe);
      return category?.tenLoaiXe || '-';
    }
    return loaiXe?.tenLoaiXe || '-';
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa dòng xe này?',
      content: 'Hành động này sẽ xóa vĩnh viễn dòng xe khỏi hệ thống.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await del(`vehicle-models/delete/${id}`);
          if (res) {
            message.success('Đã xóa dòng xe thành công!');
            fetchVehicleModels();
          }
        } catch (err) {
          message.error('Không thể xóa dòng xe!');
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
              placeholder="Tìm kiếm dòng xe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm dòng xe
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
                  <th>Tên dòng xe</th>
                  <th>Loại xe</th>
                  <th>Giá niêm yết</th>
                  <th>Dung tích</th>
                  <th>Mô tả</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicleModels.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      {searchTerm ? 'Không tìm thấy dòng xe phù hợp' : 'Chưa có dòng xe nào'}
                    </td>
                  </tr>
                ) : (
                  filteredVehicleModels.map((vm, idx) => (
                    <tr key={vm._id || idx}>
                      <td>{idx + 1}</td>
                      <td><span className="product-name">{vm.tenDongXe || '-'}</span></td>
                      <td>{getCategoryName(vm.loaiXe)}</td>
                      <td className="price-col">{formatPrice(vm.giaNiemYet)}</td>
                      <td>{vm.dungTichXiLanh ? `${vm.dungTichXiLanh}cc` : '-'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vm.moTa || '-'}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-icon edit"
                            title="Sửa"
                            onClick={() => handleOpenModal(vm)}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="btn-icon view" title="Xem">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Xóa"
                            onClick={() => handleDelete(vm._id)}
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

      {/* Add/Edit Vehicle Model Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                {editingId ? 'Sửa dòng xe' : 'Thêm dòng xe mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Thông tin dòng xe</h4>

                    <div className="modal-field">
                      <label>Tên dòng xe <span className="required">*</span></label>
                      <input
                        type="text"
                        name="tenDongXe"
                        value={form.tenDongXe}
                        onChange={handleInput}
                        placeholder="VD: Vision 125cc"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>Loại xe <span className="required">*</span></label>
                      <select
                        name="loaiXeId"
                        value={form.loaiXeId}
                        onChange={handleInput}
                        required
                      >
                        <option value="">-- Chọn loại xe --</option>
                        {vehicleCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.tenLoaiXe}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="modal-field">
                      <label>Giá niêm yết <span className="required">*</span></label>
                      <input
                        type="number"
                        name="giaNiemYet"
                        value={form.giaNiemYet}
                        onChange={handleInput}
                        placeholder="VD: 35000000"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>Dung tích xy-lanh <span className="required">*</span></label>
                      <input
                        type="number"
                        name="dungTichXiLanh"
                        value={form.dungTichXiLanh}
                        onChange={handleInput}
                        placeholder="VD: 125"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>Năm sản xuất <span className="required">*</span></label>
                      <input type="number" name="namSanXuat" value={form.namSanXuat} onChange={handleInput} required />
                    </div>

                    <div className="modal-field">
                      <label>Mức tiêu thụ nhiên liệu <span className="required">*</span></label>
                      <input type="number" step="0.01" name="mucTieuThuNhienLieu" value={form.mucTieuThuNhienLieu} onChange={handleInput} required />
                    </div>

                    <div className="modal-field full-width">
                      <label>Mô tả</label>
                      <textarea
                        name="moTa"
                        value={form.moTa}
                        onChange={handleInput}
                        placeholder="Nhập mô tả chi tiết về dòng xe..."
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
                    <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm dòng xe'}</>
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

export default AdminVehicleModels;
