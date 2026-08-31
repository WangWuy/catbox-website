# Quy tắc dự án

## Cấm hardcode giá trị thiết kế — không có ngoại lệ

Mọi giá trị lặp lại về **kích thước, khoảng cách, màu sắc, radius, font-size,
z-index...** PHẢI khai báo thành design token trong `packages/tokens/`
(`base.css` cho DNA chung 3 site, `catbox.css` / `tetta.css` / `cfc.css` cho
giá trị riêng theo brand) — không được viết thẳng arbitrary value trong
component (`.astro`, `.tsx`...), dù chỉ dùng một lần.

Cấm, không có ngoại lệ:
- `size-[22px]`, `w-[520px]`, `text-[12.5px]`, `rounded-[4px]`, `gap-[1.2px]`...
- Hex màu viết thẳng trong class hoặc style (`bg-[#E67E22]`, `style="color: #333"`)
- Số px/rem lặp lại ở nhiều component mà không có token đứng sau

**Việc cần làm khi cần một giá trị mới:**
1. Kiểm tra `packages/tokens/base.css` và file theme brand liên quan xem đã có
   token phù hợp chưa.
2. Nếu chưa có, thêm token mới vào đúng file (`base.css` nếu dùng chung 3 site,
   file theme brand nếu riêng), đặt tên **theo vai trò** chứ không theo con số
   — ví dụ `--text-meta` (không phải `--text-13px`), `--size-icon-chip`
   (không phải `--size-22px`). Kèm comment ngắn giải thích token dùng ở đâu.
3. Dùng token đó trong component qua cú pháp Tailwind v4:
   `size-(--size-icon-chip)`, `text-(length:--text-meta)`, `bg-(--color-primary)`...
   — lưu ý tiền tố `length:` ở `text-`, xem mục ngay dưới.

**Lý do:** đây là lỗi đã xảy ra lặp lại nhiều lần trong dự án (xem comment
trong `packages/tokens/base.css` về `text-[12.5px]` và `rounded-[4px]` từng
rải rác khắp component trước khi được gom thành token) — hardcode khiến không
thể đổi một chỗ là đổi toàn hệ, và dễ gây lệch giá trị giữa các component
tưởng chừng giống nhau (ví dụ 2 khung icon 26px/22px lệch nhau do không dùng
chung token).

Áp dụng cho **mọi** thay đổi, kể cả chỉnh nhỏ ("giảm kích thước tí", "đổi màu
tí") — không hardcode rồi tính sau, thêm token ngay từ đầu.

## `text-(...)` với token cỡ chữ PHẢI có tiền tố `length:`

Trong Tailwind v4, `text-` nhận cả **màu chữ** lẫn **cỡ chữ**. Khi truyền một
CSS variable, Tailwind không đoán được ý định nên mặc định hiểu là **màu**:

```
text-(--text-meta)            → color: var(--text-meta)      ❌ SAI
text-(length:--text-meta)     → font-size: var(--text-meta)  ✅ ĐÚNG
```

Đây là lỗi **âm thầm**, nguy hiểm hơn lỗi build: class vẫn hợp lệ, Tailwind vẫn
sinh CSS, không có cảnh báo nào. Nhưng `color: 0.5rem` là giá trị vô nghĩa nên
trình duyệt bỏ qua, chữ giữ nguyên cỡ kế thừa. Hậu quả: **sửa token không có
tác dụng gì** — đổi số trong `base.css`, chạy lại dev server, giao diện vẫn y
nguyên, rất dễ tưởng nhầm là do cache và đi tìm sai chỗ (đã xảy ra với
`--text-date-badge-month` ở `DateBadge.astro`).

**Quy tắc chung — utility nào nhận nhiều kiểu dữ liệu thì phải khai kiểu:**

| Utility | Khi truyền token cỡ/độ dày | Khi truyền token màu |
| --- | --- | --- |
| `text-` | `text-(length:--text-meta)` | `text-(--color-primary)` |
| `border-` | `border-(length:--width-rule)` | `border-(--color-line)` |
| `shadow-`, `ring-`, `outline-`, `decoration-` | `(length:--...)` | `(--color-...)` |

Utility chỉ nhận **một** kiểu thì KHÔNG cần tiền tố, thêm vào là thừa:
`size-`, `w-`, `h-`, `max-w-`, `gap-`, `p*-`, `m*-`, `top-`, `left-`, `scale-`...

**Cách tự kiểm sau khi sửa token cỡ chữ** — đừng tin mắt nhìn, soi CSS thật:

```bash
# Dev server (đổi port nếu khác) hoặc file trong sites/<site>/dist/_astro/*.css
curl -s http://localhost:4321/src/styles/theme.css | grep -o "font-size:var(--text-TÊN-TOKEN)"
```

Ra kết quả `font-size:` là đúng; ra `color:` hoặc không ra gì là còn thiếu
`length:`. Quét toàn dự án tìm chỗ sót:

```bash
grep -rn "text-(--" packages/ui packages/config sites/*/src | grep -v "color"
```

## Cấu trúc `packages/ui/`

Xem README.md mục 4 (TECH STACK) — 4 tầng `primitives/` → `patterns/` →
`shared/` → `brand/`, quy tắc đặt file theo việc component có import
`@config/brands` hay không.

## Ưu tiên tái dùng component có sẵn — không tự viết mới nếu chưa xin phép

Trước khi viết bất kỳ component/element UI mới nào (nút, card, badge, form
field, layout block...), PHẢI kiểm tra `packages/ui/primitives/`,
`packages/ui/patterns/`, `packages/ui/shared/`, `packages/ui/brand/` xem đã
có component tương đương hay chưa (tên khác nhưng chức năng/hình dạng tương
tự cũng tính).

- Nếu đã có → dùng lại hoặc mở rộng props của component đó, không viết bản
  mới song song.
- Nếu chưa có và cần tạo mới → phải hỏi và được người dùng xác nhận trước,
  không tự ý tạo component mới rồi mới báo lại.
- Việc sửa nhỏ một component có sẵn (thêm prop, thêm biến thể qua `class`)
  không tính là "viết mới" và không cần xin phép riêng.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**This project has a knowledge graph. Start with the code-review-graph
MCP tools to narrow scope, then read the source.** The graph is cheaper than scanning files and
gives you structural context (callers, dependents, test coverage) that file search cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

### Verify in the source

- Narrow scope with the graph, then read the source. Do not change code from graph output alone.
- For any non-trivial change, read the implementation and the relevant tests before concluding.
- Verify the exact source when touching behavior, database logic, migrations, retries, fallbacks,
  recovery, or compatibility code.
- When the graph and the source disagree, the source wins. The graph may be stale or may not
  model that relationship.
- An empty graph result can mean "not indexed" or "not statically visible", not "does not exist".

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
<!-- /code-review-graph MCP tools -->
