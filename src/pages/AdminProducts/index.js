import { useState, useEffect, useRef } from 'react';
import { message, Modal } from 'antd';
import { del, get, post, patch, uploadFile } from '../../untils/requests';
import '../../css/admin.scss';
import '../../css/style.scss';

// === OPTIONS KHỚP VỚI DATABASE ===
const STATUS_OPTIONS = [
  { value: 'ConHang', label: 'Còn hàng' },
  { value: 'HetHang', label: 'Hết hàng' },
  { value: 'DangBaoTri', label: 'Đang bảo trì' },
];
const COLOR_OPTIONS = ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Bạc', 'Xám', 'Nâu', 'Vàng', 'Đen bóng'];
const DEFAULT_IMAGE = 'https://cdn.honda.com.vn/motorbikes/November2024/sYTCNfgI5E0JUJ8BCTQ3.png';

const emptyVehicle = {
  dongXeId: '',
  soKhung: '',
  soMay: '',
  mauSac: 'Đen',
  namSanXuat: new Date().getFullYear(),
  trangThaiXe: 'ConHang',
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyVehicle });
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleModels, setVehicleModels] = useState([]);
const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadedImgUrl, setUploadedImgUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchProducts();
    fetchVehicleModels();
  }, []);

  const fetchVehicleModels = async () => {
    try {
      const res = await get('vehicle-models');
      const models = Array.isArray(res) ? res : (res?.data || []);
      setVehicleModels(models);
    } catch (err) {
      console.error('Fetch models error:', err);
      message.error('Không thể tải danh sách dòng xe!');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await get('vehicles');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
    } catch (err) {
      console.error('Fetch products error:', err);
      message.error('Không thể tải danh sách sản phẩm');
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không vượt quá 5MB!');
      return;
    }

    // Show preview immediately using blob URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);

    // Upload to server to get real URL
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await uploadFile('uploads/single', formData);
      console.log('Upload response:', res);

      // Lấy URL từ response - giống hệt Profile
      const newUploadedUrl = res?.data?.url || res?.data || res?.avatarUrl || res?.url;

      if (newUploadedUrl) {
        // Thành công: thay blob URL bằng URL thật từ server
        URL.revokeObjectURL(previewUrl);
        setImageFile(null);
        setImagePreview(newUploadedUrl);
        message.success('Tải ảnh lên thành công!');
      } else {
        // Thất bại: giữ lại file để submit dạng FormData
        console.error('Upload returned no URL, will use FormData fallback. Response:', res);
        message.warning('Không thể tải ảnh qua server, sẽ gửi kèm file khi lưu.');
      }
    } catch (err) {
      // Lỗi mạng: vẫn giữ file để submit dạng FormData
      console.error('Upload image error (will use FormData fallback):', err);
      message.warning('Lỗi kết nối upload ảnh, sẽ gửi kèm file khi lưu.');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      // dongXe có thể là object { _id, tenDongXe, ... } hoặc string ID
      const dongXeValue = typeof record.dongXe === 'object' && record.dongXe !== null
        ? record.dongXe._id
        : (record.dongXe || '');
      setForm({
        dongXeId: dongXeValue,
        soKhung: record.soKhung || '',
        soMay: record.soMay || '',
        mauSac: record.mauSac || 'Đen',
        namSanXuat: record.namSanXuat || new Date().getFullYear(),
        trangThaiXe: record.trangThaiXe || 'ConHang',
      });
      setEditingId(record._id);
      setImagePreview(record.hinhAnh || null);
      setImageFile(null);
    } else {
      setForm({ ...emptyVehicle });
      setEditingId(null);
      setImagePreview(null);
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ ...emptyVehicle });
    setEditingId(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const selectedModel = vehicleModels.find(m => m._id === form.dongXeId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.dongXeId) {
      message.error('Vui lòng chọn dòng xe!');
      return;
    }
    if (!form.soKhung.trim()) {
      message.error('Vui lòng nhập số khung!');
      return;
    }
    if (!form.soMay.trim()) {
      message.error('Vui lòng nhập số máy!');
      return;
    }

    if (uploadingImg) {
      message.warning('Vui lòng đợi ảnh tải lên xong!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        soKhung: form.soKhung.trim(),
        soMay: form.soMay.trim(),
        dongXeId: form.dongXeId,
        mauSac: form.mauSac,
        namSanXuat: Number(form.namSanXuat),
        trangThaiXe: form.trangThaiXe,
        hinhAnh: imagePreview || '',
      };

      let res;
      if (editingId) {
        res = await post(`vehicles/update/${editingId}`, payload);
      } else {
        res = await post('vehicles/add', payload);
      }

  if (res && (res.message?.toLowerCase().includes('success') || res.data?._id || res._id)) {
    message.success(res.message || (editingId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!'));
    handleCloseModal();
    fetchProducts();
  } else {
    message.error(res?.message || 'Thao tác thất bại!');
  }
} catch (err) {
  console.error('Save product error:', err);
  message.error('Thao tác thất bại, vui lòng kiểm tra lại dữ liệu!');
} finally {
  setSubmitting(false);
}
  };

  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const keyword = searchTerm.toLowerCase();
    const name = (p.dongXe?.tenDongXe || '').toLowerCase();
    const brand = (p.dongXe?.loaiXe?.tenLoaiXe || '').toLowerCase();
    const color = (p.mauSac || '').toLowerCase();
    const frame = (p.soKhung || '').toLowerCase();
    const engine = (p.soMay || '').toLowerCase();
    return name.includes(keyword) || brand.includes(keyword) || color.includes(keyword) || frame.includes(keyword) || engine.includes(keyword);
  });

  const getStatusLabel = (val) => {
    const opt = STATUS_OPTIONS.find(s => s.value === val);
    return opt ? opt.label : val;
  };

  const getStatusClass = (val) => {
    if (val === 'ConHang') return 'success';
    if (val === 'HetHang') return 'danger';
    if (val === 'DangBaoTri') return 'warning';
    return 'secondary';
  };

  const getImageUrl = (product) => {
    return product?.hinhAnh || DEFAULT_IMAGE;
  };

  // Pagination
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
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
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      content: 'Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await del(`vehicles/delete/${id}`);
          if (res) {
            message.success('Đã xóa sản phẩm thành công!');
            fetchProducts();
          }
        } catch (err) {
          message.error('Không thể xóa sản phẩm!');
        }
      },
      onCancel() { },
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
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus"></i> Thêm sản phẩm
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
                  <th style={{ width: '80px' }}>Ảnh</th>
                  <th>Tên xe</th>
                  <th>Loại xe</th>
                  <th>Màu sắc</th>
                  <th>Giá niêm yết</th>
                  <th>Trạng thái</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                      {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, idx) => (
                    <tr key={product._id || idx}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td>
                        <div className="product-thumb">
                          <img src={getImageUrl(product)} alt={product.dongXe?.tenDongXe} />
                        </div>
                      </td>
                      <td><span className="product-name">{product.dongXe?.tenDongXe || '-'}</span></td>
                      <td>{product.dongXe?.loaiXe?.tenLoaiXe || '-'}</td>
                      <td>{product.mauSac || '-'}</td>
                      <td className="price-col">{formatPrice(product.dongXe?.giaNiemYet)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(product.trangThaiXe)}`}>
                          {getStatusLabel(product.trangThaiXe)}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon edit" title="Sửa" onClick={() => handleOpenModal(product)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="btn-icon view" title="Xem">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(product._id)}>
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

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                {editingId ? 'Sửa sản phẩm' : 'Thêm xe mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
                    <h4 className="section-label">Chọn dòng xe</h4>

                    <div className="modal-field">
                      <label>Dòng xe <span className="required">*</span></label>
                      <select
                        name="dongXeId"
                        value={form.dongXeId}
                        onChange={handleInput}
                        required
                      >
                        <option value="">-- Chọn dòng xe --</option>
                        {vehicleModels.map(model => (
                          <option key={model._id} value={model._id}>
                            {model.tenDongXe} ({model.namSanXuat}) - {formatPrice(model.giaNiemYet)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedModel && (
                      <div className="model-info-box">
                        <div className="info-row">
                          <span className="info-label">Loại xe:</span>
                          <span className="info-value">{selectedModel.loaiXe?.tenLoaiXe || '-'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Giá niêm yết:</span>
                          <span className="info-value price">{formatPrice(selectedModel.giaNiemYet)}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Dung tích xy-lanh:</span>
                          <span className="info-value">{selectedModel.dungTichXiLanh}cc</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Mô tả:</span>
                          <span className="info-value">{selectedModel.moTa || '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-section">
                    <h4 className="section-label">Thông tin xe</h4>

                    <div className="modal-field">
                      <label>Số khung <span className="required">*</span></label>
                      <input
                        type="text"
                        name="soKhung"
                        value={form.soKhung}
                        onChange={handleInput}
                        placeholder="VD: VIS004"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>Số máy <span className="required">*</span></label>
                      <input
                        type="text"
                        name="soMay"
                        value={form.soMay}
                        onChange={handleInput}
                        placeholder="VD: VM004"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>Màu sắc <span className="required">*</span></label>
                      <select name="mauSac" value={form.mauSac} onChange={handleInput} required>
                        {COLOR_OPTIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="modal-field">
                      <label>Năm sản xuất <span className="required">*</span></label>
                      <input
                        type="number"
                        name="namSanXuat"
                        value={form.namSanXuat}
                        onChange={handleInput}
                        min="2000"
                        max="2030"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>Trạng thái <span className="required">*</span></label>
                      <select name="trangThaiXe" value={form.trangThaiXe} onChange={handleInput} required>
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Hình ảnh */}
                    <div className="modal-field">
                      <label>Hình ảnh</label>
                      <div className="image-upload-wrapper">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                          id="hinhAnhInput"
                        />
                        <div className="image-upload-preview">
                          {imagePreview ? (
                            <div className="image-preview-container">
                              <img src={imagePreview} alt="Preview" className="image-preview" />
                              <button
                                type="button"
                                className="btn-remove-image"
                                onClick={handleRemoveImage}
                                title="Xóa ảnh"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
                              <i className="fa-solid fa-camera" style={{ fontSize: '32px', color: '#ccc' }}></i>
                              <p style={{ marginTop: '8px', color: '#999', fontSize: '13px' }}>
                                {editingId ? 'Nhấn để thay đổi ảnh' : 'Nhấn để chọn ảnh'}
                              </p>
                            </div>
                          )}
                        </div>
                        {!imagePreview && (
                          <button type="button" className="btn-upload-image" onClick={() => fileInputRef.current?.click()}>
                            <i className="fa-solid fa-upload"></i> Chọn ảnh
                          </button>
                        )}
                      </div>
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
                    <><i className="fa-solid fa-floppy-disk"></i> {editingId ? 'Cập nhật' : 'Thêm sản phẩm'}</>
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

export default AdminProducts;