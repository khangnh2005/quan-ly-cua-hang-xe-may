import '../../../css/style.scss';

function About() {
  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Long Moto – Đồng hành cùng bạn trên mọi nẻo đường</h1>
          <p className="about-hero-sub">
            Được thành lập ngày 03/06/1997, thuộc Công ty TNHH Thương mại Long Moto, tự hào là đại lý ủy quyền chính thức của Honda Việt Nam. Với hơn 25 năm kinh doanh trong ngành xe máy, Công ty TNHH Thương mại Long Moto đã không ngừng phát triển, đổi mới trên mọi mặt đặc biệt là chất lượng phục vụ từ đó nhận lại được những thành quả đáng trân trọng như sự tín nhiệm và tin tưởng từ khách hàng.
          </p>
        </div>
      </section>

      {/* Sứ mệnh */}
      <section className="about-section about-mission">
        <div className="about-container">
          <div className="about-section-header">
            <i className="fa-solid fa-bullseye"></i>
            <h2>Sứ Mệnh</h2>
          </div>
          <p>
            Tại Long Moto, chúng tôi cam kết mang đến cho khách hàng những sản phẩm và dịch vụ chất lượng nhất trong suốt hành trình của mình, từ việc lựa chọn chiếc xe ưng ý, đến các dịch vụ bảo dưỡng, sửa chữa chuyên nghiệp và hậu mãi tận tâm. Sự hài lòng của khách hàng chính là động lực để chúng tôi không ngừng hoàn thiện và phát triển.
          </p>
        </div>
      </section>

      {/* Tầm nhìn */}
      <section className="about-section about-vision">
        <div className="about-container">
          <div className="about-section-header">
            <i className="fa-solid fa-eye"></i>
            <h2>Tầm Nhìn</h2>
          </div>
          <p>
            Chúng tôi hướng tới tầm nhìn trở thành doanh nghiệp hàng đầu trong lĩnh vực kinh doanh xe máy và dịch vụ do Honda ủy nhiệm, không chỉ về quy mô mà còn về chất lượng và uy tín.
          </p>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="about-section about-values">
        <div className="about-container">
          <div className="about-section-header">
            <i className="fa-solid fa-gem"></i>
            <h2>Giá Trị Cốt Lõi</h2>
          </div>
          <p className="about-values-intro">
            Long Moto luôn đặt khách hàng làm trọng tâm và xây dựng văn hóa doanh nghiệp dựa trên 10 giá trị cốt lõi:
          </p>
          <div className="about-values-grid">
            <div className="about-value-item">
              <span className="value-icon">🎯</span>
              <h4>Phục Vụ</h4>
              <p>Luôn phục vụ khách hàng trên mức mong đợi.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">🤝</span>
              <h4>Uy Tín</h4>
              <p>Luôn giữ uy tín như giữ mạng.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">⚡</span>
              <h4>Chủ Động</h4>
              <p>Luôn chủ động trong mọi việc.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">💪</span>
              <h4>Trách Nhiệm</h4>
              <p>Luôn chịu trách nhiệm 100%.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">💡</span>
              <h4>Giải Pháp</h4>
              <p>Luôn tìm giải pháp để đạt mục tiêu.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">📋</span>
              <h4>Kế Hoạch</h4>
              <p>Làm việc có kế hoạch.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">🔥</span>
              <h4>Tích Cực</h4>
              <p>Luôn suy nghĩ và hành động tích cực.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">🤝</span>
              <h4>Đồng Đội</h4>
              <p>Sẵn sàng giúp đỡ đồng đội.</p>
            </div>
            <div className="about-value-item">
              <span className="value-icon">❤️</span>
              <h4>Tình Yêu</h4>
              <p>Yêu công việc của mình.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sản phẩm & Dịch vụ */}
      <section className="about-section about-products">
        <div className="about-container">
          <div className="about-section-header">
            <i className="fa-solid fa-motorcycle"></i>
            <h2>Sản Phẩm Và Dịch Vụ</h2>
          </div>
          <p>
            Long Moto cung cấp đa dạng các dòng xe máy Honda chính hãng, từ xe số đến xe ga, phù hợp với mọi nhu cầu và phong cách của khách hàng. Bên cạnh đó, chúng tôi còn mang đến các dịch vụ bảo hành, bảo dưỡng định kỳ, sửa chữa chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh nghiệm và phụ tùng chính hãng.
          </p>

          <div className="about-product-categories">
            <div className="about-product-card">
              <i className="fa-solid fa-road"></i>
              <h4>Xe Số</h4>
              <p>Wave Alpha, Blade, Future… – những mẫu xe số bền bỉ, tiết kiệm nhiên liệu, phù hợp cho việc di chuyển hàng ngày.</p>
            </div>
            <div className="about-product-card">
              <i className="fa-solid fa-wind"></i>
              <h4>Xe Ga</h4>
              <p>Vision, Air Blade, Lead, SH Mode, SH… – những mẫu xe tay ga thời trang, tiện dụng, mang đến trải nghiệm lái thoải mái.</p>
            </div>
            <div className="about-product-card">
              <i className="fa-solid fa-bolt"></i>
              <h4>Xe Côn Tay</h4>
              <p>Winner X, CBR150R – mẫu xe côn tay thể thao, mạnh mẽ, dành cho những ai yêu thích tốc độ và phong cách cá tính.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dịch vụ */}
      <section className="about-section about-services">
        <div className="about-container">
          <div className="about-section-header">
            <i className="fa-solid fa-wrench"></i>
            <h2>Dịch Vụ Chuyên Nghiệp, Tận Tâm</h2>
          </div>
          <div className="about-services-grid">
            <div className="about-service-item">
              <i className="fa-solid fa-shield-halved"></i>
              <h4>Bảo hành, bảo dưỡng</h4>
              <p>Đội ngũ kỹ thuật viên giàu kinh nghiệm, được đào tạo bài bản bởi Honda Việt Nam, thực hiện các dịch vụ bảo hành, bảo dưỡng định kỳ theo tiêu chuẩn của hãng.</p>
            </div>
            <div className="about-service-item">
              <i className="fa-solid fa-screwdriver-wrench"></i>
              <h4>Sửa chữa</h4>
              <p>Trang thiết bị hiện đại, phụ tùng chính hãng, đảm bảo khắc phục mọi sự cố một cách nhanh chóng và hiệu quả.</p>
            </div>
            <div className="about-service-item">
              <i className="fa-solid fa-comments"></i>
              <h4>Tư vấn</h4>
              <p>Đội ngũ tư vấn viên nhiệt tình, am hiểu sản phẩm, sẵn sàng giải đáp mọi thắc mắc và giúp khách hàng lựa chọn được chiếc xe phù hợp nhất.</p>
            </div>
            <div className="about-service-item">
              <i className="fa-solid fa-credit-card"></i>
              <h4>Mua xe trả góp</h4>
              <p>Hợp tác với các đối tác tài chính uy tín, cung cấp các gói vay linh hoạt, thủ tục đơn giản, giúp khách hàng dễ dàng sở hữu chiếc xe mơ ước.</p>
            </div>
            <div className="about-service-item">
              <i className="fa-solid fa-truck"></i>
              <h4>Giao xe tận nhà</h4>
              <p>Mang đến sự tiện lợi tối đa cho khách hàng.</p>
            </div>
            <div className="about-service-item">
              <i className="fa-solid fa-cogs"></i>
              <h4>Phụ tùng chính hãng</h4>
              <p>Long Moto cam kết chỉ sử dụng phụ tùng chính hãng Honda trong quá trình bảo dưỡng và sửa chữa, đảm bảo chất lượng và độ bền cho chiếc xe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="about-section about-contact">
        <div className="about-container">
          <h2>Long Moto – Đồng hành cùng bạn trên mọi nẻo đường</h2>
          <div className="about-contact-info">
            <div className="about-contact-item">
              <i className="fa-solid fa-phone"></i>
              <span>Hotline: 093.636.3636</span>
            </div>
            <div className="about-contact-item">
              <i className="fa-solid fa-envelope"></i>
              <span>Email: info@longmoto.vn</span>
            </div>
            <div className="about-contact-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>Địa chỉ: số 142/8B Đường Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;