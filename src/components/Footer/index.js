function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">LONG<span>MOTO</span></div>
          <p className="footer-desc">Đại lý xe máy uy tín hàng đầu TP.HCM với hơn 12 năm kinh nghiệm. Cam kết xe chính hãng, giá tốt nhất, dịch vụ tận tâm.</p>
        </div>
        <div className="footer-col">
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="#">Xe Tay Ga</a></li>
            <li><a href="#">Xe Số</a></li>
            <li><a href="#">Xe Côn Tay</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Dịch vụ</h4>
          <ul>
            <li><a href="#">Bảo dưỡng</a></li>
            <li><a href="#">Trả góp</a></li>
            <li><a href="#">Phụ tùng</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Liên hệ</h4>
          <ul>
            <li><a href="#">📍 Quận 10, TP.HCM</a></li>
            <li><a href="#">📞 1800 800 800</a></li>
            <li><a href="#">✉️ info@longmoto.vn</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 LongMoto. Bảo lưu mọi quyền.</span>
        <span>Chính sách bảo mật · Điều khoản sử dụng</span>
      </div>
    </footer>
  );
}

export default Footer;
