import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NEWS_DATA } from './data';
import '../../css/style.scss';

const PAGE_SIZE = 6;

function formatDate(day, month, year) {
  return `${day}/${month}/${year}`;
}

function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = useMemo(() => {
    const list = ['Tất cả', ...new Set(NEWS_DATA.map(n => n.category))];
    return list;
  }, []);

  const filteredNews = useMemo(() => {
    if (activeCategory === 'Tất cả') return NEWS_DATA;
    return NEWS_DATA.filter(n => n.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));

  const currentNews = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNews.slice(start, start + PAGE_SIZE);
  }, [filteredNews, currentPage]);

  function handleCategoryClick(cat) {
    setActiveCategory(cat);
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="news-page">
      <section className="news-banner">
        <div className="news-banner-content">
          <h1>Tin Tức</h1>
          <p>Cập nhật những thông tin mới nhất về sản phẩm, khuyến mãi và dịch vụ của Long Moto</p>
        </div>
      </section>

      <div className="news-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <span>Tin tức</span>
      </div>

      <section className="news-category-menu">
        <ul>
          {categories.map(cat => (
            <li
              key={cat}
              className={activeCategory === cat ? 'active' : ''}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </section>

      <section className="news-list">
        <div className="news-list-inner">
          {currentNews.length > 0 ? (
            currentNews.map(item => (
              <article className="news-item" key={item.id}>
                <Link to={`/news/${item.id}`} className="news-image">
                  <div className="news-date-badge">
                    <span className="day">{item.day}</span>
                    <span className="month">{item.month}/{item.year.slice(2)}</span>
                  </div>
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://hondatanthu.com.vn/admin/img/gallery/8841d7cc8fedcd0bd8bf913a3adb4fbb.png';
                    }}
                  />
                </Link>
                <div className="news-content">
                  <span className="news-category-tag">{item.category}</span>
                  <Link to={`/news/${item.id}`} className="news-title-link">
                    <h2 className="news-title">{item.title}</h2>
                  </Link>
                  <div className="news-meta">
                    <i className="fa fa-calendar"></i>
                    <span>Ngày đăng: {formatDate(item.day, item.month, item.year)}</span>
                  </div>
                  <p className="news-excerpt">{item.excerpt}</p>
                  <Link to={`/news/${item.id}`} className="news-readmore">
                    Đọc tiếp <i className="fa fa-arrow-right"></i>
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="news-empty">Không có bài viết nào trong danh mục này.</div>
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <div className="news-pagination">
          <button
            type="button"
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fa fa-chevron-left"></i> Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              type="button"
              key={page}
              className={`page-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      )}

      <div className="news-copyright">
        Copyrights © Thiết Kế Website bởi <strong>Long Moto</strong>
      </div>
    </div>
  );
}

export default News;
