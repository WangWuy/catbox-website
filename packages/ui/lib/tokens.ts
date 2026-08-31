/**
 * Đọc design token dạng SỐ từ `packages/tokens/base.css` tại build-time.
 *
 * Vì sao cần: hầu hết token được dùng thẳng trong class Tailwind
 * (`text-(length:--text-meta)`) nên trình duyệt tự đọc. Nhưng vài token phải dùng
 * trong logic JS chạy lúc build — ví dụ `--chars-post-card-excerpt`, số ký tự
 * để `PostCard` cắt mô tả trước khi render. JS không đọc được biến CSS ở
 * build-time (không có DOM), nên nếu không có helper này thì con số buộc phải
 * chép sang một hằng số trong component — thành hai nguồn sự thật, đúng cái
 * lỗi mà quy tắc token của dự án muốn tránh.
 *
 * Chỉ dùng cho token số thuần (không đơn vị). Token có đơn vị (px, ch, rem)
 * vẫn nên dùng thẳng trong class, đừng kéo qua đây.
 */
/**
 * Nạp bằng `?raw` để Vite nhúng thẳng nội dung base.css vào bundle lúc build.
 * KHÔNG đọc bằng `readFileSync` + `import.meta.url`: khi build, file này bị gom
 * vào `dist/.prerender/chunks/` nên đường dẫn tương đối tới `packages/tokens/`
 * không còn đúng và render đổ ENOENT.
 */
import baseCss from "../../tokens/base.css?raw";

/**
 * Trả về giá trị số của một token. Ném lỗi nếu token không tồn tại hoặc không
 * phải số — hỏng lúc build tốt hơn là âm thầm rơi về một giá trị mặc định sai,
 * vì lỗi kiểu đó chỉ lộ ra khi nhìn trang đã render.
 */
export function numericToken(name: string): number {
  const match = baseCss.match(new RegExp(`--${name}\\s*:\\s*([\\d.]+)\\s*;`));
  if (!match) {
    throw new Error(
      `Không tìm thấy token số --${name} trong packages/tokens/base.css`,
    );
  }

  return Number(match[1]);
}
