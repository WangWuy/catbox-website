#!/usr/bin/env node
/**
 * Sinh ảnh placeholder SVG theo brand — §4.2 TECH_STACK_v2.
 *
 * Ràng buộc của dự án: ảnh/video khách gửi SAU, nhưng trang phải demo được
 * ngay. Placeholder ở đây là SVG gradient theo bảng màu brand + nhãn tỉ lệ,
 * đủ để trang trông hoàn chỉnh khi demo mà không dùng ảnh stock rác.
 *
 *   node scripts/gen-placeholder.mjs
 *
 * Kết quả: sites/<brand>/public/placeholders/<ratio>-<n>.svg
 * Thư mục này nằm trong .gitignore — sinh lại bất cứ lúc nào.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Bảng màu lấy đúng từ packages/tokens — giữ đồng bộ khi đổi token. */
const BRANDS = {
  catbox: { from: "#0B0B0B", to: "#1B1B1F", ink: "#FF2E93", label: "CATBOX" },
  tetta: { from: "#FAF8F5", to: "#F0E4E2", ink: "#8B1E2D", label: "TETTA" },
  cfc: { from: "#F6EFE4", to: "#EADFC8", ink: "#E67E22", label: "CFC" },
};

/** Các tỉ lệ dùng trong dự án — khớp bảng ảnh §4 TECH_STACK_v2 */
const RATIOS = {
  "1x1": [1200, 1200],
  "4x3": [1600, 1200],
  "16x9": [1600, 900],
  "3x4": [900, 1200],
  "16x10": [1600, 1000],
};

/** Bao nhiêu biến thể mỗi tỉ lệ — đủ để các grid không lặp lại y hệt nhau */
const VARIANTS = 6;

function svg(brand, ratio, [w, h], i) {
  const c = BRANDS[brand];
  const angle = 25 + i * 18;
  const font = Math.round(Math.min(w, h) * 0.055);
  const sub = Math.round(font * 0.55);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Ảnh ${c.label} đang chờ cập nhật">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c.from}"/>
      <stop offset="100%" stop-color="${c.to}"/>
    </linearGradient>
    <pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="48" stroke="${c.ink}" stroke-opacity="0.06" stroke-width="12"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#p)"/>
  <g fill="${c.ink}" font-family="system-ui,-apple-system,Segoe UI,sans-serif" text-anchor="middle">
    <text x="50%" y="48%" font-size="${font}" font-weight="800" letter-spacing="2" opacity="0.55">${c.label}</text>
    <text x="50%" y="56%" font-size="${sub}" font-weight="600" opacity="0.4">${ratio} · ${w}×${h}</text>
    <text x="50%" y="62%" font-size="${Math.round(sub * 0.8)}" font-weight="500" opacity="0.3">Ảnh thật sẽ thay vào đây</text>
  </g>
</svg>`;
}

let count = 0;
for (const brand of Object.keys(BRANDS)) {
  const dir = join(ROOT, "sites", brand, "public", "placeholders");
  await mkdir(dir, { recursive: true });
  for (const [ratio, dims] of Object.entries(RATIOS)) {
    for (let i = 1; i <= VARIANTS; i++) {
      await writeFile(join(dir, `${ratio}-${i}.svg`), svg(brand, ratio, dims, i), "utf8");
      count++;
    }
  }
  // Ảnh OG mặc định cho SEOHead khi bài viết chưa có ogImage riêng
  await mkdir(join(ROOT, "sites", brand, "public", "og"), { recursive: true });
  await writeFile(
    join(ROOT, "sites", brand, "public", "og", "default.svg"),
    svg(brand, "og", [1200, 630], 3),
    "utf8",
  );
  count++;
}

console.log(`✓ Đã sinh ${count} placeholder cho 3 site.`);
