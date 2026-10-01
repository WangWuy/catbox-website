export const prerender = true;

/**
 * `/search-index.json` — dữ liệu cho trang /search (lọc phía client).
 *
 * Sinh từ content collection nên chạy được cả ở `astro dev` lẫn bản build,
 * không cần bước Pagefind. Chỉ gồm sản phẩm + bài viết đã xuất bản.
 */
import { getCollection } from "astro:content";
import { categoryTitle } from "@config/categories";

export async function GET() {
  const categories = await getCollection("categories");
  const products = await getCollection("products", ({ data }) => !data.draft);
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const items = [
    ...products.map((p) => ({
      type: "Sản phẩm",
      title: p.data.title,
      url: `/products/${p.id}/`,
      text: [p.data.excerpt, p.data.sku, categoryTitle(categories, p.data.category)]
        .filter(Boolean)
        .join(" "),
    })),
    ...posts.map((p) => ({
      type: "Bài viết",
      title: p.data.title,
      url: `/blog/${p.id}/`,
      text: [p.data.description, ...p.data.tags].join(" "),
    })),
  ];

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json" },
  });
}
