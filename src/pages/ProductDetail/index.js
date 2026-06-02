import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { get } from '../../untils/requests';

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

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await get(`vehicles/detail/${id}`);
        console.log('Vehicle detail response:', response);
        // Hỗ trợ nhiều kiểu response: response.data hoặc response trực tiếp
        const data = response?.data || response;
        if (data && data._id) {
          setVehicle(data);
        } else {
          setError('Không tìm thấy sản phẩm.');
        }
      } catch (err) {
        setError('Không thể tải chi tiết sản phẩm.');
        console.error('Error fetching vehicle detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  function handleRedirectToLogin() {
    navigate('/login');
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

  const { dongXe, mauSac, soKhung, soMay, trangThaiXe, namSanXuat, createdAt } = vehicle;

  return (
    <div className="product-detail-page">
      <div className="detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{dongXe?.tenDongXe}</span>
      </div>

      <div className="detail-main">
        {/* Left - Image */}
        <div className="detail-image-section">
          <div className="detail-image-wrapper">
            <img
              src={getVehicleImage(vehicle)}
              alt={dongXe?.tenDongXe}
            />
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

        {/* Right - Info */}
        <div className="detail-info-section">
          <h1 className="detail-title">{dongXe?.tenDongXe}</h1>
          <p className="detail-brand">
            <span className="label">Hãng sản xuất:</span> {dongXe?.tenDongXe}
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
                <tr>
                  <td className="spec-key">Số khung</td>
                  <td className="spec-value">{soKhung}</td>
                </tr>
                <tr>
                  <td className="spec-key">Số máy</td>
                  <td className="spec-value">{soMay}</td>
                </tr>
                <tr>
                  <td className="spec-key">Màu sắc</td>
                  <td className="spec-value">{mauSac}</td>
                </tr>
                <tr>
                  <td className="spec-key">Dung tích xy-lanh</td>
                  <td className="spec-value">{dongXe?.dungTichXiLanh ? `${dongXe.dungTichXiLanh}cc` : 'Đang cập nhật'}</td>
                </tr>
                <tr>
                  <td className="spec-key">Mức tiêu thụ nhiên liệu</td>
                  <td className="spec-value">{dongXe?.mucTieuThuNhienLieu ? `${dongXe.mucTieuThuNhienLieu} L/100km` : 'Đang cập nhật'}</td>
                </tr>
                <tr>
                  <td className="spec-key">Mô tả</td>
                  <td className="spec-value">{dongXe?.moTa || 'Đang cập nhật'}</td>
                </tr>
                
              </tbody>
            </table>
          </div>

          <div className="detail-actions">
            <button className="btn-buy-now" onClick={handleRedirectToLogin}>
              <i className="fa fa-bolt"></i> Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;