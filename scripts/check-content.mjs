#!/usr/bin/env node
/**
 * Cảnh báo MDX thiếu ảnh/meta TRƯỚC khi push — §6D TECH_STACK_v2.
 *
 *   pnpm check:content          # cảnh báo, exit 0
 *   pnpm check:content --strict # thiếu ảnh cũng fail (dùng ở Pha 4, khi ảnh đã về)
 *
 * Zod schema đã bắt lỗi field sai kiểu lúc build. Script này bắt thứ Zod không
 * bắt được: field optional bị bỏ trống, description quá dài, slug trùng.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRICT = process.argv.includes("--strict");

const warnings = [];
const errors = [];

/** Parse frontmatter thô — đủ dùng cho việc kiểm tra sự tồn tại của field. */
function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Field ảnh cần kiểm tra theo từng collection */
const IMAGE_FIELD = {
  products: "image",
  categories: "image",
  industry: "image",
  "case-studies": "cover",
  blog: "cover",
};

for (const brand of ["catbox", "tetta", "cfc"]) {
  const contentRoot = join(ROOT, "sites", brand, "src", "content");
  const files = await walk(contentRoot);
  const slugs = new Map();

  for (const file of files) {
    const rel = relative(ROOT, file);
    const raw = await readFile(file, "utf8");
    const fm = frontmatter(raw);

    if (!fm) {
      errors.push(`${rel} — không có frontmatter`);
      continue;
    }

    const collection = relative(contentRoot, file).split("/")[0];

    if (!fm.title) errors.push(`${rel} — thiếu \`title\``);

    // Meta description: thiếu thì Google tự cắt, quá dài thì bị truncate
    const desc = fm.seoDescription || fm.description || fm.summary || fm.excerpt;
    if (!desc) {
      warnings.push(`${rel} — chưa có description/excerpt cho thẻ meta`);
    } else if (desc.length > 165) {
      warnings.push(`${rel} — description ${desc.length} ký tự (>165, sẽ bị cắt trên SERP)`);
    }

    // Ảnh: thiếu là bình thường ở Pha 0–3, chỉ fail khi chạy --strict
    const imgField = IMAGE_FIELD[collection];
    if (imgField && !fm[imgField]) {
      const msg = `${rel} — chưa có \`${imgField}\`, đang dùng placeholder`;
      (STRICT ? errors : warnings).push(msg);
    }

    // Slug trùng trong cùng collection → route đè lên nhau
    const key = `${collection}/${fm.slug || relative(contentRoot, file).replace(/\.mdx?$/, "")}`;
    if (slugs.has(key)) {
      errors.push(`${rel} — slug trùng với ${relative(ROOT, slugs.get(key))}`);
    }
    slugs.set(key, file);
  }
}

for (const w of warnings) console.warn(`⚠️  ${w}`);
for (const e of errors) console.error(`❌ ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} lỗi chặn deploy.`);
  process.exit(1);
}
console.log(
  warnings.length
    ? `\n✓ Không có lỗi chặn. ${warnings.length} cảnh báo (chạy --strict ở Pha 4 để siết ảnh).`
    : "\n✓ Nội dung sạch.",
);
