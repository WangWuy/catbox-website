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

<!-- commit-safety rules -->
## Commit Safety Rules

**Tuyệt đối KHÔNG xóa file khi commit trừ khi được người dùng yêu cầu rõ ràng.**

### Quy tắc bắt buộc trước mỗi commit

1. **Kiểm tra file bị xóa**: Chạy `git diff --cached --name-only --diff-filter=D` trước khi commit.
   - Nếu có file bị xóa mà không phải mục tiêu của task → **DỪNG LẠI**, báo cho người dùng.
2. **Không dùng `git add .` bừa bãi**: Luôn dùng `git add <file>` cụ thể hoặc `git add -p` để kiểm soát từng thay đổi.
3. **Mỗi commit chỉ làm một việc**: Không gộp nhiều thay đổi không liên quan vào cùng một commit.
4. **Xem lại trước khi commit**: Chạy `git diff --cached --stat` để xác nhận đúng file, đúng số dòng thêm/xóa.

### Bài học từ sự cố thực tế

- Commit `c3729e8` đã **xóa nhầm `CfcHeader.astro` (440 dòng)** khi tinh chỉnh hero banner — do `git add .` cuốn theo file không liên quan.
- File được khôi phục từ git history bằng: `git show <commit>:<path> > <path>`
- Pre-commit hook tại `.git/hooks/pre-commit` sẽ **cảnh báo và yêu cầu xác nhận** khi commit xóa bất kỳ file nào.
<!-- /commit-safety rules -->
