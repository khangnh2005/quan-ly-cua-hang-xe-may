import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { get } from '../../../untils/requests';

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

function Home() {
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [activeBrands, setActiveBrands] = useState([]);
  const [activeModels, setActiveModels] = useState([]);
  const [activePrice, setActivePrice] = useState('all');
  const [activeCategory, setActiveCategory] = useState('Tất Cả');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Scroll to products section when navigating from another page via "Sản phẩm" button
  useEffect(() => {
    if (location.state?.scrollToProducts) {
      const timer = setTimeout(() => {
        const section = document.getElementById('search-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        // Clear state to prevent re-scrolling on re-renders
        window.history.replaceState({}, document.title);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await get('vehicles');
        const list = Array.isArray(response) ? response : (response?.data || []);
        setVehicles(list);
      } catch (err) {
        setError('Không thể tải dữ liệu xe. Vui lòng thử lại sau.');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Extract unique brands and models from data
  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(vehicles.map(v => v.dongXe?.loaiXe?.tenLoaiXe).filter(Boolean))];
    return brands;
  }, [vehicles]);

  const uniqueModels = useMemo(() => {
    const models = [...new Set(vehicles.map(v => v.dongXe?.tenDongXe).filter(Boolean))];
    return models;
  }, [vehicles]);

  // Set default selected brands/models when data loads
  useEffect(() => {
    if (uniqueBrands.length > 0 && activeBrands.length === 0) {
      setActiveBrands(uniqueBrands);
    }
    if (uniqueModels.length > 0 && activeModels.length === 0) {
      setActiveModels(uniqueModels);
    }
  }, [uniqueBrands, uniqueModels]);

  function handleBrandChange(brand, checked) {
    if (checked) {
      setActiveBrands(prev => [...prev, brand]);
    } else {
      setActiveBrands(prev => prev.filter(b => b !== brand));
    }
    setCurrentPage(1);
  }

  function handleModelChange(model, checked) {
    if (checked) {
      setActiveModels(prev => [...prev, model]);
    } else {
      setActiveModels(prev => prev.filter(m => m !== model));
    }
    setCurrentPage(1);
  }

  function handlePriceChange(value) {
    setActivePrice(value);
    setCurrentPage(1);
  }

  function handleSearch() {
    setCurrentKeyword(searchValue.toLowerCase().trim());
    setCurrentPage(1);
  }

  function handleCategoryClick(category) {
    setActiveCategory(category);
    if (category === 'Tất Cả') {
      setActiveBrands(uniqueBrands);
    } else {
      setActiveBrands([category]);
    }
    setCurrentPage(1);
  }

  function matchesPrice(price) {
    if (!price) return false;
    if (activePrice === 'all') return true;
    if (activePrice === '20-40') return price >= 20000000 && price <= 40000000;
    if (activePrice === '40-60') return price > 40000000 && price <= 60000000;
    if (activePrice === '60-80') return price > 60000000 && price <= 80000000;
    if (activePrice === '80-110') return price > 80000000 && price <= 110000000;
    if (activePrice === 'above-110') return price > 110000000;
    return true;
  }

  const filteredVehicles = vehicles.filter(item => {
    const brand = item.dongXe?.loaiXe?.tenLoaiXe || '';
    const model = item.dongXe?.tenDongXe || '';
    const price = item.dongXe?.giaNiemYet || 0;
    const searchText = (model + ' ' + brand).toLowerCase();
    const matchBrand = activeBrands.length === 0 || activeBrands.includes(brand);
    const matchModel = activeModels.length === 0 || activeModels.includes(model);
    const matchPrice = matchesPrice(price);
    const matchKeyword = currentKeyword === '' || searchText.includes(currentKeyword);
    return matchBrand && matchModel && matchPrice && matchKeyword;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const paginatedVehicles = filteredVehicles.slice(
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

  if (loading) {
    return (
      <div className="home-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="loading-spinner" style={{ fontSize: '18px', color: '#666' }}>
          <i className="fa fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
          Đang tải dữ liệu xe...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="error-message" style={{ fontSize: '16px', color: '#ed1c24' }}>
          <i className="fa fa-exclamation-circle" style={{ marginRight: '10px' }}></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* BANNER */}
      <section className="banner">
        <div className="banner-content">
          <img
            src="https://hondatanthu.com.vn/admin/img/gallery/8841d7cc8fedcd0bd8bf913a3adb4fbb.png"
            alt="Promotion Banner"
          />
        </div>
      </section>

      

      {/* BANNER QUẢNG CÁO - FULL WIDTH */}
      <section className="promo-banners">
        <div className="promo-item">
          <img
            src="https://hondath.vn/wp-content/uploads/2024/04/3.webp"
            alt="Khuyến mãi 1"
          />
        </div>
        <div className="promo-item">
          <img
            src="https://hondath.vn/wp-content/uploads/2024/04/4.webp"
            alt="Khuyến mãi 2"
          />
        </div>
        <div className="promo-item">
          <img
            src="https://hondath.vn/wp-content/uploads/2024/04/5.webp"
            alt="Khuyến mãi 3"
          />
        </div>
      </section>

      {/* SẢN PHẨM NỔI BẬT */}
      <section className="product-container">
        <div className="section-title">
          <span>Sản Phẩm Nổi Bật</span>
        </div>
        <div className="product-grid">
          {vehicles.slice(0, 3).map(vehicle => (
            <Link to={`/product/detail/${vehicle._id}`} className="product-card" key={vehicle._id} style={{ textDecoration: 'none' }}>
              <img
                src={getVehicleImage(vehicle)}
                alt={vehicle.dongXe?.tenDongXe}
              />
              <h3>{vehicle.dongXe?.tenDongXe}</h3>
              <p className="price">Giá: {formatPrice(vehicle.dongXe?.giaNiemYet)}</p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                {vehicle.dongXe?.loaiXe?.tenLoaiXe} - {vehicle.mauSac}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* TÌM KIẾM & LỌC */}
      <section className="search-filter-section" id="search-section">
        <div className="search-filter-header">
          <h2>
            Tìm Kiếm Xe <i className="fa fa-search" style={{ color: '#ed1c24' }}></i>
          </h2>
          <div className="search-bar">
            <input
              type="text"
              id="searchInput"
              placeholder="Tìm theo tên xe hoặc hãng (VD: Civic, Honda...)"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
            <button type="button" id="searchBtn" onClick={handleSearch}>
              <i className="fa fa-search"></i> Tìm kiếm
            </button>
          </div>
        </div>

        <hr className="section-divider" />

            {/* DANH MỤC LOẠI XE */}
        <section className="category-menu">
          <ul>
            <li
              className={activeCategory === 'Tất Cả' ? 'active' : ''}
              onClick={() => handleCategoryClick('Tất Cả')}
            >
              Tất Cả
            </li>
            {uniqueBrands.map(brand => (
              <li
                key={brand}
                className={activeCategory === brand ? 'active' : ''}
                onClick={() => {
                  setActiveCategory(brand);
                  setActiveBrands([brand]);
                }}
              >
                {brand}
              </li>
            ))}
          </ul>
        </section>

        <div className="search-filter-body">
          {/* SIDEBAR LỌC */}
          <aside className="sidebar">
            {/* Filter by Brand */}
            <div className="filter-section">
              <h3>
                Loại xe <i className="fa fa-filter" style={{ color: '#ed1c24' }}></i>
              </h3>
              {uniqueBrands.map(brand => (
                <label key={brand}>
                  <input
                    type="checkbox"
                    checked={activeBrands.includes(brand)}
                    onChange={e => handleBrandChange(brand, e.target.checked)}
                  />{' '}
                  {brand}
                </label>
              ))}
            </div>

            {/* Filter by Model */}
            <div className="filter-section">
              <h3>
                Hãng xe <i className="fa fa-filter" style={{ color: '#ed1c24' }}></i>
              </h3>
              {uniqueModels.map(model => (
                <label key={model}>
                  <input
                    type="checkbox"
                    checked={activeModels.includes(model)}
                    onChange={e => handleModelChange(model, e.target.checked)}
                  />{' '}
                  {model}
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h3>
                Khoảng giá <i className="fa fa-filter" style={{ color: '#ed1c24' }}></i>
              </h3>
              <div className="price-filter-list">
                {[
                  { value: 'all', label: 'Tất cả khoảng giá' },
                  { value: '20-40', label: '20tr đến 40tr' },
                  { value: '40-60', label: '40tr đến 60tr' },
                  { value: '60-80', label: '60tr đến 80tr' },
                  { value: '80-110', label: '80tr đến 110tr' },
                  { value: 'above-110', label: 'Trên 110tr' },
                ].map(price => (
                  <label className="price-item" key={price.value}>
                    <input
                      type="radio"
                      name="price-range"
                      value={price.value}
                      checked={activePrice === price.value}
                      onChange={() => handlePriceChange(price.value)}
                    />
                    <span className="checkmark"></span> {price.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* KẾT QUẢ */}
          <section className="content">
            <h2 className="result-title">
              Kết quả tìm kiếm: {filteredVehicles.length} xe
            </h2>
            <div className="product-search-grid" id="productGrid">
              {filteredVehicles.length > 0 ? (
                paginatedVehicles.map(vehicle => (
                  <Link to={`/product/detail/${vehicle._id}`} className="product-item" key={vehicle._id} style={{ textDecoration: 'none' }}>
                    <img
                      src={getVehicleImage(vehicle)}
                      alt={vehicle.dongXe?.tenDongXe}
                    />
                    <h4>{vehicle.dongXe?.tenDongXe}</h4>
                    <p className="price">Giá: {formatPrice(vehicle.dongXe?.giaNiemYet)}</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
                      {vehicle.dongXe?.loaiXe?.tenLoaiXe} - {vehicle.mauSac || 'Chưa có màu'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                      {vehicle.trangThaiXe === 'ConHang' ? (
                        <span style={{ color: '#28a745' }}>● Còn hàng</span>
                      ) : (
                        <span style={{ color: '#dc3545' }}>● Hết hàng</span>
                      )}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="no-result">Không tìm thấy sản phẩm phù hợp.</div>
              )}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
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
            )}
          </section>
        </div>
      </section>

    </div>
  );
}

export default Home;
