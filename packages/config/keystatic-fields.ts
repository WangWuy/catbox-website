import { fields } from "@keystatic/core";

/**
 * Cặp `directory` + `publicPath` cho mọi `fields.image`.
 *
 * ⚠️ BẮT BUỘC có `publicPath` — thiếu là ảnh khách upload biến mất khỏi site.
 * Lý do, đọc thẳng từ source `@keystatic/core@0.6.9`:
 *
 *   serialize() ghi `${getSrcPrefix(publicPath, slug)}${filename}`
 *   getSrcPrefix() trả '' khi publicPath không phải string
 *
 * Nghĩa là không khai `publicPath` thì frontmatter chỉ nhận **mỗi tên file**
 * (`anh.png`), trong khi `resolveImage()` (packages/ui/lib/images.ts) tra khoá
 * `/src/assets/anh.png` → không thấy → rơi về placeholder. Ảnh vẫn được commit
 * lên repo nhưng không bao giờ hiện ra.
 *
 * `publicPath` = phần đường dẫn SAU `src/assets/`, khớp đúng quy ước đang dùng
 * trong các file .mdx viết tay (`image: products/tui-giay.png`).
 *
 * Về `slug`: với collection, Keystatic ghi ảnh vào `<directory>/<slug>/<file>`
 * và getSrcPrefix chèn slug vào giữa → `products/tui-banh-mi/anh.png`. Với
 * singleton, slug là undefined → `products/anh.png`. Cả hai đều khớp vị trí
 * file thật, nên một công thức dùng chung được cho cả hai.
 */
function asset(imageDir: string) {
  return {
    directory: imageDir,
    publicPath: imageDir.replace(/^.*?src\/assets\//, "").replace(/\/*$/, ""),
  };
}

/**
 * Field Keystatic dùng chung 3 site, map 1-1 với `productSchema` (schema.ts).
 * API `fields.*` xác nhận từ type definitions thật trong
 * node_modules/@keystatic/core/dist/declarations/src/form/fields/*.d.ts —
 * không suy đoán tham số (xem plans/01-keystatic-cms-integration.md Task 1.1).
 *
 * `directory` truyền vào bằng tham số vì mỗi site có thư mục `src/assets/products`
 * riêng (không dùng chung path vật lý giữa 3 site).
 */
export function productFields(imageDir: string) {
  return {
    title: fields.slug({ name: { label: "Tên sản phẩm" } }),
    /**
     * `relationship` chứ không phải `text`: giá trị lưu là slug của file trong
     * collection `categories`, khách chọn từ dropdown nên không thể gõ lệch
     * hoa/thường hay thừa dấu cách làm sản phẩm rơi khỏi trang danh mục
     * (lỗi đã xảy ra: `hop-giay-dung-thuc-an.mdx` ghi "Hộp đựng thức ăn giấy"
     * trong khi title danh mục là "HỘP ĐỰNG THỨC ĂN GIẤY").
     */
    category: fields.relationship({
      label: "Danh mục",
      collection: "categories",
      validation: { isRequired: true },
    }),
    material: fields.array(fields.text({ label: "Chất liệu" }), {
      label: "Chất liệu",
      itemLabel: (props) => props.value || "(chưa đặt tên)",
    }),
    shape: fields.array(fields.text({ label: "Hình dáng" }), {
      label: "Hình dáng",
      itemLabel: (props) => props.value || "(chưa đặt tên)",
    }),
    moq: fields.text({ label: "Số lượng tối thiểu (MOQ)", validation: { isRequired: false } }),
    sku: fields.text({ label: "Mã sản phẩm (SKU)", validation: { isRequired: false } }),
    badge: fields.text({ label: "Badge", validation: { isRequired: false } }),
    excerpt: fields.text({
      label: "Mô tả ngắn",
      multiline: true,
      validation: { isRequired: false },
    }),
    image: fields.image({
      label: "Ảnh chính",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    gallery: fields.array(
      fields.image({ label: "Ảnh", ...asset(imageDir), validation: { isRequired: false } }),
      { label: "Thư viện ảnh", itemLabel: () => "Ảnh" },
    ),
    swatches: fields.array(
      fields.object({
        label: fields.text({ label: "Nhãn" }),
        color: fields.text({ label: "Mã màu hex (#RRGGBB)" }),
        image: fields.image({ label: "Ảnh khi chọn", ...asset(imageDir), validation: { isRequired: false } }),
      }),
      { label: "Swatches", itemLabel: (props) => props.fields.label.value || "Swatch" },
    ),
    specs: fields.array(
      fields.object({
        label: fields.text({ label: "Tên thông số" }),
        value: fields.text({ label: "Giá trị" }),
      }),
      { label: "Thông số kỹ thuật", itemLabel: (props) => props.fields.label.value || "Thông số" },
    ),
    faq: fields.array(
      fields.object({
        q: fields.text({ label: "Câu hỏi" }),
        a: fields.text({ label: "Trả lời", multiline: true }),
      }),
      { label: "FAQ", itemLabel: (props) => props.fields.q.value || "Câu hỏi" },
    ),
    bestseller: fields.checkbox({ label: "Bán chạy", defaultValue: false }),
    weeklyPick: fields.checkbox({ label: "Lựa chọn của tuần", defaultValue: false }),
    order: fields.number({ label: "Thứ tự", defaultValue: 999 }),
    draft: fields.checkbox({ label: "Nháp (ẩn khỏi site)", defaultValue: false }),
    seoTitle: fields.text({ label: "SEO — Tiêu đề", validation: { isRequired: false } }),
    seoDescription: fields.text({
      label: "SEO — Mô tả",
      multiline: true,
      validation: { isRequired: false, length: { max: 165 } },
    }),
    ogImage: fields.image({ label: "SEO — Ảnh chia sẻ (OG)", ...asset(imageDir), validation: { isRequired: false } }),
    noindex: fields.checkbox({ label: "Chặn Google index", defaultValue: false }),
    content: fields.mdx({ label: "Nội dung chi tiết" }),
  };
}

/**
 * Icon Iconify cho CategoryNav. Dùng `select` (danh sách đóng) thay vì `text`
 * vì tên icon gõ sai thì `astro-icon` làm hỏng build cả site — khách sửa nội
 * dung không được phép chạm vào rủi ro đó. Mọi tên dưới đây đều thuộc bộ
 * `@iconify-json/lucide` đã cài sẵn ở cả 3 site.
 */
const ICON_OPTIONS = [
  { label: "Túi xách", value: "lucide:shopping-bag" },
  { label: "Tờ giấy", value: "lucide:file-text" },
  { label: "Hộp", value: "lucide:package" },
  { label: "Cốc", value: "lucide:cup-soda" },
  { label: "Bánh mì", value: "lucide:croissant" },
  { label: "Cốc cà phê", value: "lucide:coffee" },
  { label: "Bát", value: "lucide:utensils" },
  { label: "Quà tặng", value: "lucide:gift" },
  { label: "Ngôi sao", value: "lucide:sparkles" },
  { label: "Nhà máy", value: "lucide:factory" },
  { label: "Báo / Tin tức", value: "lucide:newspaper" },
  { label: "Điện thoại", value: "lucide:phone" },
  { label: "Không có icon", value: "" },
] as const;

/**
 * Field cho collection `categories` — map 1-1 với `categorySchema` (schema.ts).
 *
 * Đây là phần cho phép khách **tự thêm đầu mục sản phẩm** theo yêu cầu ghi
 * trong sitemap CFC (design/cfc/branding/sitemap.png, dòng cuối cột Sản phẩm).
 * `parent` dựng cây 3 tầng như sitemap; để trống là danh mục gốc hiện trên
 * thanh menu.
 */
export function categoryFields(imageDir: string) {
  return {
    title: fields.slug({ name: { label: "Tên danh mục" } }),
    navLabel: fields.text({
      label: "Tên ngắn (điều hướng)",
      description:
        "Dùng trong câu dẫn ở sidebar, ví dụ “Túi giấy” cho ra tiêu đề “LOẠI TÚI GIẤY”. Bỏ trống thì lấy tên danh mục đầy đủ.",
      validation: { isRequired: false },
    }),
    sub: fields.text({
      label: "Phụ đề",
      description: "Dòng nhỏ dưới tên danh mục, ví dụ “Túi kraft, túi zip, túi quai xoắn”.",
      validation: { isRequired: false },
    }),
    parent: fields.relationship({
      label: "Danh mục cha",
      collection: "categories",
      description:
        "Để trống nếu đây là đầu mục lớn hiện trên thanh menu. Chọn danh mục cha để tạo mục con (ví dụ “Bao bánh mì que” nằm trong “Túi bánh mì”).",
    }),
    icon: fields.select({
      label: "Icon trên menu",
      options: ICON_OPTIONS,
      defaultValue: "",
      description: "Chỉ hiển thị với đầu mục lớn (không có danh mục cha).",
    }),
    description: fields.text({
      label: "Mô tả",
      multiline: true,
      validation: { isRequired: false },
    }),
    image: fields.image({
      label: "Ảnh đại diện",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    order: fields.number({ label: "Thứ tự", defaultValue: 999 }),
    hideFromNav: fields.checkbox({
      label: "Ẩn khỏi menu",
      description: "Trang danh mục vẫn truy cập được, chỉ không hiện trên thanh menu.",
      defaultValue: false,
    }),
    draft: fields.checkbox({ label: "Nháp (ẩn khỏi site)", defaultValue: false }),
    seoTitle: fields.text({ label: "SEO — Tiêu đề", validation: { isRequired: false } }),
    seoDescription: fields.text({
      label: "SEO — Mô tả",
      multiline: true,
      validation: { isRequired: false, length: { max: 165 } },
    }),
    ogImage: fields.image({
      label: "SEO — Ảnh chia sẻ (OG)",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    noindex: fields.checkbox({ label: "Chặn Google index", defaultValue: false }),
    content: fields.mdx({ label: "Nội dung mô tả danh mục" }),
  };
}

/**
 * Field cho collection `blog` — map 1-1 với `blogSchema` (schema.ts).
 *
 * `date` dùng `fields.date` (lưu chuỗi "YYYY-MM-DD", `z.coerce.date()` phía
 * schema tự parse) — badge ngày trên thumbnail đọc thẳng giá trị này, nên đây
 * là field bắt buộc, không để khách bỏ trống.
 */
export function blogFields(imageDir: string) {
  return {
    title: fields.slug({ name: { label: "Tiêu đề bài viết" } }),
    description: fields.text({
      label: "Mô tả ngắn",
      description: "Hiện dưới tiêu đề ở trang danh sách và dùng làm mô tả SEO mặc định.",
      multiline: true,
    }),
    date: fields.date({
      label: "Ngày đăng",
      description: "Quyết định thứ tự bài (mới nhất lên đầu) và số hiện trên badge ảnh.",
      defaultValue: { kind: "today" },
      validation: { isRequired: true },
    }),
    updated: fields.date({
      label: "Ngày cập nhật",
      description: "Để trống nếu bài chưa sửa lại. Google dùng mốc này cho bài viết cũ.",
      validation: { isRequired: false },
    }),
    author: fields.text({ label: "Tác giả", defaultValue: "CFC Factory" }),
    tags: fields.array(fields.text({ label: "Thẻ" }), {
      label: "Thẻ (tags)",
      itemLabel: (props) => props.value || "(chưa đặt tên)",
    }),
    cover: fields.image({
      label: "Ảnh bìa",
      description: "Tỉ lệ 16:10, hiện ở trang danh sách và đầu bài viết.",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    faq: fields.array(
      fields.object({
        q: fields.text({ label: "Câu hỏi" }),
        a: fields.text({ label: "Trả lời", multiline: true }),
      }),
      { label: "FAQ", itemLabel: (props) => props.fields.q.value || "Câu hỏi" },
    ),
    draft: fields.checkbox({ label: "Nháp (ẩn khỏi site)", defaultValue: false }),
    seoTitle: fields.text({ label: "SEO — Tiêu đề", validation: { isRequired: false } }),
    seoDescription: fields.text({
      label: "SEO — Mô tả",
      multiline: true,
      validation: { isRequired: false, length: { max: 165 } },
    }),
    ogImage: fields.image({
      label: "SEO — Ảnh chia sẻ (OG)",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    noindex: fields.checkbox({ label: "Chặn Google index", defaultValue: false }),
    content: fields.mdx({ label: "Nội dung bài viết" }),
  };
}

/**
 * Icon cho các dòng liên hệ / cơ sở. Tách khỏi `ICON_OPTIONS` (icon danh mục
 * sản phẩm) vì hai chỗ này chọn trong hai ngữ cảnh khác hẳn nhau — trộn chung
 * thì khách phải lội qua "Bánh mì", "Cốc giấy" để tìm "Nhà máy".
 */
const CONTACT_ICON_OPTIONS = [
  { label: "Nhà máy", value: "lucide:factory" },
  { label: "Toà nhà / văn phòng", value: "lucide:building-2" },
  { label: "Điện thoại", value: "lucide:phone" },
  { label: "Email", value: "lucide:mail" },
  { label: "Vị trí bản đồ", value: "lucide:map-pin" },
  { label: "Đồng hồ", value: "lucide:clock" },
] as const;

/** Cặp nhãn + link, lặp ở headerCta / topbarCta / social / nút CTA các trang */
const ctaFields = (label: string) =>
  fields.object(
    {
      label: fields.text({ label: "Nhãn hiển thị" }),
      href: fields.text({ label: "Đường dẫn" }),
    },
    { label },
  );

/**
 * Field cho singleton "Cài đặt thương hiệu" — map 1-1 với `settingsSchema`
 * (settings.ts). Dữ liệu ghi ra `packages/config/data/<brand>.json`.
 *
 * Đây là phần thay thế các giá trị trước đây hard-code trong `brands.ts`, gồm
 * cả những placeholder đang lên production: hotline `0909.xxx.xxx`, 4 link mạng
 * xã hội đều `#`, danh sách sale chưa xác nhận.
 *
 * KHÔNG có field ảnh nào ở đây → không cần `asset()`. Logo/favicon vẫn thuộc
 * hạ tầng, giữ trong `brands.ts`.
 */
export function settingsFields() {
  return {
    name: fields.text({ label: "Tên thương hiệu" }),
    tagline: fields.text({ label: "Câu định vị ngắn" }),
    legalName: fields.text({ label: "Tên pháp nhân (trên hoá đơn, footer)" }),
    memberOf: fields.text({
      label: "Dòng bảo chứng",
      description: "Ví dụ “A Member of Catbox Packaging Ecosystem”. Bỏ trống nếu không có.",
      validation: { isRequired: false },
    }),

    hotline: fields.text({
      label: "Hotline (hiển thị)",
      description: "Viết đúng như muốn hiện trên trang, ví dụ “0909.123.456”.",
    }),
    hotlineHref: fields.text({
      label: "Hotline (link bấm gọi)",
      description:
        "Dạng tel: không dấu cách, ví dụ “tel:+84909123456”. Đây là số máy thật sự quay khi khách bấm.",
    }),
    zalo: fields.text({
      label: "Số Zalo",
      description: "Chỉ chữ số, không dấu chấm — dùng dựng link zalo.me.",
    }),
    email: fields.text({ label: "Email" }),

    searchPlaceholder: fields.text({
      label: "Gợi ý trong ô tìm kiếm",
      description: "Chữ mờ hiện sẵn trong ô tìm kiếm, ví dụ “Tìm bao bánh mì que...”.",
    }),
    promoPill: fields.text({
      label: "Pill khuyến mãi",
      description: "Dòng chữ nhỏ bên phải thanh danh mục.",
    }),
    headerCta: ctaFields("Nút CTA trên header"),
    topbarCta: ctaFields("Nút CTA trên thanh trên cùng"),

    certifications: fields.array(fields.text({ label: "Chứng nhận" }), {
      label: "Chứng nhận",
      itemLabel: (props) => props.value || "(chưa đặt tên)",
    }),
    certLogos: fields.array(
      fields.object({
        name: fields.text({ label: "Tên chứng nhận / logo (ví dụ: ISO 9001:2015, HACCP CODEX, Đã thông báo)" }),
        label: fields.text({ label: "Mô tả / cơ quan (ví dụ: Quản lý chất lượng, Bộ Công Thương)" }),
        sub: fields.text({ label: "Dòng phụ (ví dụ: Tiêu chuẩn quốc tế, online.gov.vn)" }),
        href: fields.text({ label: "Đường dẫn liên kết (tùy chọn)" }),
        src: fields.text({ label: "Đường dẫn ảnh logo (tùy chọn, để trống dùng biểu trưng chuẩn)" }),
        type: fields.select({
          label: "Loại biểu trưng",
          options: [
            { label: "ISO (Quản lý chất lượng)", value: "iso" },
            { label: "HACCP (An toàn thực phẩm)", value: "haccp" },
            { label: "Bộ Công Thương (Đã thông báo)", value: "bocongthuong" },
            { label: "Sở Công Thương", value: "socongthuong" },
            { label: "Tùy biến", value: "custom" },
          ],
          defaultValue: "custom",
        }),
      }),
      {
        label: "Logo chứng nhận & kiểm định chân trang",
        description: "Hiện dưới phần tư vấn bán hàng và chính sách bán hàng (ISO, HACCP, Sở/Bộ Công Thương).",
        itemLabel: (props) => props.fields.name.value || "(chưa đặt tên)",
      },
    ),
    stats: fields.array(
      fields.object({
        num: fields.text({ label: "Con số", description: "Ví dụ “10+”, “5.000+”, “100%”." }),
        label: fields.text({ label: "Chú thích" }),
        highlight: fields.checkbox({ label: "Tô màu nhấn", defaultValue: false }),
      }),
      {
        label: "Số liệu năng lực",
        description:
          "Dùng ở cả trang Giới thiệu và trang Liên hệ — sửa ở đây là hai trang cùng đổi, không lệch nhau.",
        itemLabel: (props) => `${props.fields.num.value} ${props.fields.label.value}`,
      },
    ),
    locations: fields.array(
      fields.object({
        icon: fields.select({
          label: "Icon",
          options: CONTACT_ICON_OPTIONS,
          defaultValue: "lucide:factory",
        }),
        label: fields.text({ label: "Tên cơ sở", description: "Ví dụ “Nhà máy”, “Văn phòng”." }),
        streetAddress: fields.text({
          label: "Số nhà / đường / khu",
          description: "Phần đầu địa chỉ, ví dụ “KCN Đồng Văn, Duy Tiên”.",
        }),
        locality: fields.text({
          label: "Tỉnh / thành phố",
          description: "Tách riêng vì Google cần đúng phần này cho kết quả tìm kiếm địa phương.",
        }),
        country: fields.text({ label: "Mã quốc gia", defaultValue: "VN" }),
        hours: fields.object(
          {
            days: fields.text({ label: "Ngày làm việc", validation: { isRequired: false } }),
            opens: fields.text({ label: "Giờ mở cửa", validation: { isRequired: false } }),
            closes: fields.text({ label: "Giờ đóng cửa", validation: { isRequired: false } }),
          },
          { label: "Giờ làm việc" },
        ),
        image: fields.text({
          label: "Ảnh cơ sở",
          description: "Đường dẫn ảnh trong src/assets, ví dụ “brand/nha-may.png”. Bỏ trống thì dùng ảnh mặc định.",
          validation: { isRequired: false },
        }),
      }),
      {
        label: "Cơ sở (nhà máy / văn phòng)",
        itemLabel: (props) => props.fields.label.value || "Cơ sở",
      },
    ),
    salesReps: fields.array(
      fields.object({
        name: fields.text({ label: "Tên nhân viên" }),
        phone: fields.text({ label: "Số điện thoại / Zalo" }),
      }),
      {
        label: "Tư vấn bán hàng",
        description: "Hiện ở cột giữa Footer, bấm vào mở Zalo.",
        itemLabel: (props) => props.fields.name.value || "Nhân viên",
      },
    ),
    serviceHotlines: fields.array(fields.text({ label: "Số điện thoại" }), {
      label: "Hotline phản ánh dịch vụ",
      description: "Tách riêng khỏi hotline bán hàng.",
      itemLabel: (props) => props.value || "(chưa điền)",
    }),
    social: fields.array(ctaFields("Mạng xã hội"), {
      label: "Mạng xã hội",
      description: "Nhãn là chữ viết tắt hiện trong ô vuông (f, in, YT, TT).",
      itemLabel: (props) => props.fields.label.value || "Link",
    }),
    nav: fields.object(
      {
        topbarLinks: fields.array(ctaFields("Liên kết"), {
          label: "Liên kết thanh trên cùng",
          description: "Các mục nhỏ hiện ở topbar (ví dụ \"Về Chúng Tôi\", \"Quy Trình\").",
          itemLabel: (props) => props.fields.label.value || "Liên kết",
        }),
        entries: fields.array(
          fields.object({
            label: fields.text({ label: "Nhãn hiển thị" }),
            href: fields.text({ label: "Đường dẫn" }),
            icon: fields.select({
              label: "Icon",
              options: ICON_OPTIONS,
              defaultValue: "",
            }),
            isMega: fields.checkbox({
              label: "Mega menu (hiện danh mục con)",
              description: "Bật nếu mục này mở thanh mega menu với danh mục sản phẩm.",
              defaultValue: false,
            }),
          }),
          {
            label: "Menu chính",
            itemLabel: (props) => props.fields.label.value || "Mục",
          },
        ),
      },
      { label: "Điều hướng" },
    ),
    footer: fields.object(
      {
        newsletterTitle: fields.text({
          label: "Tiêu đề ô đăng ký nhận tin",
          description: "Dòng lớn trong khối newsletter ở chân trang.",
        }),
        newsletterDesc: fields.text({
          label: "Mô tả ô đăng ký nhận tin",
          description: "Dòng nhỏ bên dưới tiêu đề, ví dụ \"Bảng giá cập nhật theo chất liệu và số lượng đặt.\".",
          multiline: true,
        }),
      },
      { label: "Chân trang" },
    ),
  };
}

/**
 * Icon cho ô số liệu trên hero. Danh sách đóng vì cùng lý do với
 * `ICON_OPTIONS`: tên icon gõ sai làm `astro-icon` hỏng build cả site.
 */
const STAT_ICON_OPTIONS = [
  { label: "Túi giấy F&B", value: "lucide:paper-bag" },
  { label: "Túi xách", value: "lucide:shopping-bag" },
  { label: "Cuộn giấy / Giấy gói", value: "lucide:scroll" },
  { label: "Hộp / Thùng", value: "lucide:package" },
  { label: "Cốc / Ly", value: "lucide:cup-soda" },
  { label: "Ống hút giấy", value: "straw" },
  { label: "Kiện hàng / Hộp các loại", value: "lucide:boxes" },
  { label: "Đạt chuẩn đóng gói", value: "lucide:package-check" },
  { label: "Xếp lớp / Giấy lót", value: "lucide:layers" },
  { label: "Nhà máy", value: "lucide:factory" },
  { label: "Quà tặng", value: "lucide:gift" },
] as const;

/**
 * SEO của một trang cố định — `title`/`description` bắt buộc, khác `seoFields`
 * của content collection (ở đó bỏ trống thì suy ra từ nội dung bản ghi).
 */
const seoFields = () =>
  fields.object(
    {
      title: fields.text({
        label: "Tiêu đề trang",
        description: "Hiện trên tab trình duyệt và làm tiêu đề kết quả Google.",
      }),
      description: fields.text({
        label: "Mô tả",
        description: "1–2 câu, đây là dòng Google hiển thị dưới tiêu đề.",
        multiline: true,
        validation: { length: { max: 165 } },
      }),
    },
    { label: "SEO" },
  );

/**
 * Field cho singleton "Trang chủ" — map 1-1 với `homepageSchema` (pages.ts).
 *
 * Thay cho props literal trước đây viết thẳng trong `sites/cfc/src/pages/index.astro`.
 */
export function homepageFields(imageDir: string) {
  return {
    seo: seoFields(),
    hero: fields.object(
      {
        image: fields.image({
          label: "Ảnh nền",
          ...asset(imageDir),
          validation: { isRequired: false },
        }),
        eyebrow: fields.text({
          label: "Dòng nhỏ trên tiêu đề",
          validation: { isRequired: false },
        }),
        title: fields.text({ label: "Tiêu đề" }),
        titleAccent: fields.text({
          label: "Phần tiêu đề tô màu",
          description: "Nối ngay sau tiêu đề và được tô màu thương hiệu, ví dụ “CFC”.",
          validation: { isRequired: false },
        }),
        subtitle: fields.text({
          label: "Mô tả dưới tiêu đề",
          multiline: true,
          validation: { isRequired: false },
        }),
        hashtag: fields.text({
          label: "Đuôi hashtag",
          description: "Trang hiển thị “#nhận nhiều <đuôi>”. Chỉ điền phần đuôi.",
          validation: { isRequired: false },
        }),
        cta: ctaFields("Nút hành động (CTA)"),
        stats: fields.array(
          fields.object({
            icon: fields.select({
              label: "Icon",
              options: STAT_ICON_OPTIONS,
              defaultValue: "lucide:package",
            }),
            num: fields.text({ label: "Con số (nếu có)", description: "Ví dụ “4.400.000” (có thể để trống)." }),
            label: fields.text({ label: "Nhãn / Tên danh mục", description: "Ví dụ “TÚI GIẤY” hoặc “Chiếc/năm”." }),
            href: fields.text({ label: "Đường dẫn (Link khi click)", description: "Ví dụ “/danh-muc/tui-giay-thuc-pham”." }),
          }),
          {
            label: "Số liệu / Danh mục trên hero",
            itemLabel: (props) => props.fields.label.value || props.fields.num.value || "Ô danh mục",
          },
        ),
      },
      { label: "Banner đầu trang" },
    ),
    partners: fields.array(
      fields.object({
        name: fields.text({ label: "Tên thương hiệu đối tác" }),
        logo: fields.image({
          label: "Ảnh logo (PNG trong suốt hoặc SVG)",
          description: "Tải file logo PNG trong suốt hoặc SVG từ máy. Bỏ trống nếu nhập đường dẫn bên dưới.",
          ...asset(imageDir),
          validation: { isRequired: false },
        }),
        logoUrl: fields.text({
          label: "Đường dẫn file logo (nếu không upload trực tiếp)",
          description: "Ví dụ: /partners/chops.svg hoặc link URL. Bỏ trống nếu đã upload ảnh ở trên.",
          validation: { isRequired: false },
        }),
        href: fields.text({
          label: "Link website / fanpage của đối tác (tùy chọn)",
          description: "Ví dụ: https://chops.vn. Bỏ trống nếu không cần click mở trang.",
          validation: { isRequired: false },
        }),
      }),
      {
        label: "Dải logo đối tác thương hiệu",
        description: "Danh sách thương hiệu F&B đối tác tin cậy trượt ngang trên trang chủ.",
        itemLabel: (props) => props.fields.name.value || "Đối tác",
      },
    ),
    bestsellers: fields.object(
      {
        title: fields.text({ label: "Tiêu đề khối" }),
        limit: fields.number({
          label: "Số sản phẩm tối đa",
          description: "Chỉ lấy trong các sản phẩm đã tick “Bán chạy”.",
          defaultValue: 10,
        }),
      },
      { label: "Khối sản phẩm bán chạy" },
    ),
    news: fields.object(
      {
        title: fields.text({ label: "Tiêu đề khối" }),
        action: ctaFields("Nút xem thêm"),
        limit: fields.number({ label: "Số bài tối đa", defaultValue: 3 }),
      },
      { label: "Khối tin tức" },
    ),
    reels: fields.object(
      {
        label: fields.text({
          label: "Mô tả video",
          description:
            "Không hiện trên trang — dành cho trình đọc màn hình và công cụ tìm kiếm.",
        }),
        video: fields.text({
          label: "Đường dẫn video",
          description:
            "File .mp4 đặt trong thư mục public/video của site (ví dụ “/video/ten-file.mp4”), hoặc link video ngoài. File video nặng nên nhờ dev thêm vào, đừng upload qua CMS.",
          validation: { isRequired: false },
        }),
        poster: fields.text({
          label: "Ảnh chờ của video",
          description: "Hiện trước khi video chạy, ví dụ “/video/ten-file-poster.jpg”.",
          validation: { isRequired: false },
        }),
      },
      { label: "Khối video trước Footer" },
    ),
  };
}

/**
 * Field cho singleton "Trang sản phẩm" — map 1-1 với `catalogSchema` (pages.ts).
 *
 * Một singleton phục vụ BA trang (`/products`, `/danh-muc/<slug>`, khối bán
 * chạy ở trang chủ) vì cả ba phải hiện cùng bộ lọc và cùng chú thích swatch.
 */
export function catalogFields(imageDir: string) {
  const filterOptions = (label: string, description: string) =>
    fields.array(
      fields.object({
        value: fields.text({
          label: "Giá trị trong sản phẩm",
          description:
            "Phải khớp đúng giá trị đã gắn ở từng sản phẩm (ví dụ “kraft”). Đổi giá trị này là mọi sản phẩm đang gắn giá trị cũ rơi khỏi bộ lọc.",
        }),
        label: fields.text({ label: "Chữ hiện cho khách" }),
      }),
      { label, description, itemLabel: (props) => props.fields.label.value || "Lựa chọn" },
    );

  return {
    seo: seoFields(),
    heroTitle: fields.text({ label: "Tiêu đề trang" }),
    heroImage: fields.image({
      label: "Ảnh nền đầu trang",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    categoryFallbackImage: fields.image({
      label: "Ảnh nền mặc định cho trang danh mục",
      description: "Dùng khi một đầu mục sản phẩm chưa đặt ảnh đại diện riêng.",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    collectionName: fields.text({
      label: "Tên danh mục cho công cụ tìm kiếm",
      description: "Không hiện trên trang — chỉ dùng trong dữ liệu gửi Google.",
    }),
    materialLabel: fields.text({ label: "Tên nhóm lọc chất liệu" }),
    materials: filterOptions("Chất liệu", "Các lựa chọn trong nhóm lọc chất liệu."),
    shapeLabel: fields.text({ label: "Tên nhóm lọc kiểu dáng" }),
    shapes: filterOptions("Kiểu dáng", "Các lựa chọn trong nhóm lọc kiểu dáng."),
    swatchNote: fields.text({
      label: "Chú thích dưới ô màu",
      description: "Dòng nhỏ dưới dãy ô màu trên mỗi thẻ sản phẩm, ví dụ “Kraft / MG”.",
      validation: { isRequired: false },
    }),
  };
}

/**
 * Icon dùng trong nội dung trang (thẻ tầm nhìn/sứ mệnh, thẻ liên kết trang con).
 * Danh sách đóng — cùng lý do với `ICON_OPTIONS`.
 */
const PAGE_ICON_OPTIONS = [
  { label: "Con mắt (tầm nhìn)", value: "lucide:eye" },
  { label: "Bia ngắm (sứ mệnh)", value: "lucide:target" },
  { label: "Nhà máy", value: "lucide:factory" },
  { label: "Sơ đồ quy trình", value: "lucide:workflow" },
  { label: "Tờ giấy", value: "lucide:file-text" },
  { label: "Khiên (bảo hành)", value: "lucide:shield-check" },
  { label: "Ví (thanh toán)", value: "lucide:wallet" },
  { label: "Cuộn văn bản", value: "lucide:scroll-text" },
  { label: "Xe giao hàng", value: "lucide:truck" },
  { label: "Ngôi sao", value: "lucide:sparkles" },
  { label: "Cúp", value: "lucide:trophy" },
  { label: "Nhóm người", value: "lucide:users" },
] as const;

/** Tiêu đề khối: phần thường + phần tô màu nhấn (SectionHeader) */
const headingFields = () => ({
  title: fields.text({ label: "Tiêu đề khối" }),
  accent: fields.text({
    label: "Phần tiêu đề tô màu",
    description: "Nối ngay sau tiêu đề và được tô màu thương hiệu.",
    validation: { isRequired: false },
  }),
});

/** Khối video trước Footer — lặp ở trang chủ và trang giới thiệu */
const reelsFields = () =>
  fields.object(
    {
      label: fields.text({
        label: "Mô tả video",
        description: "Không hiện trên trang — dành cho trình đọc màn hình và công cụ tìm kiếm.",
      }),
      video: fields.text({
        label: "Đường dẫn video",
        description:
          "File .mp4 trong thư mục public/video của site, hoặc link ngoài. File video nặng nên nhờ dev thêm vào, đừng upload qua CMS.",
        validation: { isRequired: false },
      }),
      poster: fields.text({
        label: "Ảnh chờ của video",
        validation: { isRequired: false },
      }),
    },
    { label: "Video" },
  );

/**
 * Field cho singleton "Trang giới thiệu" — map 1-1 với `aboutSchema` (pages.ts).
 */
export function aboutFields(imageDir: string) {
  return {
    seo: seoFields(),
    hero: fields.object(
      {
        title: fields.text({ label: "Tiêu đề" }),
        image: fields.image({
          label: "Ảnh nền",
          ...asset(imageDir),
          validation: { isRequired: false },
        }),
        imageAlt: fields.text({
          label: "Mô tả ảnh",
          description: "Cho người dùng trình đọc màn hình và khi ảnh không tải được.",
          validation: { isRequired: false },
        }),
      },
      { label: "Đầu trang" },
    ),
    overview: fields.object(
      {
        ...headingFields(),
        body: fields.text({ label: "Đoạn giới thiệu", multiline: true }),
        images: fields.array(
          fields.object({
            src: fields.image({
              label: "Ảnh",
              ...asset(imageDir),
              validation: { isRequired: false },
            }),
            alt: fields.text({ label: "Mô tả ảnh", validation: { isRequired: false } }),
          }),
          { label: "Ảnh minh hoạ", itemLabel: (props) => props.fields.alt.value || "Ảnh" },
        ),
      },
      { label: "Tổng quan công ty" },
    ),
    purpose: fields.object(
      {
        ...headingFields(),
        items: fields.array(
          fields.object({
            icon: fields.select({
              label: "Icon",
              options: PAGE_ICON_OPTIONS,
              defaultValue: "lucide:eye",
            }),
            title: fields.text({ label: "Tiêu đề" }),
            body: fields.text({ label: "Nội dung", multiline: true }),
            tone: fields.select({
              label: "Tông màu",
              options: [
                { label: "Cam ấm (Mặc định)", value: "primary" },
                { label: "Xanh lá sinh thái (Eco Green)", value: "eco" },
              ],
              defaultValue: "primary",
            }),
          }),
          {
            label: "Thẻ (Tầm nhìn / Sứ mệnh)",
            itemLabel: (props) => props.fields.title.value || "Thẻ",
          },
        ),
      },
      { label: "Tầm nhìn & Sứ mệnh" },
    ),
    coreValues: fields.object(
      {
        ...headingFields(),
        items: fields.array(
          fields.object({
            title: fields.text({ label: "Tên giá trị" }),
            tagline: fields.text({
              label: "Câu chốt ngắn",
              description: "In nghiêng, đứng trên đoạn mô tả.",
              validation: { isRequired: false },
            }),
            desc: fields.text({ label: "Mô tả", multiline: true }),
          }),
          {
            label: "Giá trị cốt lõi",
            description:
              "TỐI ĐA 5 mục — sơ đồ hiển thị là hình ngũ giác, mục thứ 6 sẽ rơi vào giữa tâm.",
            itemLabel: (props) => props.fields.title.value || "Giá trị",
          },
        ),
      },
      { label: "Giá trị cốt lõi" },
    ),
    strategicGoals: fields.object(
      {
        title: fields.text({ label: "Tiêu đề khối" }),
        accent: fields.array(fields.text({ label: "Từ" }), {
          label: "Các từ tô màu (gõ luân phiên)",
          description: "Nhiều từ thì trang gõ lần lượt từng từ rồi lặp lại.",
          itemLabel: (props) => props.value || "(chưa điền)",
        }),
        label: fields.text({
          label: "Nhãn nhỏ trên mỗi thẻ",
          description: "Dùng khi mục không tự đặt tiêu đề riêng.",
        }),
        items: fields.array(
          fields.object({
            title: fields.text({ label: "Tiêu đề riêng", validation: { isRequired: false } }),
            desc: fields.text({ label: "Nội dung", multiline: true }),
            tone: fields.select({
              label: "Tông màu",
              options: [
                { label: "Cam ấm (Mặc định)", value: "primary" },
                { label: "Xanh lá sinh thái (Eco Green)", value: "eco" },
              ],
              defaultValue: "primary",
            }),
          }),
          { label: "Mục tiêu", itemLabel: (props) => props.fields.desc.value || "Mục tiêu" },
        ),
      },
      { label: "Mục tiêu chiến lược" },
    ),
    video: fields.object(
      { ...headingFields(), reels: reelsFields() },
      { label: "Khối video giới thiệu" },
    ),
    sections: fields.object(
      {
        ...headingFields(),
        items: fields.array(
          fields.object({
            num: fields.text({ label: "Số bước (vd: 01)" }),
            icon: fields.select({
              label: "Icon (tùy chọn)",
              options: PAGE_ICON_OPTIONS,
              defaultValue: "lucide:workflow",
            }),
            title: fields.text({ label: "Tiêu đề bước" }),
            desc: fields.text({ label: "Mô tả ngắn", multiline: true }),
            href: fields.text({ label: "Đường dẫn" }),
          }),
          {
            label: "Bước quy trình",
            itemLabel: (props) =>
              `${props.fields.num.value ? props.fields.num.value + ". " : ""}${props.fields.title.value || "Bước"}`,
          },
        ),
      },
      { label: "Khối “Quy trình làm việc”" },
    ),
  };
}

/** Icon dây chuyền sản xuất */
const MACHINE_ICON_OPTIONS = [
  { label: "Lớp giấy (Offset)", value: "lucide:layers" },
  { label: "Vòng lặp (Flexo)", value: "lucide:repeat" },
  { label: "Nhà máy", value: "lucide:factory" },
  { label: "Bánh răng", value: "lucide:settings" },
  { label: "Máy in", value: "lucide:printer" },
  { label: "Hộp", value: "lucide:package" },
] as const;

/** Khối CTA đóng cuối trang tĩnh — tiêu đề + đoạn dẫn + một nút */
const ctaBlockFields = (label: string) =>
  fields.object(
    {
      title: fields.text({ label: "Tiêu đề" }),
      body: fields.text({ label: "Nội dung", multiline: true }),
      action: ctaFields("Nút bấm"),
    },
    { label },
  );

/**
 * Field cho singleton "Trang năng lực sản xuất" — map 1-1 với `capacitySchema`.
 */
export function capacityFields() {
  return {
    seo: seoFields(),
    parentCrumb: ctaFields("Mục cha trên đường dẫn"),
    intro: fields.object(
      {
        title: fields.text({ label: "Tiêu đề trang" }),
        body: fields.text({ label: "Đoạn mở đầu", multiline: true }),
      },
      { label: "Mở đầu" },
    ),
    linesLabel: fields.text({
      label: "Tên khối danh sách dây chuyền",
      description: "Không hiện trên trang — dành cho trình đọc màn hình.",
    }),
    suitedLabel: fields.text({ label: "Nhãn danh sách “phù hợp với”" }),
    lines: fields.array(
      fields.object({
        icon: fields.select({
          label: "Icon",
          options: MACHINE_ICON_OPTIONS,
          defaultValue: "lucide:layers",
        }),
        name: fields.text({ label: "Tên dây chuyền" }),
        tagline: fields.text({ label: "Mô tả ngắn", multiline: true }),
        specs: fields.array(
          fields.object({
            label: fields.text({ label: "Tên thông số" }),
            value: fields.text({ label: "Giá trị" }),
          }),
          {
            label: "Thông số",
            description:
              "Ô nào chưa có số thật thì để nguyên “— cần xác nhận —”. Đừng điền số phỏng đoán: số sai trên trang năng lực làm hỏng cả uy tín lẫn kết quả tìm kiếm.",
            itemLabel: (props) => props.fields.label.value || "Thông số",
          },
        ),
        suited: fields.array(fields.text({ label: "Mặt hàng" }), {
          label: "Phù hợp với",
          itemLabel: (props) => props.value || "(chưa điền)",
        }),
      }),
      { label: "Dây chuyền", itemLabel: (props) => props.fields.name.value || "Dây chuyền" },
    ),
    cta: ctaBlockFields("Khối kêu gọi cuối trang"),
  };
}

/** Field cho singleton "Trang 404" — map 1-1 với `notFoundSchema`. */
export function notFoundFields() {
  return {
    seo: seoFields(),
    code: fields.text({ label: "Mã lỗi lớn", defaultValue: "404" }),
    title: fields.text({ label: "Tiêu đề" }),
    body: fields.text({ label: "Nội dung", multiline: true }),
    actions: fields.array(ctaFields("Nút"), {
      label: "Các nút",
      description: "Nút đầu tiên hiển thị nền màu, các nút sau hiển thị dạng viền.",
      itemLabel: (props) => props.fields.label.value || "Nút",
    }),
  };
}

/** Icon cho sàn thương mại điện tử và các bước quy trình */
const FLOW_ICON_OPTIONS = [
  { label: "Giỏ hàng", value: "lucide:shopping-cart" },
  { label: "Túi mua sắm", value: "lucide:shopping-bag" },
  { label: "Bút thiết kế", value: "lucide:pen-tool" },
  { label: "File có dấu hỏi", value: "lucide:file-question" },
  { label: "File đã duyệt", value: "lucide:file-check" },
  { label: "Tờ giấy", value: "lucide:file-text" },
  { label: "Xe giao hàng", value: "lucide:truck" },
  { label: "Sơ đồ quy trình", value: "lucide:workflow" },
] as const;

/**
 * Field cho singleton "Trang quy trình" — map 1-1 với `processSchema`.
 */
export function processFields() {
  return {
    seo: seoFields(),
    parentCrumb: ctaFields("Mục cha trên đường dẫn"),
    intro: fields.object(
      {
        title: fields.text({ label: "Tiêu đề trang" }),
        body: fields.text({ label: "Đoạn mở đầu", multiline: true }),
      },
      { label: "Mở đầu" },
    ),
    flowsLabel: fields.text({
      label: "Tên khối hai luồng",
      description: "Không hiện trên trang — dành cho trình đọc màn hình.",
    }),
    flows: fields.array(
      fields.object({
        icon: fields.select({
          label: "Icon",
          options: FLOW_ICON_OPTIONS,
          defaultValue: "lucide:shopping-cart",
        }),
        title: fields.text({ label: "Tên luồng" }),
        tagline: fields.text({ label: "Mô tả ngắn", multiline: true }),
        body: fields.text({
          label: "Đoạn nội dung",
          multiline: true,
          validation: { isRequired: false },
        }),
        channelsLabel: fields.text({
          label: "Nhãn khối kênh bán",
          validation: { isRequired: false },
        }),
        channels: fields.array(
          fields.object({
            label: fields.text({ label: "Tên kênh" }),
            icon: fields.select({
              label: "Icon",
              options: FLOW_ICON_OPTIONS,
              defaultValue: "lucide:shopping-bag",
            }),
            href: fields.text({
              label: "Link gian hàng",
              description:
                "Link dẫn đến gian hàng (ví dụ: https://shopee.vn/... hoặc https://www.tiktok.com/@...). Bỏ trống sẽ dùng link mặc định.",
              validation: { isRequired: false },
            }),
          }),
          { label: "Kênh bán", itemLabel: (props) => props.fields.label.value || "Kênh" },
        ),
        branches: fields.array(
          fields.object({
            icon: fields.select({
              label: "Icon",
              options: FLOW_ICON_OPTIONS,
              defaultValue: "lucide:file-question",
            }),
            title: fields.text({ label: "Tên nhánh" }),
            body: fields.text({
              label: "Đoạn nội dung",
              description: "Dùng khi nhánh chỉ có một đoạn văn, không chia thành các mục nhỏ.",
              multiline: true,
              validation: { isRequired: false },
            }),
            items: fields.array(
              fields.object({
                label: fields.text({ label: "Tên mục" }),
                badge: fields.text({
                  label: "Nhãn nhỏ",
                  description: "Ví dụ “Edit miễn phí” hoặc “200.000đ / design”.",
                  validation: { isRequired: false },
                }),
                badgeTone: fields.select({
                  label: "Màu nhãn",
                  options: [
                    { label: "Cam thương hiệu", value: "primary" },
                    { label: "Màu nút đặt hàng", value: "cta" },
                  ],
                  defaultValue: "primary",
                }),
                desc: fields.text({ label: "Mô tả", multiline: true }),
              }),
              { label: "Các mục", itemLabel: (props) => props.fields.label.value || "Mục" },
            ),
          }),
          { label: "Nhánh con", itemLabel: (props) => props.fields.title.value || "Nhánh" },
        ),
      }),
      { label: "Luồng khách hàng", itemLabel: (props) => props.fields.title.value || "Luồng" },
    ),
    steps: fields.object(
      {
        title: fields.text({ label: "Tiêu đề khối" }),
        body: fields.text({ label: "Đoạn dẫn", multiline: true }),
        items: fields.array(
          fields.object({
            num: fields.text({ label: "Số thứ tự", description: "Ví dụ “01”." }),
            title: fields.text({ label: "Tên bước" }),
            desc: fields.text({ label: "Mô tả", multiline: true }),
          }),
          {
            label: "Các bước",
            itemLabel: (props) => `${props.fields.num.value} ${props.fields.title.value}`,
          },
        ),
      },
      { label: "Quy trình sản xuất" },
    ),
    cta: ctaBlockFields("Khối kêu gọi cuối trang"),
  };
}

/**
 * Field cho singleton "Trang liên hệ" — map 1-1 với `contactSchema`.
 *
 * Không có field địa chỉ / giờ làm việc: hai thứ đó thuộc "Cài đặt" để trang
 * liên hệ, Footer và dữ liệu gửi Google dùng chung một nguồn.
 */
export function contactFields(imageDir: string) {
  return {
    seo: seoFields(),
    hero: fields.object(
      {
        title: fields.text({ label: "Tiêu đề" }),
        image: fields.image({
          label: "Ảnh nền",
          ...asset(imageDir),
          validation: { isRequired: false },
        }),
        imageAlt: fields.text({ label: "Mô tả ảnh", validation: { isRequired: false } }),
      },
      { label: "Đầu trang" },
    ),
    places: fields.object(
      {
        hotlineLabel: fields.text({
          label: "Nhãn dòng hotline",
          description: "Hiện trên thẻ của cơ sở đầu tiên.",
        }),
        salesLabels: fields.array(fields.text({ label: "Nhãn" }), {
          label: "Nhãn nhân viên sale",
          description:
            "Áp cho các cơ sở còn lại, theo thứ tự danh sách sale trong Cài đặt. Ví dụ “Khách lẻ”, “Khách sỉ”.",
          itemLabel: (props) => props.value || "(chưa điền)",
        }),
      },
      {
        label: "Thẻ địa điểm",
        description:
          "Địa chỉ, giờ làm việc và ảnh của từng cơ sở sửa trong mục Cài đặt, không sửa ở đây.",
      },
    ),
    trust: fields.object(
      {
        eyebrow: fields.text({ label: "Tiêu đề phụ (eyebrow)", validation: { isRequired: false } }),
        title: fields.text({ label: "Tiêu đề", multiline: true }),
        titleColor: fields.text({
          label: "Màu tiêu đề (Tailwind class, VD: text-[#1B365D])",
          validation: { isRequired: false },
        }),
        image: fields.image({
          label: "Ảnh minh hoạ",
          ...asset(imageDir),
          validation: { isRequired: false },
        }),
        imageAlt: fields.text({ label: "Mô tả ảnh", validation: { isRequired: false } }),
        stats: fields.array(
          fields.object({
            num: fields.text({ label: "Số liệu (VD: 10+, 100%)" }),
            label: fields.text({ label: "Nhãn số liệu" }),
            color: fields.text({
              label: "Màu chữ (Tailwind class, VD: text-[#0284C7])",
              validation: { isRequired: false },
            }),
            highlight: fields.checkbox({ label: "Nổi bật", defaultValue: false }),
          }),
          { label: "Số liệu thống kê", itemLabel: (props) => props.fields.label.value || "Số liệu" },
        ),
        body: fields.array(fields.text({ label: "Đoạn văn", multiline: true }), {
          label: "Nội dung đoạn văn",
          itemLabel: (props) => props.value || "(chưa điền)",
        }),
      },
      {
        label: "Khối uy tín & kết nối (Trust)",
        description: "Khối giới thiệu kinh nghiệm và số liệu năng lực trên trang liên hệ.",
      },
    ),
    form: fields.object({ title: fields.text({ label: "Tiêu đề khối" }) }, { label: "Form liên hệ" }),
    map: fields.object(
      {
        iframeUrl: fields.text({
          label: "Link Google Maps iframe (src)",
          description: "URL src trong thẻ iframe lấy từ Google Maps Chia sẻ > Nhúng bản đồ.",
          multiline: true,
        }),
      },
      { label: "Bản đồ Google Maps" },
    ),
    faq: fields.object(
      {
        title: fields.text({ label: "Tiêu đề khối" }),
        items: fields.array(
          fields.object({
            q: fields.text({ label: "Câu hỏi" }),
            a: fields.array(fields.text({ label: "Đoạn", multiline: true }), {
              label: "Trả lời",
              description: "Mỗi đoạn là một dòng riêng trong phần trả lời.",
              itemLabel: (props) => props.value || "(chưa điền)",
            }),
          }),
          { label: "Câu hỏi thường gặp", itemLabel: (props) => props.fields.q.value || "Câu hỏi" },
        ),
      },
      { label: "Câu hỏi thường gặp" },
    ),
    company: fields.object(
      {
        blocks: fields.array(
          fields.object({
            title: fields.text({ label: "Tiêu đề" }),
            body: fields.array(fields.text({ label: "Đoạn", multiline: true }), {
              label: "Nội dung",
              itemLabel: (props) => props.value || "(chưa điền)",
            }),
          }),
          { label: "Các khối", itemLabel: (props) => props.fields.title.value || "Khối" },
        ),
      },
      { label: "Nội dung công ty (khối gập)" },
    ),
    business: fields.object(
      {
        priceRange: fields.text({
          label: "Khoảng giá",
          description: "Ký hiệu theo chuẩn Google: $ rẻ, $$ trung bình, $$$ cao.",
        }),
        openingDays: fields.array(fields.text({ label: "Ngày" }), {
          label: "Ngày làm việc gửi Google",
          description:
            "Tên tiếng Anh theo chuẩn Google: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Phải khớp với dòng ngày làm việc đã ghi trong Cài đặt.",
          itemLabel: (props) => props.value || "(chưa điền)",
        }),
      },
      {
        label: "Thông tin gửi Google",
        description: "Không hiện trên trang — dùng cho kết quả tìm kiếm địa phương.",
      },
    ),
  };
}

/**
 * Field cho singleton "Trang tin tức" — map 1-1 với `blogPageSchema`.
 *
 * Phục vụ cả trang danh sách, trang thẻ, khối cuối bài viết và feed RSS.
 */
export function blogPageFields(imageDir: string) {
  return {
    seo: seoFields(),
    heroTitle: fields.text({ label: "Tiêu đề trang" }),
    heroImage: fields.image({
      label: "Ảnh nền đầu trang",
      description: "Dùng chung cho trang danh sách và trang lọc theo thẻ.",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    crumbLabel: fields.text({
      label: "Nhãn trên đường dẫn",
      description: "Chữ đại diện mục tin tức trong đường dẫn của các trang con.",
    }),
    tagTitleTemplate: fields.text({
      label: "Tiêu đề trang thẻ",
      description: "Dùng {tag} ở chỗ muốn chèn tên thẻ. Ví dụ: “Tin tức về {tag}”.",
    }),
    tagDescriptionTemplate: fields.text({
      label: "Mô tả trang thẻ",
      description: "Dùng {tag} cho tên thẻ và {count} cho số bài viết.",
      multiline: true,
    }),
    backToAll: fields.text({ label: "Nhãn link quay lại danh sách" }),
    relatedTitle: fields.text({ label: "Tiêu đề khối bài viết liên quan" }),
    postCta: fields.object(
      {
        title: fields.text({ label: "Tiêu đề" }),
        body: fields.text({ label: "Nội dung", multiline: true }),
        action: ctaFields("Nút bấm"),
      },
      {
        label: "Khối kêu gọi cuối bài viết",
        description: "Nút gọi hotline bên cạnh lấy số từ mục Cài đặt.",
      },
    ),
    rssTitleSuffix: fields.text({
      label: "Đuôi tiêu đề feed RSS",
      description: "Nối sau tên thương hiệu, ví dụ “CFC Factory — Tin tức & Cẩm nang”.",
    }),
  };
}

/**
 * Field cho collection `policies` — map 1-1 với `policySchema` (schema.ts).
 *
 * `icon` nằm trên chính bản ghi chứ không phải một map slug → icon ở trang hub:
 * khách đổi tên chính sách là slug đổi theo, map cũ sẽ lặng lẽ trượt về icon
 * mặc định mà không ai biết.
 */
export function policyFields(imageDir: string) {
  return {
    title: fields.slug({ name: { label: "Tên chính sách" } }),
    navLabel: fields.text({
      label: "Tên ngắn (chân trang)",
      description:
        "Dùng ở cột link dưới chân trang, nơi tên đầy đủ thường quá dài. Bỏ trống thì dùng tên chính sách.",
      validation: { isRequired: false },
    }),
    updated: fields.date({
      label: "Ngày cập nhật",
      description: "Hiện trên thẻ và đầu trang chính sách.",
      defaultValue: { kind: "today" },
      validation: { isRequired: true },
    }),
    icon: fields.select({
      label: "Icon trên thẻ",
      options: POLICY_ICON_OPTIONS,
      defaultValue: "lucide:file-text",
    }),
    order: fields.number({ label: "Thứ tự", defaultValue: 999 }),
    draft: fields.checkbox({ label: "Nháp (ẩn khỏi site)", defaultValue: false }),
    seoTitle: fields.text({ label: "SEO — Tiêu đề", validation: { isRequired: false } }),
    seoDescription: fields.text({
      label: "SEO — Mô tả",
      description: "Cũng là đoạn tóm tắt hiện trên thẻ ở trang Chính sách công ty.",
      multiline: true,
      validation: { isRequired: false, length: { max: 165 } },
    }),
    ogImage: fields.image({
      label: "SEO — Ảnh chia sẻ (OG)",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    noindex: fields.checkbox({ label: "Chặn Google index", defaultValue: false }),
    content: fields.mdx({ label: "Nội dung chính sách" }),
  };
}

const POLICY_ICON_OPTIONS = [
  { label: "Ví (thanh toán)", value: "lucide:wallet" },
  { label: "Khiên (bảo hành)", value: "lucide:shield-check" },
  { label: "Cuộn văn bản (điều khoản)", value: "lucide:scroll-text" },
  { label: "Tờ giấy", value: "lucide:file-text" },
  { label: "Xe giao hàng", value: "lucide:truck" },
  { label: "Khoá (bảo mật)", value: "lucide:lock" },
] as const;

/**
 * Field cho collection `pages` — map 1-1 với `pageSchema` (schema.ts).
 *
 * Đây là chỗ khách TỰ TẠO trang mới. Đường dẫn trang lấy theo tên: đặt tên
 * "Khuyến mãi hè" thì trang nằm ở /khuyen-mai-he.
 */
export function pageFields(imageDir: string) {
  return {
    title: fields.slug({
      name: { label: "Tên trang" },
      slug: {
        label: "Đường dẫn",
        description:
          "Phần sau tên miền. TRÁNH đặt trùng trang có sẵn (contact, products, blog, about-us, quy-trinh, chinh-sach, search) — trùng thì trang sẽ không lên site.",
      },
    }),
    description: fields.text({
      label: "Đoạn dẫn",
      description: "Hiện dưới tiêu đề, và là mô tả SEO mặc định nếu không điền riêng.",
      multiline: true,
      validation: { isRequired: false },
    }),
    updated: fields.date({
      label: "Ngày cập nhật",
      description: "Bỏ trống thì trang không hiện dòng ngày.",
      validation: { isRequired: false },
    }),
    showInNav: fields.checkbox({
      label: "Hiện ở chân trang",
      description: "Thêm trang này vào danh sách liên kết dưới chân trang.",
      defaultValue: false,
    }),
    navLabel: fields.text({
      label: "Tên ngắn trên menu",
      description: "Bỏ trống thì dùng tên trang đầy đủ.",
      validation: { isRequired: false },
    }),
    order: fields.number({ label: "Thứ tự", defaultValue: 999 }),
    draft: fields.checkbox({ label: "Nháp (ẩn khỏi site)", defaultValue: false }),
    seoTitle: fields.text({ label: "SEO — Tiêu đề", validation: { isRequired: false } }),
    seoDescription: fields.text({
      label: "SEO — Mô tả",
      multiline: true,
      validation: { isRequired: false, length: { max: 165 } },
    }),
    ogImage: fields.image({
      label: "SEO — Ảnh chia sẻ (OG)",
      ...asset(imageDir),
      validation: { isRequired: false },
    }),
    noindex: fields.checkbox({ label: "Chặn Google index", defaultValue: false }),
    content: fields.mdx({ label: "Nội dung trang" }),
  };
}

/** Field cho singleton "Trang chính sách" — map 1-1 với `policiesPageSchema`. */
export function policiesPageFields() {
  return {
    seo: seoFields(),
    parentCrumb: ctaFields("Mục cha trên đường dẫn"),
    intro: fields.object(
      {
        title: fields.text({ label: "Tiêu đề trang" }),
        body: fields.text({ label: "Đoạn mở đầu", multiline: true }),
      },
      { label: "Mở đầu" },
    ),
    listLabel: fields.text({
      label: "Tên khối danh sách",
      description: "Không hiện trên trang — dành cho trình đọc màn hình.",
    }),
  };
}

/**
 * Field cho singleton "Tóm tắt cho AI" — map 1-1 với `llmsSchema`.
 *
 * Sinh ra file `/llms.txt`. Pháp nhân, địa chỉ, hotline, chứng nhận, số liệu,
 * nhóm sản phẩm và hệ sinh thái KHÔNG khai ở đây — chúng tự lấy từ Cài đặt và
 * từ danh mục sản phẩm, nên không bao giờ lệch với trang web.
 */
export function llmsFields() {
  const bullets = (label: string, description?: string) =>
    fields.array(fields.text({ label: "Dòng", multiline: true }), {
      label,
      description,
      itemLabel: (props) => props.value || "(chưa điền)",
    });

  return {
    headline: fields.text({
      label: "Dòng tiêu đề",
      description: "Nối sau tên thương hiệu ở dòng đầu file.",
    }),
    summary: fields.text({
      label: "Giới thiệu ngắn",
      description: "2–3 câu mô tả doanh nghiệp, đặt ngay dưới tiêu đề.",
      multiline: true,
    }),
    sections: fields.object(
      {
        capacity: fields.text({ label: "Tiêu đề mục năng lực" }),
        products: fields.text({ label: "Tiêu đề mục nhóm sản phẩm" }),
        ordering: fields.text({ label: "Tiêu đề mục quy trình đặt hàng" }),
        policies: fields.text({ label: "Tiêu đề mục chính sách" }),
        ecosystem: fields.text({ label: "Tiêu đề mục hệ sinh thái" }),
        links: fields.text({ label: "Tiêu đề mục liên kết" }),
      },
      { label: "Tiêu đề các mục" },
    ),
    capacity: bullets(
      "Năng lực — dòng bổ sung",
      "Các số liệu (năm kinh nghiệm, số khách hàng...) tự lấy từ Cài đặt, chỉ thêm ở đây những gì chưa có.",
    ),
    ordering: bullets("Quy trình đặt hàng", "Hiện thành danh sách đánh số."),
    policies: bullets("Chính sách"),
    links: fields.array(ctaFields("Liên kết"), {
      label: "Liên kết",
      description: "Chỉ trỏ tới trang có thật trên site.",
      itemLabel: (props) => props.fields.label.value || "Liên kết",
    }),
  };
}
