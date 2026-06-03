import { useParams, Link } from 'react-router-dom';
import { NEWS_DATA } from './data';
import '../../css/style.scss';

function formatDate(day, month, year) {
  return `${day}/${month}/${year}`;
}

function NewsDetail() {
  const { id } = useParams();
  const newsItem = NEWS_DATA.find(n => String(n.id) === String(id));

  if (!newsItem) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-empty">
          <i className="fa fa-exclamation-circle"></i>
          <h2>Không tìm thấy bài viết</h2>
          <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/news" className="news-back-btn">
            <i className="fa fa-arrow-left"></i> Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  // Bài viết liên quan (cùng category, trừ chính nó)
  const relatedNews = NEWS_DATA
    .filter(n => n.category === newsItem.category && n.id !== newsItem.id)
    .slice(0, 3);

  return (
    <div className="news-detail-page">
      <section className="news-detail-header">
        <div className="news-detail-header-content">
          <span className="news-detail-category">{newsItem.category}</span>
          <h1 className="news-detail-title">{newsItem.title}</h1>
          <div className="news-detail-meta">
            <span>
              <i className="fa fa-calendar"></i>{' '}
              {formatDate(newsItem.day, newsItem.month, newsItem.year)}
            </span>
            <span>
              <i className="fa fa-user"></i> Long Moto
            </span>
          </div>
        </div>
      </section>

      <div className="news-detail-container">
        <div className="news-detail-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/news">Tin tức</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{newsItem.title}</span>
        </div>

        <article className="news-detail-article">
          <div className="news-detail-image">
            <img
              src={newsItem.image}
              alt={newsItem.title}
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://hondatanthu.com.vn/admin/img/gallery/8841d7cc8fedcd0bd8bf913a3adb4fbb.png';
              }}
            />
          </div>

          <div className="news-detail-excerpt">
            <i className="fa fa-quote-left"></i>
            <p>{newsItem.excerpt}</p>
          </div>

          <div className="news-detail-content">
            {newsItem.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="news-detail-share">
            <span>Chia sẻ:</span>
            <a href="#" className="share-btn facebook" title="Chia sẻ lên Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="share-btn twitter" title="Chia sẻ lên Twitter">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" className="share-btn linkedin" title="Chia sẻ lên LinkedIn">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="#" className="share-btn link" title="Sao chép liên kết">
              <i className="fa fa-link"></i>
            </a>
          </div>

          <div className="news-detail-actions">
            <Link to="/news" className="news-back-btn">
              <i className="fa fa-arrow-left"></i> Quay lại trang tin tức
            </Link>
          </div>
        </article>

        {relatedNews.length > 0 && (
          <section className="news-related">
            <h2 className="news-related-title">
              <span>Bài viết liên quan</span>
            </h2>
            <div className="news-related-grid">
              {relatedNews.map(item => (
                <Link to={`/news/${item.id}`} className="news-related-item" key={item.id}>
                  <div className="news-related-image">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://hondatanthu.com.vn/admin/img/gallery/8841d7cc8fedcd0bd8bf913a3adb4fbb.png';
                      }}
                    />
                  </div>
                  <div className="news-related-content">
                    <span className="news-related-category">{item.category}</span>
                    <h3>{item.title}</h3>
                    <span className="news-related-date">
                      <i className="fa fa-calendar"></i>{' '}
                      {formatDate(item.day, item.month, item.year)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default NewsDetail;
