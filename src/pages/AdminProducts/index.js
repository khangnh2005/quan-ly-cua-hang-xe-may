import { useState, useEffect } from 'react';
import { get } from '../../untils/requests';
import '../../css/admin.scss';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await get('vehicles');
        if (res && res.data) setProducts(res.data);
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    if (!price) return '0₫';
    return price.toLocaleString('vi-VN') + '₫';
  };

  return (
    <div className="admin-products">
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-admin-primary">
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
                  <th>Hãng</th>
                  <th>Màu sắc</th>
                  <th>Giá niêm yết</th>
                  <th>Trạng thái</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
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
                    <td><span className="product-name">{product.dongXeId?.tenDongXe}</span></td>
                    <td>{product.dongXeId?.tenHang}</td>
                    <td>{product.mauSac || 'Đen'}</td>
                    <td className="price-col">{formatPrice(product.dongXeId?.giaNiemYet)}</td>
                    <td>
                      <span className={`status-badge ${product.trangThaiXe === 'Còn hàng' ? 'success' : 'danger'}`}>
                        {product.trangThaiXe || 'Còn hàng'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon edit" title="Sửa"><i className="fa-solid fa-pen"></i></button>
                        <button className="btn-icon view" title="Xem"><i className="fa-solid fa-eye"></i></button>
                        <button className="btn-icon delete" title="Xóa"><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;