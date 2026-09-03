import { config, collection, singleton } from "@keystatic/core";
import {
  aboutFields,
  blogFields,
  blogPageFields,
  capacityFields,
  contactFields,
  categoryFields,
  catalogFields,
  homepageFields,
  llmsFields,
  pageFields,
  notFoundFields,
  policiesPageFields,
  policyFields,
  processFields,
  productFields,
  settingsFields,
} from "@config/keystatic-fields";

/**
 * ⚠️ MỌI `path` dưới đây tính từ GỐC REPO, không phải từ `sites/cfc/`.
 *
 * Lý do (đọc từ source @keystatic/core@0.6.9, `getPathPrefix()`):
 *
 *   if (storage.kind === 'local' || !storage.pathPrefix) return undefined;
 *
 * Với mọi storage KHÔNG phải 'local' — gồm cả 'cloud' ở đây — Keystatic đọc/ghi
 * theo cây file của repo GitHub, và không tự biết site nằm trong `sites/cfc/`.
 * Viết `path: "src/content/products/*"` là ra lệnh cho Keystatic commit vào
 * `/src/content/products/` ở gốc repo — một thư mục không tồn tại, không trang
 * nào đọc. Content khách nhập sẽ "mất" dù commit vẫn xanh.
 *
 * Không dùng `storage.pathPrefix = "sites/cfc"` vì nó khoá TOÀN BỘ path của
 * config vào trong `sites/cfc/`, trong khi singleton cài đặt thương hiệu phải
 * nằm ở `packages/config/data/` để `brands.ts` import được (xem file đó).
 */
const SITE = "sites/cfc";

export default config({
  storage: {
    kind: "cloud",
  },
  cloud: {
    // Team "catbox" ôm chung 3 brand (xem singleton settings/settingsCatbox/
    // settingsTetta bên dưới) — khi catbox/tetta có site thật, tạo thêm
    // project mới TRONG CÙNG team này (catbox/catbox, catbox/tetta) thay vì
    // tạo team riêng.
    project: "catbox/cfc-site",
  },
  ui: {
    brand: { name: "CFC — Quản lý nội dung" },
    navigation: {
      "Nội dung trang": ["homepage", "about", "capacity", "catalog", "process", "contact", "blogPage", "policiesPage", "notFound", "llms"],
      "Sản phẩm": ["categories", "products"],
      "Chính sách": ["policies"],
      "Tin tức": ["blog"],
      "Trang tự tạo": ["pages"],
      "Cài đặt": ["settings"],
      /**
       * Hai brand còn lại chưa có site chạy thật, nhưng dữ liệu của chúng nằm
       * chung `packages/config/data/` nên khai được từ đây mà không phải dựng
       * thêm Worker admin riêng cho mỗi site. Tách thành nhóm riêng để người
       * sửa nội dung CFC không bấm nhầm.
       */
      "Thương hiệu khác": ["settingsCatbox", "settingsTetta"],
    },
  },
  singletons: {
    homepage: singleton({
      label: "Trang chủ",
      path: `${SITE}/src/content/pages-data/home`,
      format: { data: "json" },
      schema: homepageFields(`${SITE}/src/assets/brand`),
    }),
    catalog: singleton({
      label: "Trang sản phẩm",
      path: `${SITE}/src/content/pages-data/catalog`,
      format: { data: "json" },
      schema: catalogFields(`${SITE}/src/assets/products`),
    }),
    about: singleton({
      label: "Trang giới thiệu",
      path: `${SITE}/src/content/pages-data/about`,
      format: { data: "json" },
      schema: aboutFields(`${SITE}/src/assets/brand`),
    }),
    capacity: singleton({
      label: "Trang năng lực sản xuất",
      path: `${SITE}/src/content/pages-data/nang-luc-san-xuat`,
      format: { data: "json" },
      schema: capacityFields(),
    }),
    notFound: singleton({
      label: "Trang 404",
      path: `${SITE}/src/content/pages-data/404`,
      format: { data: "json" },
      schema: notFoundFields(),
    }),
    process: singleton({
      label: "Trang quy trình",
      path: `${SITE}/src/content/pages-data/quy-trinh`,
      format: { data: "json" },
      schema: processFields(),
    }),
    contact: singleton({
      label: "Trang liên hệ",
      path: `${SITE}/src/content/pages-data/contact`,
      format: { data: "json" },
      schema: contactFields(`${SITE}/src/assets/products`),
    }),
    blogPage: singleton({
      label: "Trang tin tức",
      path: `${SITE}/src/content/pages-data/blog`,
      format: { data: "json" },
      schema: blogPageFields(`${SITE}/src/assets/products`),
    }),
    policiesPage: singleton({
      label: "Trang chính sách",
      path: `${SITE}/src/content/pages-data/chinh-sach`,
      format: { data: "json" },
      schema: policiesPageFields(),
    }),
    llms: singleton({
      label: "Tóm tắt cho AI (llms.txt)",
      path: `${SITE}/src/content/pages-data/llms`,
      format: { data: "json" },
      schema: llmsFields(),
    }),
    settings: singleton({
      label: "Cài đặt CFC",
      path: "packages/config/data/cfc",
      format: { data: "json" },
      schema: settingsFields(),
    }),
    settingsCatbox: singleton({
      label: "Cài đặt Catbox",
      path: "packages/config/data/catbox",
      format: { data: "json" },
      schema: settingsFields(),
    }),
    settingsTetta: singleton({
      label: "Cài đặt Tetta",
      path: "packages/config/data/tetta",
      format: { data: "json" },
      schema: settingsFields(),
    }),
  },
  collections: {
    /**
     * Đặt TRƯỚC `products` để khách tạo đầu mục rồi mới gắn sản phẩm vào —
     * `products.category` là `relationship` trỏ tới đây, dropdown rỗng nếu
     * chưa có danh mục nào.
     */
    categories: collection({
      label: "Đầu mục sản phẩm",
      path: `${SITE}/src/content/categories/*`,
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title"],
      schema: categoryFields(`${SITE}/src/assets/categories`),
    }),
    products: collection({
      label: "Sản phẩm",
      path: `${SITE}/src/content/products/*`,
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title"],
      schema: productFields(`${SITE}/src/assets/products`),
    }),
    /**
     * `columns` có thêm `date` để khách nhìn danh sách là biết bài nào mới —
     * thứ tự hiển thị trên site sắp theo field này, không theo tên file.
     */
    /**
     * Trang khách tự tạo — route catch-all `/[...slug]`. Đặt cuối vì đây là
     * mục dùng ít nhất, không phải luồng công việc hằng ngày.
     */
    pages: collection({
      label: "Trang",
      path: `${SITE}/src/content/pages/*`,
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title"],
      schema: pageFields(`${SITE}/src/assets/brand`),
    }),
    policies: collection({
      label: "Chính sách",
      path: `${SITE}/src/content/policies/*`,
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title", "updated"],
      schema: policyFields(`${SITE}/src/assets/brand`),
    }),
    blog: collection({
      label: "Bài viết",
      path: `${SITE}/src/content/blog/*`,
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title", "date"],
      schema: blogFields(`${SITE}/src/assets/blog`),
    }),
  },
});
