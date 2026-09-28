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
