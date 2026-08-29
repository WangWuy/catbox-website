import type { ImageMetadata } from "astro";

/**
 * Cầu nối giữa "ảnh khai trong MDX là một chuỗi" và "astro:assets cần
 * ImageMetadata để tối ưu".
 *
 * Vì sao không dùng `image()` helper của Zod schema: schema nằm ở package dùng
 * chung cho 3 site, mà `image()` chỉ resolve tương đối với thư mục content của
 * TỪNG site. Cách này giữ schema thuần string (3 site dùng chung được) mà vẫn
 * lấy được đủ WebP/AVIF + width/height tự động.
 *
 * Cách dùng trong mỗi site:
 *   const assets = import.meta.glob<{ default: ImageMetadata }>(
 *     "/src/assets/**\/*.{png,jpg,jpeg,webp,avif}", { eager: true }
 *   );
 *   const src = resolveImage(assets, data.image);
 *
 * Trả về `undefined` khi chưa có ảnh → component tự rơi về placeholder brand.
 */
export type AssetMap = Record<string, { default: ImageMetadata }>;

export function resolveImage(
  assets: AssetMap,
  ref: string | undefined,
): ImageMetadata | undefined {
  if (!ref) return undefined;

  // Ảnh ngoài (CDN, Cloudflare Images) hoặc ảnh đã nằm sẵn trong public/
  // → không qua astro:assets được, trả undefined để component dùng <img> thẳng.
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("/")) return undefined;

  const key = ref.startsWith("src/") ? `/${ref}` : `/src/assets/${ref}`;
  return assets[key]?.default;
}

/** Ảnh đã ở public/ hoặc URL ngoài — dùng thẳng làm src của <img> */
export function isRawSrc(ref: string | undefined): ref is string {
  return !!ref && (/^(https?:)?\/\//.test(ref) || ref.startsWith("/"));
}

/** Placeholder theo brand khi chưa có ảnh thật (scripts/gen-placeholder.mjs) */
export function placeholder(
  ratio: "1x1" | "4x3" | "16x9" | "3x4" | "16x10",
  variant = 1,
): string {
  return `/placeholders/${ratio}-${((variant - 1) % 6) + 1}.svg`;
}
