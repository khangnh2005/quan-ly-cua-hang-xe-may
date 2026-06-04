// Dữ liệu tin tức dùng chung cho trang danh sách và trang chi tiết
const defaultContent = [
  'Với hơn 25 năm kinh nghiệm trong lĩnh vực kinh doanh và dịch vụ xe máy Honda, Long Moto luôn nỗ lực mang đến cho khách hàng những sản phẩm và dịch vụ chất lượng nhất.',
  'Long Moto cam kết cung cấp các sản phẩm xe máy Honda chính hãng 100%, phụ tùng và dịch vụ bảo dưỡng sửa chữa theo đúng tiêu chuẩn của Honda Việt Nam.',
  'Để biết thêm thông tin chi tiết và được tư vấn, quý khách vui lòng liên hệ hotline 093.636.3636 hoặc đến trực tiếp showroom của Long Moto tại số 142/8B Đường Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh.',
];

const item = (id, day, month, year, title, excerpt, image, category, intro) => ({
  id, day, month, year, title, excerpt, image, category,
  content: [intro, ...defaultContent],
});

export const NEWS_DATA = [
  item(1, '15', '03', '2026',
    'HONDA ICON e – XE ĐIỆN CÔNG NGHỆ MỚI, KHÔNG CẦN BẰNG LÁI!',
    'Honda Việt Nam chính thức giới thiệu mẫu xe điện Honda ICON e với thiết kế nhỏ gọn, hiện đại, phù hợp cho việc di chuyển trong đô thị. Đặc biệt, người dùng không cần bằng lái khi vận hành.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/5fd6b42c10ff5a8dd2f0c436639c9a01.jpg&;w=300&zc=1',
    'Sản phẩm mới',
    'Honda Việt Nam vừa chính thức trình làng mẫu xe điện hoàn toàn mới Honda ICON e, đánh dấu bước tiến quan trọng trong chiến lược điện hóa xe máy tại thị trường Việt Nam.'
  ),
  item(2, '10', '03', '2026',
    'Thêm Lượt Chăm Xe - Thêm Vững Tay Lái',
    'Chương trình ưu đãi đặc biệt dành cho khách hàng khi đưa xe đến bảo dưỡng tại hệ thống đại lý ủy quyền của Honda. Tích lũy lượt chăm xe để nhận ngay những phần quà hấp dẫn.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/352937386c69b1df181b89cc22fb9c7b.jpg&;w=300&zc=1',
    'Khuyến mãi',
    'Long Moto triển khai chương trình khuyến mãi đặc biệt "Thêm Lượt Chăm Xe - Thêm Vững Tay Lái" dành cho tất cả khách hàng sử dụng xe máy Honda.'
  ),
  item(3, '05', '03', '2026',
    'DẦU NHỚT CHÍNH HÃNG HONDA - BẢO VỆ TỐI ƯU CHO ĐỘNG CƠ',
    'Sử dụng dầu nhớt chính hãng Honda giúp động cơ hoạt động bền bỉ, êm ái và tiết kiệm nhiên liệu. Tìm hiểu các dòng sản phẩm dầu nhớt phù hợp với từng dòng xe Honda.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/f3182e70a01e31d53eef60bb5497c348.jpg&;w=300&zc=1',
    'Phụ tùng',
    'Dầu nhớt đóng vai trò cực kỳ quan trọng trong việc bảo vệ và duy trì hiệu suất hoạt động của động cơ xe máy.'
  ),
  item(4, '28', '02', '2026',
    'CHƯƠNG TRÌNH BẢO DƯỠNG ĐỊNH KỲ - AN TÂM TRÊN MỌI HÀNH TRÌNH',
    'Bảo dưỡng định kỳ là yếu tố quan trọng giúp xe vận hành ổn định và kéo dài tuổi thọ động cơ. Long Moto cung cấp dịch vụ bảo dưỡng chuyên nghiệp theo tiêu chuẩn Honda.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/c4d0677ce62e8c0f9c06749b18d61fba.jpg&;w=300&zc=1',
    'Dịch vụ',
    'Bảo dưỡng định kỳ là yếu tố then chốt giúp chiếc xe máy của bạn luôn vận hành ổn định, an toàn và bền bỉ theo thời gian.'
  ),
  item(5, '20', '02', '2026',
    'PHỤ TÙNG CHÍNH HÃNG - CHẤT LƯỢNG ĐẢM BẢO',
    'Long Moto cam kết chỉ sử dụng phụ tùng chính hãng Honda trong quá trình sửa chữa và bảo dưỡng, đảm bảo chất lượng và độ bền cho chiếc xe của bạn.',
    'https://hondatanthu.com.vn/admin/img/gallery/phu-tung.jpg',
    'Phụ tùng',
    'Sử dụng phụ tùng chính hãng là yếu tố quyết định đến chất lượng, độ bền và sự an toàn của chiếc xe máy.'
  ),
  item(6, '14', '02', '2026',
    'KHUYẾN MÃI ĐẦU NĂM - MUA XE NHẬN QUÀ KHỦNG',
    'Chương trình khuyến mãi đầu năm 2026 với nhiều phần quà hấp dẫn dành cho khách hàng mua xe máy Honda tại Long Moto. Cơ hội sở hữu chiếc xe mơ ước với giá ưu đãi nhất.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/c4d0677ce62e8c0f9c06749b18d61fba.jpg&;w=300&zc=1',
    'Khuyến mãi',
    'Nhân dịp đầu năm mới 2026, Long Moto triển khai chương trình khuyến mãi lớn nhất trong năm với hàng ngàn phần quà giá trị dành cho khách hàng mua xe máy Honda.'
  ),
  item(7, '05', '02', '2026',
    'HƯỚNG DẪN BẢO QUẢN XE MÁY ĐÚNG CÁCH TRONG MÙA MƯA',
    'Mùa mưa là thời điểm xe máy dễ gặp các sự cố về điện, phanh và động cơ. Cùng tham khảo những tips bảo quản xe máy đúng cách trong mùa mưa để xe luôn vận hành tốt.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/32c9bb9d8a99472019ee4109367386a2.jpg&;w=300&zc=1',
    'Tư vấn',
    'Mùa mưa là thời điểm xe máy thường xuyên gặp phải các sự cố như chập điện, phanh ướt, động cơ khó nổ.'
  ),
  item(8, '25', '01', '2026',
    'MUA XE TRẢ GÓP - THỦ TỤC ĐƠN GIẢN, DUYỆT NHANH',
    'Long Moto hợp tác với nhiều ngân hàng uy tín, cung cấp các gói vay mua xe trả góp với lãi suất ưu đãi, thủ tục đơn giản, giúp khách hàng dễ dàng sở hữu chiếc xe mơ ước.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/7e75c9dbcac4b113954265349adc4b87.jpg&;w=300&zc=1',
    'Dịch vụ',
    'Long Moto hợp tác với nhiều ngân hàng và công ty tài chính uy tín, cung cấp các gói vay mua xe trả góp với lãi suất ưu đãi, thủ tục đơn giản.'
  ),
  item(9, '15', '01', '2026',
    'GIỚI THIỆU CÁC DÒNG XE HONDA MỚI NHẤT 2026',
    'Cập nhật những mẫu xe Honda mới nhất 2026 với nhiều cải tiến vượt trội về thiết kế, động cơ và công nghệ. Từ xe số, xe ga đến xe côn tay thể thao, Honda đáp ứng mọi nhu cầu.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/101f97d89c1087bccbd7161b2844204b.jpg&;w=300&zc=1',
    'Sản phẩm mới',
    'Honda Việt Nam tiếp tục cho ra mắt hàng loạt mẫu xe mới trong năm 2026 với nhiều cải tiến vượt trội về thiết kế, động cơ và công nghệ.'
  ),
  item(10, '05', '01', '2026',
    'LỊCH BẢO DƯỠNG XE MÁY HONDA ĐỊNH KỲ CHUẨN NHÀ SẢN XUẤT',
    'Nắm rõ lịch bảo dưỡng định kỳ giúp xe máy Honda của bạn luôn vận hành trong tình trạng tốt nhất. Tham khảo lịch bảo dưỡng chuẩn từ Honda Việt Nam ngay hôm nay.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/e0abad351fca0ab141eb8dd29f906f1b.jpg&;w=300&zc=1',
    'Tư vấn',
    'Nắm rõ lịch bảo dưỡng định kỳ giúp xe máy Honda của bạn luôn vận hành trong tình trạng tốt nhất, kéo dài tuổi thọ động cơ.'
  ),
  item(11, '28', '12', '2025',
    'TỔNG KẾT CHƯƠNG TRÌNH KHUYẾN MÃI CUỐI NĂM 2025',
    'Long Moto gửi lời cảm ơn chân thành đến quý khách hàng đã đồng hành cùng chúng tôi trong chương trình khuyến mãi cuối năm 2025.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/894df05c3cca1908e8c1fd59053e3d06.jpg&;w=300&zc=1',
    'Khuyến mãi',
    'Long Moto gửi lời cảm ơn chân thành đến quý khách hàng đã đồng hành cùng chúng tôi trong chương trình khuyến mãi cuối năm 2025.'
  ),
  item(12, '20', '12', '2025',
    'CHƯƠNG TRÌNH "LÁI XE AN TOÀN" CÙNG HONDA VIỆT NAM',
    'Honda Việt Nam phối hợp cùng Long Moto tổ chức chương trình đào tạo lái xe an toàn miễn phí dành cho khách hàng. Trang bị những kỹ năng cần thiết để bảo vệ bản thân trên mọi hành trình.',
    'https://hondatanthu.com.vn/admin/timthumb.php?src=img/upload/1535746bf50caf7cbd28cdfd047d6ef4.jpg&;w=300&zc=1',
    'Sự kiện',
    'Honda Việt Nam phối hợp cùng Long Moto tổ chức chương trình đào tạo lái xe an toàn miễn phí dành cho khách hàng.'
  ),
];
