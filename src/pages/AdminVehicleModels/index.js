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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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
      message.error('Không thể tải danh sách hãng xe');
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
      message.error('Vui lòng nhập tên hãng xe!');
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
        message.success(res.message || (editingId ? 'Cập nhật hãng xe thành công!' : 'Thêm hãng xe thành công!'));
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredVehicleModels.length / ITEMS_PER_PAGE);
  const paginatedModels = filteredVehicleModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa hãng xe này?',
      content: 'Hành động này sẽ xóa vĩnh viễn hãng xe khỏi hệ thống.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await del(`vehicle-models/delete/${id}`);
          if (res) {
            message.success('Đã xóa hãng xe thành công!');
            fetchVehicleModels();
          }
        } catch (err) {
          message.error('Không thể xóa hãng xe!');
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
              placeholder="Tìm kiếm hãng xe..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm hãng xe
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
                  <th>Tên hãng xe</th>
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
                      {searchTerm ? 'Không tìm thấy hãng xe phù hợp' : 'Chưa có hãng xe nào'}
                    </td>
                  </tr>
                ) : (
                  paginatedModels.map((vm, idx) => (
                    <tr key={vm._id || idx}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
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

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button className="page-number" onClick={() => setCurrentPage(1)}>1</button>
                <span className="page-dots">...</span>
              </>
            )}
            {getPageNumbers().map(page => (
              <button
                key={page}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="page-dots">...</span>
                <button className="page-number" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
              </>
            )}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Vehicle Model Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                {editingId ? 'Sửa hãng xe' : 'Thêm hãng xe mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Thông tin hãng xe</h4>

                    <div className="modal-field">
                      <label>Tên hãng xe <span className="required">*</span></label>
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
                        placeholder="Nhập mô tả chi tiết về hãng xe..."
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
                    <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm hãng xe'}</>
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
