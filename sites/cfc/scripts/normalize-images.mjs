import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(__dirname, "..");
const assetsDir = path.join(siteDir, "src/assets");
const contentDir = path.join(siteDir, "src/content");

function getFiles(dir, matchExt) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, matchExt));
    } else if (matchExt(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const jfifFiles = getFiles(assetsDir, (name) => /\.jfif$/i.test(name));

if (jfifFiles.length > 0) {
  console.log(`[normalize-images] Phát hiện ${jfifFiles.length} file .jfif — đang chuẩn hoá sang .jpg...`);
  const replacements = [];

  for (const oldPath of jfifFiles) {
    const newPath = oldPath.replace(/\.jfif$/i, ".jpg");
    fs.renameSync(oldPath, newPath);
    const relOld = path.relative(assetsDir, oldPath).replace(/\\/g, "/");
    const relNew = path.relative(assetsDir, newPath).replace(/\\/g, "/");
    replacements.push({ old: relOld, new: relNew });
    console.log(`  ✓ Đã đổi: ${relOld} → ${relNew}`);
  }

  const contentFiles = getFiles(contentDir, (name) => /\.(mdx|md|json)$/i.test(name));
  for (const cPath of contentFiles) {
    let content = fs.readFileSync(cPath, "utf8");
    let changed = false;
    for (const { old, new: repNew } of replacements) {
      if (content.includes(old)) {
        content = content.replaceAll(old, repNew);
        changed = true;
      }
    }
    // Also normalize any remaining .jfif mentions in paths
    if (/\.jfif/i.test(content)) {
      content = content.replace(/\.jfif/gi, ".jpg");
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(cPath, content, "utf8");
      console.log(`  ✓ Cập nhật content: ${path.relative(siteDir, cPath)}`);
    }
  }
  console.log("[normalize-images] Chuẩn hoá ảnh hoàn tất.");
}

// ---------------------------------------------------------------------------
// Chuẩn hoá đường dẫn ảnh theo convention của Keystatic:
//   <collection>/<slug>/<field>.<ext>
// Nếu đường dẫn lệch (vd. `products/hop-dung-thuc-an.png` trong categories),
// Keystatic khi Save sẽ cố xoá file theo đường dẫn nó tự suy ra → GitHub trả lỗi
// "A path was requested for deletion which does not exist".
// ---------------------------------------------------------------------------
const SLUG_COLLECTIONS = ["categories", "products"];
const IMAGE_FIELDS = ["image", "ogImage"];

const allContent = getFiles(contentDir, (name) => /\.(mdx|md|json|ya?ml)$/i.test(name));
const countRefs = (rel) =>
  allContent.reduce((n, f) => n + (fs.readFileSync(f, "utf8").includes(rel) ? 1 : 0), 0);

let fixed = 0;
for (const collection of SLUG_COLLECTIONS) {
  const dir = path.join(contentDir, collection);
  for (const file of getFiles(dir, (n) => /\.mdx?$/i.test(n))) {
    const slug = path.basename(file).replace(/\.mdx?$/i, "");
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    for (const field of IMAGE_FIELDS) {
      const re = new RegExp(`^(${field}:\\s*)(["']?)([^"'\\n]+)\\2\\s*$`, "m");
      const m = content.match(re);
      if (!m) continue;
      const current = m[3].trim();
      const ext = path.extname(current);
      const expected = `${collection}/${slug}/${field}${ext}`;
      if (!ext || current === expected) continue;

      const src = path.join(assetsDir, current);
      const dest = path.join(assetsDir, expected);
      if (!fs.existsSync(src)) {
        console.warn(`  ⚠ ${collection}/${slug}: không tìm thấy ảnh ${current}`);
        continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      // Nếu ảnh gốc còn được entry khác dùng thì copy, ngược lại thì move.
      if (countRefs(current) > 1) fs.copyFileSync(src, dest);
      else fs.renameSync(src, dest);

      content = content.replace(re, `$1${expected}`);
      changed = true;
      fixed++;
      console.log(`  ✓ ${collection}/${slug}.${field}: ${current} → ${expected}`);
    }
    if (changed) fs.writeFileSync(file, content, "utf8");
  }
}
if (fixed) console.log(`[normalize-images] Đã chuẩn hoá ${fixed} đường dẫn ảnh theo slug.`);
