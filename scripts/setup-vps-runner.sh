#!/usr/bin/env bash
# ==============================================================================
# Script cài đặt tự động GitHub Self-Hosted Runner ngay trên VPS (Ubuntu/Debian)
# Cách chạy trên VPS:
#   bash scripts/setup-vps-runner.sh <GITHUB_RUNNER_TOKEN> [REPO_URL]
# Ví dụ:
#   bash scripts/setup-vps-runner.sh A1B2C3D4E5... https://github.com/wangwuy/catbox-website
# ==============================================================================

set -euo pipefail

RUNNER_TOKEN="${1:-}"
REPO_URL="${2:-https://github.com/wangwuy/catbox-website}"
RUNNER_DIR="/opt/actions-runner"
RUNNER_NAME="${3:-catbox-vps-runner}"

if [ -z "$RUNNER_TOKEN" ]; then
  echo "❌ Thiếu GitHub Runner Token!"
  echo ""
  echo "👉 Hướng dẫn lấy Token (chỉ mất 10 giây):"
  echo "   1. Mở trình duyệt vào: ${REPO_URL}/settings/actions/runners/new?arch=x64&os=linux"
  echo "   2. Copy mã token nằm sau cờ --token (ví dụ: A1B2C3D4E5F6...)"
  echo "   3. Chạy lại lệnh:"
  echo "      bash $0 <RUNNER_TOKEN> ${REPO_URL}"
  exit 1
fi

echo "🚀 Bắt đầu cài đặt GitHub Self-Hosted Runner tại ${RUNNER_DIR}..."

# 1. Cài đặt các gói phụ thuộc cần thiết (curl, jq, rsync, git)
if command -v apt-get >/dev/null 2>&1; then
  echo "📦 Kiểm tra và cài đặt các công cụ hệ thống (Debian/Ubuntu)..."
  apt-get update -y -qq
  apt-get install -y -qq curl jq rsync git tar ca-certificates
elif command -v dnf >/dev/null 2>&1; then
  echo "📦 Kiểm tra và cài đặt các công cụ hệ thống (CentOS/RHEL)..."
  dnf install -y -q curl jq rsync git tar ca-certificates
fi

# 2. Tạo thư mục cài đặt Runner
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# 3. Lấy phiên bản mới nhất của GitHub Actions Runner
echo "🔍 Đang kiểm tra phiên bản GitHub Actions Runner mới nhất..."
LATEST_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/^v//')
if [ -z "$LATEST_VERSION" ] || [ "$LATEST_VERSION" = "null" ]; then
  LATEST_VERSION="2.322.0"
fi
TARBALL="actions-runner-linux-x64-${LATEST_VERSION}.tar.gz"

if [ ! -f "$TARBALL" ]; then
  echo "⬇️  Đang tải GitHub Actions Runner v${LATEST_VERSION}..."
  curl -o "$TARBALL" -L "https://github.com/actions/runner/releases/download/v${LATEST_VERSION}/${TARBALL}"
  tar xzf "$TARBALL"
fi

# Cài đặt thư viện phụ thuộc cho .NET Core của Runner (libicu...)
if [ -f "./bin/installdependencies.sh" ]; then
  echo "📦 Đang cài đặt các thư viện phụ thuộc của Runner (libicu)..."
  ./bin/installdependencies.sh
fi

# 4. Cho phép chạy Runner dưới quyền root trên VPS để đồng bộ trực tiếp /opt/catbox & Docker
export RUNNER_ALLOW_RUNASROOT="1"
if ! grep -q "RUNNER_ALLOW_RUNASROOT=1" "$RUNNER_DIR/.env" 2>/dev/null; then
  echo "RUNNER_ALLOW_RUNASROOT=1" >> "$RUNNER_DIR/.env"
fi

# 5. Nếu dịch vụ cũ đang chạy thì gỡ trước khi cấu hình lại
if [ -f "./svc.sh" ] && [ -f ".runner" ]; then
  echo "🔄 Phát hiện cấu hình runner cũ, đang dừng service để cập nhật..."
  ./svc.sh stop || true
  ./svc.sh uninstall || true
fi

# 6. Đăng ký Runner với GitHub Repository
echo "🔗 Đang đăng ký Runner '${RUNNER_NAME}' với ${REPO_URL}..."
./config.sh \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "self-hosted,Linux,X64,vps" \
  --work "_work" \
  --unattended \
  --replace

# 7. Cài đặt và khởi động dưới dạng Systemd Service (tự chạy lại khi reboot VPS)
echo "⚙️  Đang cài đặt Systemd Service để Runner luôn chạy ngầm 24/7..."
./svc.sh install root
./svc.sh start

echo ""
echo "✅ HOÀN TẤT! GitHub Self-Hosted Runner đã hoạt động trên VPS."
echo "📊 Kiểm tra trạng thái Runner tại: ${REPO_URL}/settings/actions/runners"
./svc.sh status

