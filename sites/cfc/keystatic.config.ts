import { config, collection } from "@keystatic/core";
import { productFields } from "@config/keystatic-fields";

export default config({
  storage: {
    kind: "cloud",
  },
  cloud: {
    // TODO: điền project slug thật sau khi tạo team tại keystatic.com/cloud
    // (Phase 0 Task 0.1) — dạng "teamName/projectName".
    project: "TODO/cfc",
  },
  collections: {
    products: collection({
      label: "Sản phẩm",
      path: "src/content/products/*",
      slugField: "title",
      format: { contentField: "content" },
      schema: productFields("src/assets/products"),
    }),
  },
});
