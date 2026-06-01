import { useState, useEffect } from 'react';
import { message } from 'antd';
import { del, get, post } from '../../untils/requests';
import '../../css/admin.scss';

// === OPTIONS KHỚP VỚI DATABASE ===
// Lưu ý: trangThaiXe trong DB lưu camelCase KHÔNG dấu: "ConHang" / "HetHang"
const STATUS_OPTIONS = [
  { value: 'ConHang', label: 'Còn hàng' },
  { value: 'HetHang', label: 'Hết hàng' },
  { value: 'DangBaoTri', label: 'Đang bảo trì' },
];
const COLOR_OPTIONS = ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Bạc', 'Xám', 'Nâu', 'Vàng', 'Đen bóng'];

// Initial state cho form thêm xe mới
// (giá niêm yết & mô tả lấy từ Vehicle Model - không nhập tay)
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

  useEffect(() => {
    fetchProducts();
    fetchVehicleModels();
  }, []);

  // Lấy danh sách dòng xe để chọn
  const fetchVehicleModels = async () => {
    try {
      // API trả về MẢNG trực tiếp, không bọc trong {data: [...]}
      const res = await get('vehicle-models');
      const models = Array.isArray(res) ? res : (res?.data || []);
      // Lọc ra những model chưa bị xóa
      const activeModels = models.filter(m => !m.deleted);
      setVehicleModels(activeModels);
      console.log('Loaded vehicle models:', activeModels);
    } catch (err) {
      console.error('Fetch models error:', err);
      message.error('Không thể tải danh sách dòng xe!');
    }
  };

  // Lấy danh sách xe
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
    if (!price) return '0₫';
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setForm({ ...emptyVehicle });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ ...emptyVehicle });
  };

  // Lấy thông tin model đang được chọn
  const selectedModel = vehicleModels.find(m => m._id === form.dongXeId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
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

    setSubmitting(true);
    try {
      // Payload gọi API - CHỈ gửi các trường có trong schema Vehicle
      // KHÔNG gửi giaNiemYet, moTa vì 2 trường này thuộc Vehicle Model
      const payload = {
        soKhung: form.soKhung.trim(),
        soMay: form.soMay.trim(),
        dongXeId: form.dongXeId,
        mauSac: form.mauSac,
        namSanXuat: Number(form.namSanXuat),
        trangThaiXe: form.trangThaiXe,
      };

      console.log('Add vehicle payload:', payload);

      const res = await post('vehicles/add', payload);
      console.log('Add vehicle response:', res);

      if (res && (res.message?.includes('success') || res.data?._id || res._id)) {
        message.success(res.message || 'Thêm sản phẩm thành công!');
        handleCloseModal();
        fetchProducts();
      } else {
        message.error(res?.message || 'Thêm sản phẩm thất bại!');
      }
    } catch (err) {
      console.error('Add product error:', err);
      const errMsg =
        err?.response?.message ||
        err?.response?.error ||
        err?.message ||
        'Thêm sản phẩm thất bại! Có thể số khung hoặc số máy đã tồn tại.';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const keyword = searchTerm.toLowerCase();
    const name = (p.dongXeId?.tenDongXe || '').toLowerCase();
    const brand = (p.dongXeId?.loaiXeId?.tenLoaiXe || '').toLowerCase();
    return name.includes(keyword) || brand.includes(keyword);
  });

  // Helper: hiển thị label trang thái đẹp
  const getStatusLabel = (val) => {
    const opt = STATUS_OPTIONS.find(s => s.value === val);
    return opt ? opt.label : val;
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?')) return;

  try {
    // Gọi API xóa cứng: vehicles/delete/:id
    const res = await del(`vehicles/delete/${id}`);
    
    if (res) {
      message.success('Đã xóa sản phẩm!');
      fetchProducts(); // Tải lại danh sách sau khi xóa
    }
  } catch (err) {
    message.error('Không thể xóa sản phẩm!');
  }
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
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary" onClick={handleOpenModal}>
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
                  filteredProducts.map((product, idx) => (
                    <tr key={product._id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="product-thumb">
                          <img
                            src="https://cdn.honda.com.vn/motorbikes/November2024/sYTCNfgI5E0JUJ8BCTQ3.png"
                            alt={product.dongXeId?.tenDongXe}
                          />
                        </div>
                      </td>
                      <td><span className="product-name">{product.dongXeId?.tenDongXe || '-'}</span></td>
                      <td>{product.dongXeId?.loaiXeId?.tenLoaiXe || '-'}</td>
                      <td>{product.mauSac || '-'}</td>
                      <td className="price-col">{formatPrice(product.dongXeId?.giaNiemYet)}</td>
                      <td>
                        <span className={`status-badge ${product.trangThaiXe === 'ConHang' ? 'success' : 'danger'}`}>
                          {getStatusLabel(product.trangThaiXe)}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon edit" title="Sửa"><i className="fa-solid fa-pen"></i></button>
                          <button className="btn-icon view" title="Xem"><i className="fa-solid fa-eye"></i></button>
                          <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(product._id)}><i className="fa-solid fa-trash"></i></button>
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

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-plus-circle"></i> Thêm xe mới</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  {/* Thông tin dòng xe (chọn từ danh sách có sẵn) */}
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

                    {/* Hiển thị thông tin dòng xe đã chọn (read-only) */}
                    {selectedModel && (
                      <div className="model-info-box">
                        <div className="info-row">
                          <span className="info-label">Loại xe:</span>
                          <span className="info-value">{selectedModel.loaiXeId?.tenLoaiXe || '-'}</span>
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

                  {/* Thông tin xe cụ thể (số khung, số máy, màu) */}
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
                      <select
                        name="mauSac"
                        value={form.mauSac}
                        onChange={handleInput}
                        required
                      >
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
                      <select
                        name="trangThaiXe"
                        value={form.trangThaiXe}
                        onChange={handleInput}
                        required
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
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
                    <><i className="fa fa-spinner fa-spin"></i> Đang thêm...</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk"></i> Thêm sản phẩm</>
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