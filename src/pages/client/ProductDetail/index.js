import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { get, post } from '../../../untils/requests';
import { getCookie } from '../../../helpers/cookie';
import '../../../css/style.scss';



function formatPrice(price) {
  if (!price) return '0 VND';
  return price.toLocaleString('vi-VN') + ' VND';
}

const DEFAULT_VEHICLE_IMAGE = 'https://cdn.honda.com.vn/motorbikes/November2024/sYTCNfgI5E0JUJ8BCTQ3.png';

function getVehicleImage(vehicle) {
  if (vehicle?.hinhAnh) {
    if (Array.isArray(vehicle.hinhAnh) && vehicle.hinhAnh.length > 0) {
      return vehicle.hinhAnh[0] || DEFAULT_VEHICLE_IMAGE;
    }
    if (typeof vehicle.hinhAnh === 'string' && vehicle.hinhAnh.trim()) {
      return vehicle.hinhAnh;
    }
  }
  return DEFAULT_VEHICLE_IMAGE;
}

const QUAN_HUYEN = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
  'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp',
  'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Bình Tân',
  'Huyện Bình Chánh', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè', 'Huyện Cần Giờ',
  'Thành phố Thủ Đức',
];

const PAYMENT_METHODS = [
  { value: 'TienMat', label: 'Thanh toán tiền mặt khi nhận xe' },
  { value: 'ChuyenKhoan', label: 'Chuyển khoản ngân hàng' },
  { value: 'TraGop', label: 'Trả góp qua công ty tài chính' },
  { value: 'TheTinDung', label: 'Thẻ tín dụng / Ví điện tử' },
];

const emptyForm = {
  hoTen: '',
  soDienThoai: '',
  email: '',
  quanHuyen: '',
  phuongThucThanhToan: '',
  ghiChu: '',
};

function ProductDetail() {
  const { id } = useParams();
  // Lấy ID khách hàng: ưu tiên từ cookie (giữ qua refresh), fallback Redux
  const loginState = useSelector(state => state.loginReducer);
  const currentUserId = getCookie('userId') || loginState?.token || '';

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);


  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await get(`vehicles/detail/${id}`);
        const data = response?.data || response;
        if (data && data._id) {
          setVehicle(data);
        } else {
          setError('Không tìm thấy sản phẩm.');
        }
      } catch (err) {
        setError('Không thể tải chi tiết sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);



  function handleOpenBuyModal() {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    setShowBuyModal(true);
  }

  function handleCloseBuyModal() {
    setShowBuyModal(false);
    setForm(emptyForm);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmitOrder(e) {
    e.preventDefault();

    if (!form.hoTen.trim()) {
      message.error('Vui lòng nhập họ tên!');
      return;
    }
    if (!form.soDienThoai.trim()) {
      message.error('Vui lòng nhập số điện thoại!');
      return;
    }
    if (!/^[0-9]{9,11}$/.test(form.soDienThoai.trim())) {
      message.error('Số điện thoại không hợp lệ (9-11 chữ số)!');
      return;
    }
    if (form.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email.trim())) {
      message.error('Email không hợp lệ!');
      return;
    }
    if (!form.quanHuyen) {
      message.error('Vui lòng chọn Quận/Huyện!');
      return;
    }
    if (!form.phuongThucThanhToan) {
      message.error('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    setSubmitting(true);
    try {
      const giaBan = vehicle?.dongXe?.giaNiemYet || 0;

      const orderPayload = {
        khachHangId: currentUserId,
        trangThaiDonHang: 'ChoXuLy',
        hoTen: form.hoTen.trim(),
        soDienThoai: form.soDienThoai.trim(),
        email: form.email.trim() || '',
        diaChi: form.quanHuyen,
        phuongThucThanhToan: form.phuongThucThanhToan,
        ghiChu: form.ghiChu.trim() || '',
        tongTien: Number(giaBan) || 0,
        ngayDat: new Date().toISOString(),
        chiTiet: {
          xeId: vehicle._id,
          giaBan: Number(giaBan) || 0,
        },
      };

      console.log('Order payload:', orderPayload);
      console.log('Auth token from cookie:', document.cookie);

      const res = await post('orders/add', orderPayload);

      console.log('Order response:', res);





      if (res && (res._ok || res.success || res._status === 200 || res._status === 201 || res.data)) {
        message.success('Đặt hàng thành công! Long Moto sẽ liên hệ với bạn trong thời gian sớm nhất.');
        handleCloseBuyModal();
      } else {
        message.error(res?.message || 'Đặt hàng thất bại, vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Submit order error:', err);
      message.error('Có lỗi xảy ra, vui lòng thử lại sau!');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-loading" style={{ textAlign: 'center', padding: '100px 0' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#ed1c24' }}></i>
        <p style={{ marginTop: '16px', color: '#666' }}>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="detail-error" style={{ textAlign: 'center', padding: '100px 0' }}>
        <i className="fa fa-exclamation-circle" style={{ fontSize: '48px', color: '#ed1c24' }}></i>
        <p style={{ marginTop: '16px', fontSize: '16px', color: '#ed1c24' }}>{error || 'Không tìm thấy sản phẩm.'}</p>
        <Link to="/" style={{ display: 'inline-block', marginTop: '20px', color: '#ed1c24', fontWeight: 'bold' }}>
          <i className="fa fa-arrow-left"></i> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const { dongXe, mauSac, soKhung, soMay, trangThaiXe, namSanXuat } = vehicle;

  return (
    <div className="product-detail-page">
      <div className="detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/">Sản phẩm</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{dongXe?.tenDongXe}</span>
      </div>

      <div className="detail-main">
        <div className="detail-image-section">
          <div className="detail-image-wrapper">
            <img src={getVehicleImage(vehicle)} alt={dongXe?.tenDongXe} />
          </div>
          <div className="detail-thumbnails">
            <div className="thumb-item active">
              <img src={getVehicleImage(vehicle)} alt="thumb" />
            </div>
            <div className="thumb-item">
              <img src={getVehicleImage(vehicle)} alt="thumb" />
            </div>
            <div className="thumb-item">
              <img src={getVehicleImage(vehicle)} alt="thumb" />
            </div>
          </div>
        </div>

        <div className="detail-info-section">
          <h1 className="detail-title">{dongXe?.tenDongXe}</h1>
          <p className="detail-brand">
            <span className="label">Hãng sản xuất:</span> {dongXe?.loaiXe?.tenLoaiXe || 'Honda'}
          </p>
          <p className="detail-year">
            <span className="label">Năm sản xuất:</span> {namSanXuat || dongXe?.namSanXuat || 'Đang cập nhật'}
          </p>

          <div className="detail-price-box">
            <span className="price-label">Giá niêm yết:</span>
            <span className="price-value">{formatPrice(dongXe?.giaNiemYet)}</span>
          </div>

          <div className="detail-status">
            <span className="label">Trạng thái:</span>
            {trangThaiXe === 'ConHang' ? (
              <span className="status-instock">● Còn hàng</span>
            ) : (
              <span className="status-outstock">● Hết hàng</span>
            )}
          </div>

          <div className="detail-specs">
            <h3>Thông số kỹ thuật</h3>
            <table className="specs-table">
              <tbody>
                <tr><td className="spec-key">Số khung</td><td className="spec-value">{soKhung}</td></tr>
                <tr><td className="spec-key">Số máy</td><td className="spec-value">{soMay}</td></tr>
                <tr><td className="spec-key">Màu sắc</td><td className="spec-value">{mauSac}</td></tr>
                <tr><td className="spec-key">Dung tích xy-lanh</td><td className="spec-value">{dongXe?.dungTichXiLanh ? `${dongXe.dungTichXiLanh}cc` : 'Đang cập nhật'}</td></tr>
                <tr><td className="spec-key">Mức tiêu thụ nhiên liệu</td><td className="spec-value">{dongXe?.mucTieuThuNhienLieu ? `${dongXe.mucTieuThuNhienLieu} L/100km` : 'Đang cập nhật'}</td></tr>
                <tr><td className="spec-key">Mô tả</td><td className="spec-value">{dongXe?.moTa || 'Đang cập nhật'}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="detail-actions">
            <button
              className="btn-buy-now"
              onClick={handleOpenBuyModal}
              disabled={trangThaiXe !== 'ConHang'}
              style={trangThaiXe !== 'ConHang' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <i className="fa fa-bolt"></i> Mua ngay
            </button>
          </div>
        </div>
      </div>

      {showBuyModal && (
        <div className="buy-modal-overlay" onClick={handleCloseBuyModal}>
          <div className="buy-modal-container" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="buy-modal-close"
              onClick={handleCloseBuyModal}
              aria-label="Đóng"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h2 className="buy-modal-title">Mua hàng</h2>
            <p className="buy-modal-product">
              Sản phẩm: <strong>{dongXe?.tenDongXe}</strong>
              {mauSac && <span className="buy-modal-color"> - {mauSac}</span>}
            </p>
            <p className="buy-modal-price">
              Giá: <strong style={{ color: '#ed1c24' }}>{formatPrice(dongXe?.giaNiemYet)}</strong>
            </p>

            <form onSubmit={handleSubmitOrder} className="buy-form">
              <div className="buy-form-row">
                <div className="buy-form-field">
                  <input
                    type="text"
                    name="hoTen"
                    value={form.hoTen}
                    onChange={handleInputChange}
                    placeholder="Họ tên *"
                    required
                  />
                </div>
                <div className="buy-form-field">
                  <input
                    type="tel"
                    name="soDienThoai"
                    value={form.soDienThoai}
                    onChange={handleInputChange}
                    placeholder="Điện thoại *"
                    required
                  />
                </div>
              </div>

              <div className="buy-form-row">
                <div className="buy-form-field">
                  <select
                    name="quanHuyen"
                    value={form.quanHuyen}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn Quận/Huyện *</option>
                    {QUAN_HUYEN.map(qh => (
                      <option key={qh} value={qh}>{qh}</option>
                    ))}
                  </select>
                </div>
                <div className="buy-form-field">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="buy-form-field buy-form-field-full">
                <select
                  name="phuongThucThanhToan"
                  value={form.phuongThucThanhToan}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn phương thức thanh toán *</option>
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>

              <div className="buy-form-field buy-form-field-full">
                <textarea
                  name="ghiChu"
                  value={form.ghiChu}
                  onChange={handleInputChange}
                  placeholder="Ghi chú"
                  rows="4"
                />
              </div>

              <button type="submit" className="buy-submit-btn" disabled={submitting}>
                {submitting ? (
                  <><i className="fa fa-spinner fa-spin"></i> ĐANG XỬ LÝ...</>
                ) : (
                  'MUA NGAY'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
