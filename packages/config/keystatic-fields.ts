import { fields } from "@keystatic/core";

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
    priceFrom: fields.number({ label: "Giá từ", validation: { isRequired: false } }),
    priceLabel: fields.text({ label: "Nhãn giá hiển thị", validation: { isRequired: false } }),
    unit: fields.text({ label: "Đơn vị", defaultValue: "chiếc" }),
    moq: fields.text({ label: "Số lượng tối thiểu (MOQ)", validation: { isRequired: false } }),
    badge: fields.text({ label: "Badge", validation: { isRequired: false } }),
    excerpt: fields.text({
      label: "Mô tả ngắn",
      multiline: true,
      validation: { isRequired: false },
    }),
    image: fields.image({
      label: "Ảnh chính",
      directory: imageDir,
      validation: { isRequired: false },
    }),
    gallery: fields.array(
      fields.image({ label: "Ảnh", directory: imageDir, validation: { isRequired: false } }),
      { label: "Thư viện ảnh", itemLabel: () => "Ảnh" },
    ),
    swatches: fields.array(
      fields.object({
        label: fields.text({ label: "Nhãn" }),
        color: fields.text({ label: "Mã màu hex (#RRGGBB)" }),
        image: fields.image({ label: "Ảnh khi chọn", directory: imageDir, validation: { isRequired: false } }),
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
    ogImage: fields.image({ label: "SEO — Ảnh chia sẻ (OG)", directory: imageDir, validation: { isRequired: false } }),
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
      directory: imageDir,
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
      directory: imageDir,
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
      directory: imageDir,
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
      directory: imageDir,
      validation: { isRequired: false },
    }),
    noindex: fields.checkbox({ label: "Chặn Google index", defaultValue: false }),
    content: fields.mdx({ label: "Nội dung bài viết" }),
  };
}
