# Keystatic CMS — vận hành (site CFC)

Tài liệu này gồm 2 phần: phần **cho dev** (dựng và deploy admin) và phần **cho
người sửa nội dung** (thao tác hằng ngày).

Kiến trúc theo "Cách B" — admin chạy như một Cloudflare Worker riêng, khách vào
bằng URL, không cần cài gì trên máy. Xem lý do chọn trong
`plans/01-keystatic-cms-integration.md` Task 0.4.

```
cfc.vn                    admin.cfc.vn
Cloudflare Pages          Cloudflare Worker
output: static            output: server
KHÔNG có /keystatic       CÓ /keystatic         ──commit──> GitHub repo
                                                              │
                                                              └─> Pages tự build lại
```

Hai thứ này build từ **cùng một codebase** nhưng bằng **hai lệnh khác nhau**, và
deploy độc lập. Site công khai vẫn tĩnh 100% như trước khi có CMS.

---

## Phần 1 — Cho dev

### 1.0 Hai điều dễ hiểu nhầm về đường dẫn và ảnh

Ghi lại vì cả hai đều là lỗi ÂM THẦM — build vẫn xanh, chỉ dữ liệu đi sai chỗ.

1. **Mọi `path` trong `keystatic.config.ts` tính từ GỐC REPO**, không phải từ
   `sites/cfc/`. Keystatic ghi thẳng vào cây file của repo GitHub và không biết
   site nằm ở thư mục con. Viết `src/content/products/*` là commit vào
   `/src/content/products/` ở gốc repo — nơi không trang nào đọc.
2. **Mọi `fields.image` phải có `publicPath`**, nếu không frontmatter chỉ nhận
   mỗi tên file và `resolveImage()` không tìm ra ảnh. Dùng helper `asset()`
   trong `packages/config/keystatic-fields.ts`, đừng tự viết `directory` rời.

Nếu xoá một file content ở máy dev mà build báo lỗi `Rolldown failed to resolve
import ... content-layer-deferred-module`, đó là cache content của Astro chưa
mất theo:

```bash
rm -rf sites/cfc/.astro sites/cfc/node_modules/.astro
```

Cloudflare Pages build từ đầu nên không dính lỗi này.

### 1.1 Điều kiện tiên quyết (CHƯA LÀM — đang chặn)

> ⚠️ **Việc đang chặn toàn bộ:** `sites/cfc/keystatic.config.ts` còn ghi
> `project: "TODO/cfc"`. Phải tạo team trên Keystatic Cloud rồi điền slug thật
> (dạng `tenTeam/tenProject`), nếu không admin UI mở lên sẽ không đăng nhập được.

1. Đăng ký tại <https://keystatic.cloud> (LƯU Ý: domain riêng `keystatic.cloud`, KHÔNG phải `keystatic.com/cloud` — đường dẫn đó 404). Tạo team bằng email chủ dự án.
2. Kết nối team với GitHub repo này.
3. Copy project slug, điền vào `sites/cfc/keystatic.config.ts` → `cloud.project`.
4. Mời tài khoản của khách vào team (Free tier: tối đa 3 user).

### 1.2 Chạy admin ở máy dev

```bash
pnpm --filter @catbox/site-cfc dev:admin   # http://localhost:4321/keystatic
```

Dùng adapter Node cho nhanh. Không cần Cloudflare gì cả.

### 1.3 Deploy admin lên Cloudflare Worker

Lần đầu — tạo KV namespace cho session:

```bash
pnpm --filter @catbox/site-cfc exec wrangler kv namespace create SESSION
```

Điền `id` wrangler in ra vào `sites/cfc/wrangler.toml` (phần `[[kv_namespaces]]`
đang comment sẵn), rồi bỏ comment.

Deploy (lặp lại mỗi lần đổi code admin):

```bash
pnpm --filter @catbox/site-cfc deploy:admin
```

Sau đó trong Cloudflare dashboard, trỏ subdomain (ví dụ `admin.cfc.vn`) vào
Worker `cfc-keystatic-admin`.

### 1.4 ⚠️ BẮT BUỘC — chặn truy cập admin

Worker này **mặc định ai có URL cũng vào được**. Keystatic Cloud có kiểm soát
quyền ghi, nhưng đừng để trang admin phơi ra Internet công khai.

Trong Cloudflare dashboard → **Zero Trust → Access → Applications**:

1. Add an application → Self-hosted.
2. Domain: `admin.cfc.vn`.
3. Policy: Allow, theo **Emails** — liệt kê đúng email của khách và của dev.

Cloudflare Access free tier tới 50 user, đủ dùng. Sau bước này, vào
`admin.cfc.vn` sẽ phải xác thực email trước khi thấy trang.

### 1.5 Deploy site công khai (không đổi)

```bash
pnpm --filter @catbox/site-cfc build     # ra dist/ tĩnh, KHÔNG có /keystatic
```

Cloudflare Pages giữ nguyên cấu hình cũ. Không set `KEYSTATIC_ADMIN` ở đây.

### 1.6 Vì sao cần cả hai

| | Site công khai | Admin |
|---|---|---|
| Lệnh | `pnpm build` | `pnpm deploy:admin` |
| Biến môi trường | (không) | `KEYSTATIC_ADMIN=cloudflare` |
| Output | `static` | `server` + adapter Cloudflare |
| Hạ tầng | Cloudflare Pages | Cloudflare Worker |
| Ai truy cập | Mọi người | Chỉ email trong Access policy |

Tách đôi để site công khai không phải trả giá (cold start, adapter, phụ thuộc)
cho một tính năng chỉ vài người dùng.

---

## Phần 2 — Cho người sửa nội dung

### 2.1 Đăng nhập

Vào `admin.cfc.vn` → xác thực email → vào Keystatic.

### 2.2 Cấu trúc nội dung

Menu bên trái chia thành 6 nhóm:

| Nhóm | Gồm | Dùng để |
| --- | --- | --- |
| **Nội dung trang** | Trang chủ · Trang giới thiệu · Trang năng lực sản xuất · Trang sản phẩm · Trang quy trình · Trang liên hệ · Trang tin tức · Trang chính sách · Trang 404 · Tóm tắt cho AI | Sửa chữ, ảnh và các danh sách trên từng trang cố định |
| **Sản phẩm** | Đầu mục sản phẩm · Sản phẩm | Cây danh mục 3 tầng và từng sản phẩm |
| **Chính sách** | Chính sách | Các trang điều khoản, tự hiện ở chân trang |
| **Tin tức** | Bài viết | Blog |
| **Trang tự tạo** | Trang | Tự thêm trang mới (Khuyến mãi, Tuyển dụng...) |
| **Cài đặt** | Cài đặt CFC | Hotline, Zalo, email, địa chỉ, giờ làm việc, danh sách sale, mạng xã hội, chứng nhận, số liệu năng lực, menu, chân trang |

Nhóm **Thương hiệu khác** (Cài đặt Catbox / Tetta) là của hai site anh em, người
phụ trách CFC không cần đụng tới.

> **Sửa một chỗ, đổi mọi nơi.** Hotline trong **Cài đặt** chảy ra thanh trên
> cùng, chân trang, trang liên hệ, nút gọi ở trang sản phẩm và cả file tóm tắt
> cho AI. Địa chỉ cũng vậy. Đừng đi tìm để sửa từng trang — không có chỗ nào
> khác để sửa nữa.

### 2.2b Tự thêm một trang mới

**Trang** → **+ New** → điền tên, nội dung, rồi Save. Trang lên ở địa chỉ theo
tên (đặt tên "Khuyến mãi hè" thì trang nằm ở `/khuyen-mai-he`).

- Tick **Hiện ở chân trang** để trang xuất hiện trong cột link dưới cùng.
- **Tránh đặt trùng tên với trang có sẵn** (contact, products, blog, about-us,
  quy-trinh, chinh-sach, search). Trùng thì trang mới sẽ không lên site — trang
  cũ vẫn giữ đường dẫn đó.

Cây đầu mục hiện tại (khớp sitemap):

```
TÚI GIẤY THỰC PHẨM
├── Túi bánh mì / Bao bánh mì
│   ├── Bao bánh mì que
│   ├── Bao bánh mì kẹp
│   └── Bao bánh mì tam giác
├── Túi đựng xúc xích – lạp xưởng
└── Túi đựng bánh bao
GIẤY GÓI THỰC PHẨM
├── Giấy lót
├── Giấy gói hamburger
└── Giấy lót bánh bao
HỘP ĐỰNG THỨC ĂN GIẤY
├── Hộp đựng salad
├── Hộp đựng xôi
└── Khay đồ chiên
CỐC GIẤY & ỐNG HÚT
├── Cốc 1 lớp
├── Cốc 2 lớp
└── Ống hút giấy
```

### 2.3 Thêm một đầu mục sản phẩm mới

1. **Đầu mục sản phẩm** → **+ New**.
2. Điền:
   - **Tên danh mục** — tên hiển thị.
   - **Danh mục cha** — để trống nếu muốn nó thành mục lớn **hiện trên thanh
     menu**; chọn một mục nếu muốn nó nằm bên trong mục đó.
   - **Icon trên menu** — chỉ có tác dụng với mục lớn (không có cha).
   - **Thứ tự** — số nhỏ đứng trước.
   - **SEO — Mô tả** — 1–2 câu, đây là dòng Google hiển thị.
3. **Save**.

Menu, trang danh mục và sitemap.xml **tự cập nhật** — không cần báo dev.

### 2.4 Thêm sản phẩm

**Sản phẩm** → **+ New**. Trường **Danh mục** là dropdown chọn từ các đầu mục có
sẵn — nên tạo đầu mục trước.

Gắn sản phẩm vào mục **cụ thể nhất**. Ví dụ bao bánh mì que thì chọn
"Bao bánh mì que", không chọn "TÚI GIẤY THỰC PHẨM" — sản phẩm vẫn tự hiện ở cả
trang mục cha, nhưng đường dẫn (breadcrumb) sẽ đúng hơn và tốt cho SEO.

### 2.5 Sau khi Save

Keystatic commit lên GitHub → Cloudflare Pages tự build lại. Nội dung mới lên
site sau **1–2 phút**. Không thấy đổi ngay là bình thường, chờ rồi tải lại.

### 2.6 Vài lưu ý

- **Nháp** — tick vào thì ẩn khỏi site, dùng khi soạn dở.
- **Ẩn khỏi menu** — trang vẫn vào được bằng link, chỉ không hiện trên menu.
- **Xoá đầu mục đang có sản phẩm**: sản phẩm không mất, nhưng sẽ rơi khỏi trang
  danh mục. Nên gán lại sản phẩm sang mục khác trước khi xoá.
- **Ảnh** — Free tier commit thẳng ảnh vào Git. Ảnh quá nặng làm repo phình;
  nén trước khi upload, hoặc bàn với dev nâng lên Pro để dùng Cloud Images.
