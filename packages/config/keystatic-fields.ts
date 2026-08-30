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
    category: fields.text({ label: "Danh mục" }),
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
