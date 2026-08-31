/**
 * Helper cho collection `blog` — slug thẻ, gom thẻ và chọn bài liên quan.
 *
 * Cùng nguyên tắc với `categories.ts`: KHÔNG import `astro:content`, chỉ nhận
 * dữ liệu đã lấy sẵn, để dùng được cả trong `.astro` lẫn test/script Node thuần.
 *
 * Vì sao thẻ cần slug riêng (khác danh mục): danh mục là file trong CMS nên đã
 * có sẵn slug do Keystatic sinh (`entry.id`), còn thẻ chỉ là chuỗi khách gõ tay
 * trong `fields.array(text)` — "Bao bì giấy" và "bao bì giấy" phải ra cùng một
 * trang, và dấu tiếng Việt phải bỏ đi trước khi lên URL.
 */

/** Hình dạng tối thiểu của một entry `blog` mà các hàm dưới đây cần. */
export interface BlogEntryLike {
  id: string;
  data: {
    title: string;
    date: Date;
    tags: string[];
    draft: boolean;
  };
}

export const blogHref = (slug: string) => `/blog/${slug}`;
export const tagHref = (slug: string) => `/blog/tag/${slug}`;

/**
 * "Bao bì giấy" → "bao-bi-giay". Bỏ dấu bằng NFD rồi xoá dải combining marks
 * (U+0300–U+036F); riêng đ/Đ không phải nguyên âm có dấu nên NFD không tách
 * được, phải thay tay.
 */
export function tagSlug(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (d) => (d === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TagInfo {
  slug: string;
  /** Nhãn hiển thị — lấy cách viết xuất hiện nhiều nhất trong content */
  label: string;
  count: number;
}

/**
 * Gom mọi thẻ trong các bài đang hiển thị. Nhiều cách viết cùng trỏ về một slug
 * ("Bao bì giấy" / "bao bì giấy") được gộp làm một, nhãn hiển thị chọn theo
 * cách viết phổ biến nhất để trang thẻ không hiện chữ thường lem nhem.
 */
export function collectTags(entries: BlogEntryLike[]): TagInfo[] {
  const bySlug = new Map<string, { count: number; variants: Map<string, number> }>();

  for (const e of entries) {
    if (e.data.draft) continue;
    // `Set` chặn một bài gắn trùng thẻ hai lần làm count nhảy gấp đôi
    for (const raw of new Set(e.data.tags)) {
      const slug = tagSlug(raw);
      if (!slug) continue;
      const hit = bySlug.get(slug) ?? { count: 0, variants: new Map() };
      hit.count += 1;
      hit.variants.set(raw, (hit.variants.get(raw) ?? 0) + 1);
      bySlug.set(slug, hit);
    }
  }

  return [...bySlug.entries()]
    .map(([slug, { count, variants }]) => ({
      slug,
      count,
      label: [...variants.entries()].sort((a, z) => z[1] - a[1])[0][0],
    }))
    .sort((a, z) => z.count - a.count || a.label.localeCompare(z.label, "vi"));
}

/**
 * Bài đang hiển thị có gắn thẻ `slug`, mới nhất lên đầu.
 *
 * Generic `<T extends BlogEntryLike>` để trả lại đúng kiểu entry mà caller
 * truyền vào — trang `.astro` cần đọc thêm `cover`/`description`, nếu ép cứng
 * về `BlogEntryLike` thì những field đó biến mất khỏi kiểu trả về.
 */
export function postsByTag<T extends BlogEntryLike>(entries: T[], slug: string): T[] {
  return entries
    .filter((e) => !e.data.draft && e.data.tags.some((t) => tagSlug(t) === slug))
    .sort((a, z) => z.data.date.getTime() - a.data.date.getTime());
}

/**
 * Bài liên quan tới `current`: ưu tiên bài trùng nhiều thẻ nhất, hoà thì bài
 * mới hơn thắng. Nếu không đủ bài trùng thẻ thì bù bằng bài mới nhất — cuối
 * trang bài viết luôn phải có gì đó để đọc tiếp, không được để khối rỗng.
 */
export function relatedPosts<T extends BlogEntryLike>(
  entries: T[],
  current: BlogEntryLike,
  limit = 3,
): T[] {
  const currentTags = new Set(current.data.tags.map(tagSlug).filter(Boolean));
  const pool = entries.filter((e) => !e.data.draft && e.id !== current.id);

  const scored = pool
    .map((e) => ({
      entry: e,
      shared: new Set(e.data.tags.map(tagSlug).filter((t) => currentTags.has(t))).size,
    }))
    .sort(
      (a, z) =>
        z.shared - a.shared || z.entry.data.date.getTime() - a.entry.data.date.getTime(),
    );

  return scored.slice(0, limit).map((s) => s.entry);
}
