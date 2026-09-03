export const prerender = true;

/**
 * `/llms.txt` — bản tóm tắt doanh nghiệp cho trợ lý AI đọc.
 *
 * Sinh lúc build thay vì để file tĩnh trong `public/`. File tĩnh cũ chép tay
 * lại pháp nhân, địa chỉ, hotline, số liệu năng lực và danh sách nhóm sản
 * phẩm — nên nó vẫn ghi hotline giả `0909.xxx.xxx` và trỏ tới `/bang-gia-si`,
 * một trang chưa bao giờ tồn tại. Ở đây mọi dữ kiện lấy đúng nguồn mà trang web
 * đang dùng, nên sửa trong CMS là file này đổi theo.
 */
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { BRANDS, otherBrands } from "@config/brands";
import { formatAddress } from "@config/settings";
import { parseLlms } from "@config/pages";
import llmsData from "../content/pages-data/llms.json";

export async function GET(context: APIContext) {
  const b = BRANDS.cfc;
  const page = parseLlms(llmsData);
  const base = context.site?.href.replace(/\/$/, "") ?? b.site;

  // Nhóm sản phẩm = danh mục gốc trong CMS, đúng thứ tự hiện trên menu.
  const roots = (await getCollection("categories", ({ data }) => !data.draft && !data.parent)).sort(
    (a, z) => a.data.order - z.data.order,
  );

  const lines = [
    `# ${b.name} — ${page.headline}`,
    "",
    ...page.summary.split("\n").map((l) => `> ${l}`),
    "",
    `**Pháp nhân:** ${b.legalName}`,
    ...b.locations.map((l) => `**${l.label}:** ${formatAddress(l)}`),
    `**Hotline:** ${b.hotline} · **Email:** ${b.email}`,
    `**Chứng nhận:** ${b.certifications.join(", ")}`,
    "",
    `## ${page.sections.capacity}`,
    "",
    // Số liệu năng lực lấy từ Cài đặt để không lệch với trang Giới thiệu.
    ...b.stats.map((s) => `- ${s.num} ${s.label.toLowerCase()}`),
    ...page.capacity.map((c) => `- ${c}`),
    "",
    `## ${page.sections.products}`,
    "",
    ...roots.map((c) => `- **${c.data.title}**${c.data.sub ? ` — ${c.data.sub.toLowerCase()}` : ""}`),
    "",
    `## ${page.sections.ordering}`,
    "",
    ...page.ordering.map((o, i) => `${i + 1}. ${o}`),
    "",
    `## ${page.sections.policies}`,
    "",
    ...page.policies.map((p) => `- ${p}`),
    "",
    `## ${page.sections.ecosystem}`,
    "",
    ...otherBrands("cfc").map((o) => `- **${o.short}** (${o.site}) — ${o.tagline}`),
    `- **${b.short}** (${b.site}) — ${b.tagline} (trang này)`,
    "",
    `## ${page.sections.links}`,
    "",
    ...page.links.map((l) => `- [${l.label}](${base}${l.href})`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
