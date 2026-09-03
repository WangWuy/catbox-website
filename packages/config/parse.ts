import type { z } from "zod";

/**
 * Đọc một file JSON do Keystatic ghi ra, kiểm tra bằng schema Zod.
 *
 * Vì sao phải kiểm chứ không `import` thẳng rồi dùng: TypeScript tin tưởng
 * hình dạng file JSON tại thời điểm build, nhưng file này khách sửa qua CMS và
 * người khác sửa tay được. Thiếu một field thì `undefined` chảy vào template và
 * render ra chuỗi rỗng — trang vẫn build xanh, chỉ mất chữ. Kiểu lỗi đó rất khó
 * truy khi khách báo "trang tự nhiên trống một khúc", nên thà dừng build và chỉ
 * đúng field sai.
 */
export function parseData<T extends z.ZodTypeAny>(
  label: string,
  schema: T,
  raw: unknown,
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;

  const issues = result.error.issues
    .map((i) => `  - ${i.path.join(".") || "(gốc)"}: ${i.message}`)
    .join("\n");
  throw new Error(`Nội dung "${label}" không hợp lệ:\n${issues}`);
}
