export const prerender = true;

/**
 * RSS feed cho mục Tin tức — /rss.xml
 *
 * `site` lấy từ `Astro.site` (astro.config.mjs) chứ không hardcode domain, để
 * đổi domain thật lúc khách chốt là feed đổi theo, không phải sửa hai chỗ.
 */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { BRANDS } from "@config/brands";
import { blogHref } from "@config/blog";
import { parseBlogPage } from "@config/pages";
import blogData from "../content/pages-data/blog.json";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, z) => z.data.date.getTime() - a.data.date.getTime(),
  );
  const b = BRANDS.cfc;
  // Cùng nguồn với trang /blog — trước đây mô tả chép tay ở cả hai file.
  const page = parseBlogPage(blogData);

  return rss({
    title: `${b.name} — ${page.rssTitleSuffix}`,
    description: page.seo.description,
    // `context.site` là `site` trong astro.config; ép kiểu vì Astro khai báo optional
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: blogHref(p.id),
      categories: p.data.tags,
    })),
    customData: "<language>vi</language>",
  });
}
