import { config, collection } from "@keystatic/core";
import { blogFields, categoryFields, productFields } from "@config/keystatic-fields";

export default config({
  storage: {
    kind: "cloud",
  },
  cloud: {
    // TODO: điền project slug thật sau khi tạo team tại https://keystatic.cloud
    // (Phase 0 Task 0.1) — dạng "teamName/projectName".
    project: "TODO/cfc",
  },
  ui: {
    brand: { name: "CFC — Quản lý nội dung" },
    navigation: {
      "Sản phẩm": ["categories", "products"],
      "Tin tức": ["blog"],
    },
  },
  collections: {
    /**
     * Đặt TRƯỚC `products` để khách tạo đầu mục rồi mới gắn sản phẩm vào —
     * `products.category` là `relationship` trỏ tới đây, dropdown rỗng nếu
     * chưa có danh mục nào.
     */
    categories: collection({
      label: "Đầu mục sản phẩm",
      path: "src/content/categories/*",
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title"],
      schema: categoryFields("src/assets/categories"),
    }),
    products: collection({
      label: "Sản phẩm",
      path: "src/content/products/*",
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title"],
      schema: productFields("src/assets/products"),
    }),
    /**
     * `columns` có thêm `date` để khách nhìn danh sách là biết bài nào mới —
     * thứ tự hiển thị trên site sắp theo field này, không theo tên file.
     */
    blog: collection({
      label: "Bài viết",
      path: "src/content/blog/*",
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title", "date"],
      schema: blogFields("src/assets/blog"),
    }),
  },
});
