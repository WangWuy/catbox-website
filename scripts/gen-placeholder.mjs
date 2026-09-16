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
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "sites/cfc/package.json"));
const sharp = require("sharp");

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
  // Chú ý: Telegram, Zalo, Facebook chỉ render PNG/JPG, không render SVG!
  const ogDir = join(ROOT, "sites", brand, "public", "og");
  await mkdir(ogDir, { recursive: true });
  const ogSvg = svg(brand, "og", [1200, 630], 3);
  await writeFile(join(ogDir, "default.svg"), ogSvg, "utf8");

  if (brand === "cfc") {
    // CFC có logo thật, sinh thẻ OG chuẩn 1200x630 hiển thị logo nổi bật
    const bgSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF6F0"/>
            <stop offset="100%" stop-color="#F0E5D5"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect x="32" y="32" width="1136" height="566" rx="24" fill="#FFFFFF" stroke="#E5D7C3" stroke-width="2"/>
      </svg>
    `;
    const logoBuf = await sharp(join(ROOT, "sites/cfc/public/logo.png"))
      .resize({ width: 620, fit: "inside" })
      .toBuffer();
    const meta = await sharp(logoBuf).metadata();
    const top = Math.round((630 - meta.height) / 2);
    const left = Math.round((1200 - meta.width) / 2);
    const ogPngBuf = await sharp(Buffer.from(bgSvg))
      .composite([{ input: logoBuf, top, left }])
      .png()
      .toBuffer();

    await writeFile(join(ogDir, "og-image.png"), ogPngBuf);
    await writeFile(join(ogDir, "default.png"), ogPngBuf);
    count += 2;
  }

  count++;
}

console.log(`✓ Đã sinh ${count} placeholder (SVG + PNG OG) cho 3 site.`);
