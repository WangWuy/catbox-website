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

### Lựa chọn B: Nginx trên máy chủ Host
Cấu hình Virtual Host cho Nginx ngoài VPS trỏ vào các container:
```nginx
server {
    listen 80;
    server_name cfc.vn www.cfc.vn;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Dùng Certbot lấy chứng chỉ SSL miễn phí:
```bash
certbot --nginx -d cfc.vn -d www.cfc.vn
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

