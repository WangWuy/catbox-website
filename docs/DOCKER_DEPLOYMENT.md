# Hướng dẫn Deploy dự án Catbox Ecosystem bằng Docker

Hệ thống Docker được thiết kế theo kiến trúc **Multi-stage build** tối ưu riêng cho Astro Monorepo:
- **Build Stage**: Sử dụng `node:22-bookworm-slim` + `pnpm 10` để đóng gói độc lập từng site (`cfc`, `catbox`, `tetta`), tự động sinh placeholder và index Pagefind search.
- **Production Static Runner (Mặc định)**: Sử dụng `nginx:alpine` siêu nhẹ (~25MB), RAM tiêu thụ < 15MB/site, bật sẵn gzip, cache 1 năm cho assets `/_astro/*`, hỗ trợ clean URLs và trang 404 chuẩn SEO.
- **Production SSR / Admin Runner**: Hỗ trợ chạy Keystatic CMS Admin cục bộ hoặc trên máy chủ qua Node.js standalone adapter.

---

## 🚀 1. Khởi động nhanh (Quick Start)

### Cách 1: Chạy tất cả 3 site qua Docker Compose (Khuyên dùng)

```bash
# 1. Tạo file môi trường từ file mẫu (nếu cần đổi cổng)
cp .env.example .env

# 2. Build và khởi chạy tất cả các container chạy ngầm
docker compose up -d --build
# Hoặc dùng script pnpm:
pnpm docker:up
```

Sau khi khởi chạy:
- **CFC (Bao bì thực phẩm & túi giấy):** `http://localhost:8080`
- **Catbox (Dark Luxury Studio):** `http://localhost:8081`
- **Tetta (Hộp quà tặng cao cấp):** `http://localhost:8082`

---

### Cách 2: Chỉ chạy một site duy nhất (Ví dụ: CFC)

#### Qua Docker Compose:
```bash
docker compose up -d --build cfc
```

#### Hoặc qua Docker CLI thuần:
```bash
# Build image cho CFC
docker build --build-arg SITE=cfc -t cfc-site:latest .

# Chạy container trên cổng 80 hoặc 8080
docker run -d --name cfc-production -p 8080:80 --restart unless-stopped cfc-site:latest
```

*(Tương tự, thay `SITE=catbox` hoặc `SITE=tetta` nếu muốn build các site còn lại).*

---

### Cách 3: Chạy thêm Keystatic CMS Admin (SSR Mode)

Nếu bạn muốn chạy giao diện quản trị Keystatic CMS trên server:

```bash
docker compose --profile admin up -d --build cfc-admin
```
Truy cập admin tại: `http://localhost:4321/keystatic`

---

## 🛠 2. Quản lý container

```bash
# Xem trạng thái các container và health check
docker compose ps

# Xem log thời gian thực
docker compose logs -f cfc
# Hoặc xem log tất cả:
pnpm docker:logs

# Dừng toàn bộ container
docker compose down
# Hoặc:
pnpm docker:down

# Kiểm tra endpoint health check trực tiếp
curl -I http://localhost:8080/healthz
```

---

## 🌐 3. Cấu hình Domain & HTTPS trên VPS (Reverse Proxy)

Khi đưa lên VPS (Ubuntu / Debian), bạn có các lựa chọn cấu hình domain như sau:

### Lựa chọn A: Caddy Server (Đơn giản nhất, tự động SSL)
Tạo file `Caddyfile`:
```caddy
cfc.vn {
    reverse_proxy localhost:8080
}

catbox.vn {
    reverse_proxy localhost:8081
}

tetta.vn {
    reverse_proxy localhost:8082
}
```
Khởi động Caddy: `caddy run` (Caddy sẽ tự động đăng ký SSL Let's Encrypt).

---

### Lựa chọn B: Nginx trên máy chủ Host (Định tuyến chung 1 domain cho cả Site & /keystatic)
Cấu hình Virtual Host cho Nginx ngoài VPS:
- Toàn bộ trang web tĩnh trỏ vào container `cfc` (cổng `8080`).
- Route `/keystatic` và `/api/keystatic` trỏ vào container `cfc-admin` (cổng `4321`).
- Route `/_astro/` ưu tiên lấy từ container tĩnh, nếu không thấy (ví dụ JS/CSS của Keystatic) sẽ tự động fallback sang container admin:

```nginx
upstream cfc_static {
    server 127.0.0.1:8080;
}

upstream cfc_admin {
    server 127.0.0.1:4321;
}

server {
    listen 80;
    server_name baobicfc.vn www.baobicfc.vn;

    # Cho phép upload ảnh sản phẩm qua Keystatic CMS
    client_max_body_size 50M;

    # 1. Định tuyến riêng cho Keystatic Admin SSR
    location ~ ^/(keystatic|api/keystatic) {
        proxy_pass http://cfc_admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Xử lý bundle assets: Thử site tĩnh trước, nếu 404 (assets của admin) thì fallback sang admin
    location /_astro/ {
        proxy_pass http://cfc_static;
        proxy_intercept_errors on;
        error_page 404 = @astro_admin_fallback;
        proxy_set_header Host $host;
    }

    location @astro_admin_fallback {
        proxy_pass http://cfc_admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Tất cả các trang công khai còn lại phục vụ từ container tĩnh
    location / {
        proxy_pass http://cfc_static;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Dùng Certbot lấy chứng chỉ SSL miễn phí:
```bash
sudo certbot --nginx -d baobicfc.vn -d www.baobicfc.vn
```

---

### Lựa chọn C: Cloudflare Tunnel (Bảo mật nhất, không cần mở port)
Nếu domain quản lý trên Cloudflare:
1. Cài đặt `cloudflared` trên VPS.
2. Tạo Tunnel trỏ:
   - `cfc.vn` -> `http://localhost:8080`
   - `catbox.vn` -> `http://localhost:8081`
   - `tetta.vn` -> `http://localhost:8082`
3. Không cần mở bất kỳ port 80/443 nào trên Firewall VPS.

---

## 🤖 4. Tự động hóa CI/CD qua GitHub Self-Hosted Runner (Miễn phí, Không giới hạn phút)

Dự án đã tích hợp sẵn workflow tại [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) và [`.github/workflows/normalize-cfc-images.yml`](file:///.github/workflows/normalize-cfc-images.yml) sử dụng **`runs-on: self-hosted`** chạy trực tiếp trên VPS:
- **0 phút GitHub Actions Cloud**: Hoàn toàn miễn phí, không bao giờ bị giới hạn 2,000 phút/tháng của GitHub Free.
- **Không tốn dung lượng GHCR & không cần SSH vòng**: Runner nằm ngay trên VPS, tự kiểm tra `git diff` xem site nào thay đổi (`cfc`, `catbox`, `tetta`, hay `shared`), build trực tiếp bằng Docker BuildKit cache sẵn trên ổ NVMe của VPS và khởi động lại đúng container vừa sửa.
- **Tương thích 100% với Keystatic Cloud**: Khi biên tập viên bấm **Save** trên Keystatic CMS, commit mới đẩy vào nhánh `main` sẽ tự động kích hoạt Self-Hosted Runner trên VPS để chuẩn hoá đường dẫn ảnh và cập nhật web sau ~15–30 giây.

### Cách cài đặt Self-Hosted Runner trên VPS (Chỉ làm 1 lần):

1. Truy cập GitHub Repository → **Settings** → **Actions** → **Runners** → **New self-hosted runner** (chọn **Linux** / **x64**).
   - Hoặc vào thẳng: `https://github.com/wangwuy/catbox-website/settings/actions/runners/new?arch=x64&os=linux`
2. Copy mã **Token** nằm sau cờ `--token` (ví dụ: `A1B2C3D4E5...`).
3. SSH vào VPS và chạy script cài đặt tự động:
   ```bash
   ssh root@160.187.147.126
   cd /opt/catbox
   git pull origin main
   bash scripts/setup-vps-runner.sh <MÃ_TOKEN_CỦA_BẠN>
   ```
4. Script sẽ tự động tải Runner, đăng ký với GitHub và cài đặt thành `systemd` service chạy ngầm 24/7 (tự khởi động lại khi reboot VPS).



