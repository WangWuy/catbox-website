# 📐 ĐẶC TẢ THIẾT KẾ CHI TIẾT 1:1: TETTA & CFC
## (CHUẨN HÓA THEO `assets/thaiduong_design/` & BẢNG MÀU FANPAGE)

> Tài liệu chuẩn hóa toàn bộ cấu trúc giao diện, khối layout, thành phần UI/UX và bảng màu thương hiệu cho 2 website **TETTA** và **CFC**, bám sát chính xác 1:1 theo 6 hình ảnh mẫu gốc từ thư mục [`assets/thaiduong_design/`](file:///Users/Company/Catbox/assets/thaiduong_design/).

---

## 🎯 1. NGUYÊN TẮC CỐT LÕI (CORE ARCHITECTURE)

```text
[ 100% Cấu trúc Layout & Luồng tính năng từ assets/thaiduong_design/ ]
+
[ 100% Phong cách hình ảnh & Hệ màu sắc đặc trưng từ Fanpage từng thương hiệu ]
+
[ Đồng bộ Hệ sinh thái: Topbar Switcher 3 Brand + Dòng bảo chứng Catbox Group ]
=
🏆 BỘ ĐÔI WEBSITE HOÀN HẢO THEO ĐÚNG YÊU CẦU KHÁCH HÀNG!
```

---

## 🔍 2. BẢNG ĐỐI CHIẾU CHI TIẾT 1:1 THEO 6 ẢNH `thaiduong_design`

| Ảnh mẫu | Tên khối (Section) | Thành phần UI/UX chi tiết từ ảnh gốc | 🎁 Áp dụng cho TETTA | 🥖 Áp dụng cho CFC |
| :---: | :--- | :--- | :--- | :--- |
| <img src="../assets/thaiduong_design/01_header_hero_categories.png" width="140" /><br>[**01_header_hero_categories.png**](file:///Users/Company/catbox/assets/thaiduong_design/01_header_hero_categories.png) | **Topbar** | • Cờ đa ngôn ngữ (🇨🇳 🇬🇧 🇰🇷 🇹🇭 🇻🇳)<br>• Link: *Về Chúng Tôi*, *Khuyến Mãi*<br>• Hotline: `+84 xxx xxx xxx`<br>• Khối 3 avatar tròn + Nút *"Liên hệ"* | Giữ nguyên cấu trúc, link về BST Quà Tết, hotline VIP | Giữ nguyên cấu trúc, link về Bảng Giá Sỉ, hotline Xưởng |
| <img src="../assets/thaiduong_design/01_header_hero_categories.png" width="140" /><br>[**01_header_hero_categories.png**](file:///Users/Company/catbox/assets/thaiduong_design/01_header_hero_categories.png) | **Header Chính** | • Logo nằm góc trái<br>• Thanh Search to bo tròn ở giữa: *"Tìm kiếm sản phẩm..."*<br>• Nút pill màu xám bo tròn bên phải: *"👤 Đăng Nhập / Đăng Ký"* | Logo **TETTA Luxury Packaging**, Placeholder: *"Tìm kiếm mẫu hộp quà Tết, ép kim..."* | Logo **CFC Factory**, Placeholder: *"Tìm kiếm bao bánh mì que, túi Doner..."* |
| <img src="../assets/thaiduong_design/01_header_hero_categories.png" width="140" /><br>[**01_header_hero_categories.png**](file:///Users/Company/catbox/assets/thaiduong_design/01_header_hero_categories.png) | **Category Navigation** | • Menu ngang có icon nét mảnh cạnh từng mục<br>• Nút pill bo tròn xám bên phải: *"Miễn phí Ship cho đơn từ 100K"* | Menu: 🧧 *Trang Chủ*, 🎁 *Hộp Quà Tết*, 🍷 *Hộp Rượu Vang*, 🕊️ *Hộp Yến Sào*, 📜 *Quy Cách*. Pill: *"Miễn phí thiết kế đơn VIP"* | Menu: 🥖 *Trang Chủ*, 🥖 *Túi Bánh Mì Que*, 🥪 *Túi Doner*, 🛍️ *Túi Có Quai*, 🍔 *Giấy Gói*. Pill: *"Miễn phí Ship từ 2.000 túi"* |
| <img src="../assets/thaiduong_design/01_header_hero_categories.png" width="140" /><br>[**01_header_hero_categories.png**](file:///Users/Company/catbox/assets/thaiduong_design/01_header_hero_categories.png) | **Hero Banner (Clean White)** | • Nền trắng tinh khôi, tối giản<br>• Trái: Icon tròn xám + Subtitle *"THIẾT KẾ IN ẤN / MẪU MÃ ĐA DẠNG"* + Headline to *"NÂNG TẦM THƯƠNG HIỆU cùng [Brand]"* + Nút màu *"Liên Hệ"* + Hashtag *"#nhận nhiều ưu đãi"* (chữ *ưu đãi* màu đỏ)<br>• Phải: Mockup 3D sản phẩm lớn, đổ bóng chân thực | Headline: *"NÂNG TẦM THƯƠNG HIỆU cùng TETTA"* (Chữ TETTA màu Đỏ Bordeaux `#8B1E2D`), Nút *"Liên Hệ"* màu Đỏ Bordeaux, Mockup 3D Hộp quà Tết ép kim đỏ - vàng | Headline: *"NÂNG TẦM THƯƠNG HIỆU cùng CFC"* (Chữ CFC màu Cam Bánh Mì `#E67E22`), Nút *"Liên Hệ"* màu Cam Bánh Mì, Mockup 3D Túi giấy Kraft & MG |
| <img src="../assets/thaiduong_design/01_header_hero_categories.png" width="140" /><br>[**01_header_hero_categories.png**](file:///Users/Company/catbox/assets/thaiduong_design/01_header_hero_categories.png) | **DANH MỤC (Category Cards)** | • Tiêu đề *"DANH MỤC"* căn trái, font chữ in hoa đậm nét<br>• Lưới 4 ô vuông bo góc mềm<br>• Nút pill bo tròn màu trắng chữ đen nằm chính giữa từng thẻ | 4 Thẻ danh mục: **HỘP QUÀ TẾT**, **HỘP YẾN SÀO**, **HỘP RƯỢU VANG**, **QUÀ DOANH NGHIỆP** | 4 Thẻ danh mục: **TÚI BÁNH MÌ QUE**, **TÚI DONER KEBAB**, **GIẤY GÓI CHỐNG DẦU**, **HỘP THỰC PHẨM** |
| <img src="../assets/thaiduong_design/02_bestseller_products.png" width="140" /><br>[**02_bestseller_products.png**](file:///Users/Company/catbox/assets/thaiduong_design/02_bestseller_products.png) | **BÁN CHẠY (Bestseller Grid)** | • Tiêu đề *"BÁN CHẠY"* bên trái + Tabs lọc bên phải (`Tất Cả`, `Danh mục 1`, `Danh mục 2`)<br>• Lưới **5 sản phẩm / hàng** (5 Columns Grid)<br>• Badge oval bo tròn góc dưới ảnh (`270ML`, `360ML`...)<br>• Tên sản phẩm in đậm, danh mục xám, giá tiền nổi bật<br>• **2 ô Swatches vuông bo góc tròn** chọn mẫu/chất liệu bên dưới | 5 Cột: Hộp âm dương, nắp trượt, cánh bướm, nam châm. Badge: `Size VIP`, `Ép Kim Gold`. Swatches chọn màu: Đỏ Bordeaux, Vàng Gold, Kem | 5 Cột: Túi que, Doner Kebab, túi quai, giấy gói. Badge: `180đ/túi`, `Kraft Nhật`, `MG Trắng`. Swatches chọn chất liệu: Kraft Nâu, MG Trắng |
| <img src="../assets/thaiduong_design/03_quote_banner_weekly_picks.png" width="140" /><br>[**03_quote_banner_weekly_picks.png**](file:///Users/Company/catbox/assets/thaiduong_design/03_quote_banner_weekly_picks.png) | **Promo Banner 2 Cột** | • Nửa trái: Ảnh chụp sản phẩm nghệ thuật trên nền màu pastel<br>• Nửa phải: Khối màu thương hiệu đậm + Tiêu đề trắng *"Báo Giá In Theo Yêu Cầu"* + 2 nút pill: *"👁 Xem tất cả"* & *"📞 Hotline"* | Nửa phải nền Đỏ Bordeaux đậm `#5E101D` + Tiêu đề *"Báo Giá In Hộp Quà Theo Yêu Cầu"* + Nút *"Báo Giá"* & *"0988.xxx.xxx"* | Nửa phải nền Nâu Kraft Chocolate `#3E2723` + Tiêu đề *"Báo Giá In Túi Giấy Theo Yêu Cầu"* + Nút *"Xem tất cả"* & *"0909.xxx.xxx"* |
| <img src="../assets/thaiduong_design/03_quote_banner_weekly_picks.png" width="140" /><br>[**03_quote_banner_weekly_picks.png**](file:///Users/Company/catbox/assets/thaiduong_design/03_quote_banner_weekly_picks.png) | **LỰA CHỌN CỦA TUẦN** | • Tiêu đề *"LỰA CHỌN CỦA TUẦN"*, phụ đề *"Những sản phẩm bán chạy nhất tuần qua"*<br>• Trái: 3 Card sản phẩm có badge oval & swatches<br>• Phải: 1 Ảnh vuông lớn chụp set sản phẩm decor kèm các điểm **Hotspot tròn** | 3 Hộp quà nổi bật + 1 Ảnh lớn set quà Tết decor hoa đào & rượu vang kèm hotspot chi tiết | 3 Túi bánh mì nổi bật + 1 Ảnh lớn bộ bao bì F&B hoàn chỉnh (túi, hộp, giấy gói) kèm hotspot |
| <img src="../assets/thaiduong_design/04_why_choose_us_video.png" width="140" /><br>[**04_why_choose_us_video.png**](file:///Users/Company/catbox/assets/thaiduong_design/04_why_choose_us_video.png) | **VÌ SAO NÊN CHỌN CHÚNG TÔI ?** | • Tiêu đề *"VÌ SAO NÊN CHỌN CHÚNG TÔI ?"* in hoa to rõ<br>• Trái: Ảnh minh họa dọc chất lượng cao (nhân vật 3D / kỹ thuật viên xưởng in)<br>• Phải: Đoạn văn giới thiệu + 3 bullet points cam kết (*Chất lượng, Thiết kế, Dịch vụ*) + **Khối nửa vòm (Dome) chứa Video Player xưởng** | Cột trái: Ảnh nghệ nhân 3D chế tác hộp thủ công. Vòm màu Đỏ Bordeaux chứa Video ép kim nhũ nhiệt | Cột trái: Ảnh kỹ thuật viên 3D vận hành máy in túi bánh mì. Vòm màu Cam Nâu chứa Video máy in cuộn |
| <img src="../assets/thaiduong_design/05_news_blog_section.png" width="140" /><br>[**05_news_blog_section.png**](file:///Users/Company/catbox/assets/thaiduong_design/05_news_blog_section.png) | **TIN TỨC (News Blog)** | • Tiêu đề *"TIN TỨC"* bên trái + Nút pill *"Xem thêm tin →"* bên phải<br>• Lưới **4 bài viết Blog card trắng**, có ảnh thumbnail, tiêu đề bài viết và mô tả ngắn | 4 Bài viết cẩm nang: *Chọn hộp quà Tết VIP, So sánh ép kim 3D & dập nổi, Tiêu chuẩn giấy mỹ thuật...* | 4 Bài viết kinh doanh F&B: *So sánh giấy Kraft & MG cho bánh mì, Kích thước chuẩn túi Doner, Bảng giá sỉ...* |
| <img src="../assets/thaiduong_design/06_factory_video_footer.png" width="140" /><br>[**06_factory_video_footer.png**](file:///Users/Company/catbox/assets/thaiduong_design/06_factory_video_footer.png) | **Video Xưởng Ngang (Reels)** | • Khung phát video full-width chạy dài ngang trang, hiển thị máy móc dán bao bì tự động hoạt động thực tế | Video dây chuyền sản xuất hộp cứng tự động và ép kim cao tốc | Video dây chuyền in cuộn Flexo và gấp dán túi giấy bánh mì tự động |
| <img src="../assets/thaiduong_design/06_factory_video_footer.png" width="140" /><br>[**06_factory_video_footer.png**](file:///Users/Company/catbox/assets/thaiduong_design/06_factory_video_footer.png) | **FOOTER CHÂN TRANG** | • Nền màu đậm phủ kín toàn bộ chân trang<br>• Cột 1: Logo + Huy hiệu chứng nhận chất lượng (HACCP/ISO) + Tên pháp nhân công ty + 3 Link chính sách + 4 Icon MXH vuông bo góc<br>• Cột 2: 4 Khối thông tin liên hệ (Email, Số điện thoại, Nhà máy, Văn phòng)<br>• Cột 3: *"Đăng ký nhận ưu đãi"* (Ô input email + Nút Submit đỏ *"Gửi"* )<br>• Copyright Bar: *"Thiết kế bởi THDigi"* \| *"Made with Love"* + Nút Scroll to Top | Nền Đỏ Rượu Vang Bordeaux `#5E101D`, Huy hiệu Chứng nhận Châu Âu FSC & ISO 9001, Form nhận Catalogue Tết | Nền Nâu Kraft Chocolate `#3E2723`, Huy hiệu An Toàn Vệ Sinh Thực Phẩm ATVSTP & HACCP, Form nhận Báo Giá Sỉ |

---

## 🎁 3. GIAO DIỆN TETTA - CHUẨN 1:1 THEO `thaiduong_design`

* **File ảnh Mockup:** [`assets/mockups/tetta_homepage_mockup.jpg`](file:///Users/Company/Catbox/assets/mockups/tetta_homepage_mockup.jpg)
* **Bảng màu:** Đỏ Rượu Vang Bordeaux (`#8B1E2D`), Ánh Kim Gold (`#D4AF37`), Trắng Kem (`#FAF8F5`).

<p align="center">
  <img src="../assets/mockups/tetta_homepage_mockup.jpg" alt="Giao diện Website TETTA" width="100%" />
</p>

---

## 🥖 4. GIAO DIỆN CFC - CHUẨN 1:1 THEO `thaiduong_design`

* **File ảnh Mockup:** [`assets/mockups/cfc_homepage_mockup.jpg`](file:///Users/Company/Catbox/assets/mockups/cfc_homepage_mockup.jpg)
* **Bảng màu:** Vàng Cam Bánh Mì (`#E67E22`), Nâu Giấy Kraft (`#795548`), Trắng Sáng (`#FFFFFF`), CTA Đỏ (`#E74C3C`).

<p align="center">
  <img src="../assets/mockups/cfc_homepage_mockup.jpg" alt="Giao diện Website CFC" width="100%" />
</p>

---

## 🎨 5. BẢNG MÀU & VISUAL TOKENS CHI TIẾT

### 🎁 5.1. THƯƠNG HIỆU TETTA (LUXURY GIFT PACKAGING)
* **Định vị:** Hộp quà Tết cao cấp, Hộp quà doanh nghiệp VIP, Set quà tri ân thượng hạng.
* **Phong cách:** **Elegant Boutique / Luxury Gift** (Trang nhã, ấm áp, quý phái).
* **Mã màu chuẩn (Hex Colors):**
  * **Màu thương hiệu chính (Primary):** Đỏ Rượu Vang Bordeaux (`#8B1E2D`, `#6B0119`)
  * **Màu điểm nhấn (Accent):** Ánh Kim Gold (`#D4AF37`, `#F2994A`) & Cam Đất (`#C06C54`)
  * **Nền trang chính (Body Background):** Trắng Sáng (`#FFFFFF`) & Trắng Kem Ngọc Trai (`#FAF8F5`)
  * **Nền khối nổi bật (Footer / Promo / Dome):** Đỏ Bordeaux Đậm (`#5E101D`, `#40000B`)
  * **Màu chữ (Typography):** Đen Than (`#1B1B1C`), Xám Nhạt (`#574142`)
* **Typography:** Headline dùng font Serif sang trọng (*Playfair Display* hoặc *Cinzel*), Body dùng Sans-serif hiện đại (*Montserrat*).

---

### 🥖 5.2. THƯƠNG HIỆU CFC (DIRECT FACTORY F&B PACKAGING)
* **Định vị:** Xưởng sỉ bao bánh mì & túi giấy thực phẩm F&B giá rẻ tận xưởng.
* **Phong cách:** **Industrial Fast-Commerce / Direct Factory** (Trực diện, chuyên nghiệp, uy tín).
* **Mã màu chuẩn (Hex Colors):**
  * **Màu thương hiệu chính (Primary):** Vàng Cam Bánh Mì (`#E67E22`, `#F39C12`)
  * **Màu phụ trợ (Secondary):** Nâu Giấy Kraft (`#795548`, `#5D4037`)
  * **Nền trang chính (Body Background):** Trắng Sáng (`#FFFFFF`) & Xám Nhạt Công Nghiệp (`#F8F9FA`)
  * **Nền khối nổi bật (Footer / Promo / Dome):** Nâu Kraft Chocolate Đậm (`#3E2723`)
  * **Màu chuyển đổi (CTA Action):** Đỏ Rực (`#E74C3C`) cho nút Gửi/Mua & Xanh Zalo (`#0088FF`)
  * **Màu chữ (Typography):** Đen Xám (`#191C1D`), Xám Tro (`#564337`)
* **Typography:** Headline dùng font chắc khỏe (*Montserrat Bold*), Body & thông số kỹ thuật dùng (*Inter*).

---

## 🛠 6. HƯỚNG DẪN CODE COMPONENTS (FRONTEND IMPLEMENTATION)

Khi triển khai code Frontend (Next.js / React + TailwindCSS), các component được chia tách:

1. `Header.tsx`: Gồm Topbar (cờ đa ngôn ngữ + hotline), MainHeader (Logo + Search form + Nút Đăng nhập/Đăng ký) và CategoryNav (menu có icon + pill freeship).
2. `HeroSection.tsx`: Bố cục 2 cột clean white, nút liên hệ màu thương hiệu, hashtag `#nhận nhiều ưu đãi` với chữ *ưu đãi* màu đỏ, hình sản phẩm 3D đổ bóng.
3. `CategoryCards.tsx`: Grid 4 cột, card vuông bo góc có nút pill màu trắng chữ đen ở giữa.
4. `BestsellerGrid.tsx`: Tabs phân loại, Grid 5 cột, badge oval góc ảnh, swatches chọn mẫu/chất liệu.
5. `PromoBanner.tsx`: Split 50/50 (ảnh sản phẩm + khối màu đậm chứa tiêu đề và 2 nút pill).
6. `WeeklyChoice.tsx`: 3 Card sản phẩm bên trái + 1 Ảnh vuông lớn có điểm Hotspot tương tác bên phải.
7. `WhyChooseUs.tsx`: 2 Cột (Ảnh dọc nhân vật 3D + Text giới thiệu + 3 cam kết + Shape nửa vòm chứa Video player).
8. `NewsCarousel.tsx`: Grid 4 card bài viết blog kèm nút *"Xem thêm tin →"*.
9. `FactoryReels.tsx`: Video ngang full-width máy móc sản xuất.
10. `Footer.tsx`: Nền màu đậm 3 cột (Pháp nhân + HACCP + Policy, 4 Info contact, Form nhận ưu đãi/báo giá) + Copyright bar.

---

## 📁 7. ĐƯỜNG DẪN TÀI NGUYÊN TRONG WORKSPACE

* **Tài liệu đặc tả tổng thể:** [`docs/REQUIREMENTS.md`](file:///Users/Company/Catbox/docs/REQUIREMENTS.md)
* **Sơ đồ cấu trúc cây thư mục:** [`docs/SITEMAP.md`](file:///Users/Company/Catbox/docs/SITEMAP.md)
* **Kịch bản tư vấn & chốt cọc:** [`docs/CONSULTING_SCRIPT.md`](file:///Users/Company/Catbox/docs/CONSULTING_SCRIPT.md)
* **Thư mục ảnh gốc Thái Dương:** [`assets/thaiduong_design/`](file:///Users/Company/Catbox/assets/thaiduong_design/)
* **Thư mục ảnh thiết kế Catbox Flagship:** [`assets/figma_design/`](file:///Users/Company/Catbox/assets/figma_design/)
* **Thư mục ảnh Mockup Tetta & CFC:** [`assets/mockups/`](file:///Users/Company/Catbox/assets/mockups/)
