/**
 * Cây danh mục dựng từ collection `categories` — nguồn sự thật duy nhất cho
 * CategoryNav, breadcrumb và trang `/danh-muc/<slug>`.
 *
 * Vì sao tách khỏi `nav.ts`: trước đây menu CFC hardcode trong `NAV.cfc`, nên
 * khách thêm danh mục qua Keystatic thì trang có tồn tại nhưng không lên menu,
 * phải sửa code + deploy lại. Sitemap CFC (design/cfc/branding/sitemap.png) ghi
 * rõ "Sau này CFC có thể tự thêm các đầu mục sản phẩm" → menu buộc phải đọc từ
 * content.
 *
 * File này KHÔNG import `astro:content` (chỉ nhận dữ liệu đã lấy sẵn) để dùng
 * được cả trong component `.astro` lẫn test/script thuần Node.
 */

/** Hình dạng tối thiểu của một entry `categories` mà các hàm dưới đây cần. */
export interface CategoryEntryLike {
  id: string;
  data: {
    title: string;
    sub?: string;
    icon?: string;
    parent?: string;
    hideFromNav: boolean;
    draft: boolean;
    order: number;
  };
}

/** Hình dạng tối thiểu của một entry `products` mà mega menu cần. */
export interface ProductEntryLike {
  id: string;
  data: {
    title: string;
    category: string;
    draft: boolean;
    order: number;
  };
}

/** Một nút trong cây danh mục, kèm sẵn `href` để render thẳng ra link. */
export interface CategoryNode {
  slug: string;
  label: string;
  sub?: string;
  icon?: string;
  href: string;
  children: CategoryNode[];
}

/** Một mục con hoặc sản phẩm trong cột của Mega Menu */
export interface MegaMenuItem {
  label: string;
  href: string;
  isProduct?: boolean;
}

/** Một cột (Danh mục con) trong panel của Mega Menu */
export interface MegaMenuSubcategory {
  slug: string;
  label: string;
  href: string;
  icon?: string;
  items: MegaMenuItem[];
}

/** Một Danh mục cha trong sidebar của Mega Menu */
export interface MegaMenuParent {
  slug: string;
  label: string;
  href: string;
  icon?: string;
  subcategories: MegaMenuSubcategory[];
}

export const normalizeSlug = (id: string): string =>
  id
    .replace(/\.(md|mdx)$/, "")
    .replace(/^\/+|\/+$/g, "")
    .trim();

/**
 * Số sản phẩm mỗi trang ở lưới catalog (/products, /danh-muc/<slug>).
 *
 * Là hằng số TS chứ không phải token CSS: cả template lẫn script phân trang đều
 * cần đọc con số này, mà JS không lấy được giá trị `@theme` một cách tự nhiên.
 * 12 chia hết cho cả lưới 2, 3 và 4 cột nên hàng cuối không bao giờ bị hụt.
 */
export const PRODUCTS_PER_PAGE = 12;

export const categoryHref = (slug: string) => `/danh-muc/${normalizeSlug(slug)}`;
export const productHref = (slug: string) => `/products/${normalizeSlug(slug)}`;

const byOrder = (a: CategoryEntryLike, z: CategoryEntryLike) =>
  a.data.order - z.data.order || a.data.title.localeCompare(z.data.title, "vi");

/**
 * Dựng cây từ danh sách phẳng. Danh mục có `parent` trỏ tới slug không tồn tại
 * (hoặc tới chính nó / tạo vòng lặp) được nâng lên làm gốc thay vì biến mất —
 * khách gõ nhầm trong CMS không được phép làm rụng cả nhánh khỏi menu.
 */
export function buildCategoryTree(entries: CategoryEntryLike[]): CategoryNode[] {
  const live = entries.filter((c) => !c.data.draft).sort(byOrder);
  const bySlug = new Map(live.map((c) => [normalizeSlug(c.id), c]));

  const toNode = (c: CategoryEntryLike): CategoryNode => {
    const slug = normalizeSlug(c.id);
    return {
      slug,
      label: c.data.title,
      sub: c.data.sub,
      icon: c.data.icon,
      href: categoryHref(slug),
      children: [],
    };
  };

  const nodes = new Map(live.map((c) => [normalizeSlug(c.id), toNode(c)]));
  const roots: CategoryNode[] = [];

  for (const c of live) {
    const slug = normalizeSlug(c.id);
    const node = nodes.get(slug)!;
    const rawParent = c.data.parent;
    const parentSlug = rawParent ? normalizeSlug(rawParent) : undefined;
    
    // `hasAncestor` chặn vòng lặp A→B→A; không có nó `getStaticPaths` sẽ treo.
    const parent =
      parentSlug && parentSlug !== slug && !hasAncestor(bySlug, parentSlug, slug)
        ? nodes.get(parentSlug)
        : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return roots;
}

/** `start` có `target` nằm đâu đó trên đường lên gốc không? */
function hasAncestor(
  bySlug: Map<string, CategoryEntryLike>,
  start: string,
  target: string,
): boolean {
  const seen = new Set<string>();
  let cur: string | undefined = normalizeSlug(start);
  const normTarget = normalizeSlug(target);
  while (cur && !seen.has(cur)) {
    if (cur === normTarget) return true;
    seen.add(cur);
    // Chú kiểu tường minh: không có nó, TS suy `parentRaw` từ `bySlug.get(cur)`
    // trong khi `cur` lại được gán từ chính `parentRaw` ở dòng dưới → vòng suy
    // luận, và TS bỏ cuộc với TS7022 ("implicitly has type 'any' because it is
    // referenced directly or indirectly in its own initializer").
    const parentRaw: string | undefined = bySlug.get(cur)?.data.parent;
    cur = parentRaw ? normalizeSlug(parentRaw) : undefined;
  }
  return false;
}

/** Cây đã lọc bỏ mục `hideFromNav` — dùng riêng cho CategoryNav. */
export function navCategoryTree(entries: CategoryEntryLike[]): CategoryNode[] {
  const prune = (nodes: CategoryNode[], hidden: Set<string>): CategoryNode[] =>
    nodes
      .filter((n) => !hidden.has(n.slug))
      .map((n) => ({ ...n, children: prune(n.children, hidden) }));

  const hidden = new Set(entries.filter((c) => c.data.hideFromNav).map((c) => normalizeSlug(c.id)));
  return prune(buildCategoryTree(entries), hidden);
}

/** Slug → tên hiển thị. Trả về chính slug nếu danh mục đã bị xoá khỏi CMS. */
export function categoryTitle(entries: CategoryEntryLike[], slug: string): string {
  const target = normalizeSlug(slug);
  return entries.find((c) => normalizeSlug(c.id) === target)?.data.title ?? slug;
}

/**
 * Đường từ gốc xuống `slug` (gồm cả chính nó) — dùng cho breadcrumb nhiều tầng.
 * Rỗng nếu slug không tồn tại.
 */
export function categoryTrail(
  entries: CategoryEntryLike[],
  slug: string,
): CategoryNode[] {
  const bySlug = new Map(entries.map((c) => [normalizeSlug(c.id), c]));
  const trail: CategoryEntryLike[] = [];
  const seen = new Set<string>();
  let cur: string | undefined = normalizeSlug(slug);
  while (cur && !seen.has(cur)) {
    const entry = bySlug.get(cur);
    if (!entry) break;
    trail.unshift(entry);
    seen.add(cur);
    // Chú kiểu tường minh vì cùng lý do như trong `hasAncestor` — xem chú thích
    // ở đó. Chỗ này TS hiện suy được (nhờ `if (!entry) break` ở trên), nhưng
    // vòng lặp cùng hình dạng nên rất dễ tái phát TS7022 khi sửa lại.
    const parentRaw: string | undefined = entry.data.parent;
    cur = parentRaw ? normalizeSlug(parentRaw) : undefined;
  }
  return trail.map((c) => {
    const s = normalizeSlug(c.id);
    return {
      slug: s,
      label: c.data.title,
      sub: c.data.sub,
      icon: c.data.icon,
      href: categoryHref(s),
      children: [],
    };
  });
}

/**
 * Mọi slug hậu duệ của `slug`, gồm cả chính nó — trang danh mục cha phải gom
 * sản phẩm của tất cả danh mục con (sitemap: "Túi giấy thực phẩm" hiện cả sản
 * phẩm gắn vào "Bao bánh mì que").
 */
export function descendantSlugs(entries: CategoryEntryLike[], slug: string): string[] {
  const target = normalizeSlug(slug);
  const out = new Set<string>([target]);
  const walk = (nodes: CategoryNode[]) => {
    for (const n of nodes) {
      out.add(n.slug);
      walk(n.children);
    }
  };
  const find = (nodes: CategoryNode[]): CategoryNode | undefined => {
    for (const n of nodes) {
      if (n.slug === target) return n;
      const hit = find(n.children);
      if (hit) return hit;
    }
  };
  const node = find(buildCategoryTree(entries));
  if (node) walk(node.children);
  return [...out];
}

/**
 * Xây dựng cây Mega Menu 3 cấp hoàn chỉnh theo chuẩn E-commerce:
 * Cấp 1: Danh mục cha (Parent) — Cột trái sidebar
 * Cấp 2: Danh mục con (Subcategory Header) — Tiêu đề từng cột ở khung phải
 * Cấp 3: Sản phẩm & Phân loại chi tiết (Items list) — Các dòng link dưới từng cột
 */
export function buildMegaMenuTree(
  categories: CategoryEntryLike[],
  products: ProductEntryLike[] = [],
): MegaMenuParent[] {
  const rootNodes = navCategoryTree(categories);
  const visibleProducts = products.filter((p) => !p.data.draft);

  // Gom sản phẩm theo category slug
  const productsByCategory = new Map<string, ProductEntryLike[]>();
  for (const p of visibleProducts) {
    const cat = normalizeSlug(p.data.category);
    const list = productsByCategory.get(cat) || [];
    list.push(p);
    productsByCategory.set(cat, list);
  }
  for (const [_, list] of productsByCategory) {
    list.sort((a, z) => a.data.order - z.data.order || a.data.title.localeCompare(z.data.title, "vi"));
  }

  return rootNodes.map((root) => {
    const subcategories: MegaMenuSubcategory[] = [];

    if (root.children.length > 0) {
      for (const child of root.children) {
        const items: MegaMenuItem[] = [];
        const seenLabels = new Set<string>();

        // 1. Nếu child có danh mục cháu cấp 3 (ví dụ bao bánh mì que, tam giác, kẹp)
        for (const subChild of child.children) {
          if (!seenLabels.has(subChild.label.toLowerCase())) {
            items.push({
              label: subChild.label,
              href: subChild.href,
              isProduct: false,
            });
            seenLabels.add(subChild.label.toLowerCase());
          }
        }

        // 2. Lấy sản phẩm gắn trực tiếp vào child này
        const directProducts = productsByCategory.get(child.slug) || [];
        for (const p of directProducts) {
          if (!seenLabels.has(p.data.title.toLowerCase())) {
            items.push({
              label: p.data.title,
              href: productHref(p.id),
              isProduct: true,
            });
            seenLabels.add(p.data.title.toLowerCase());
          }
        }

        // 3. Lấy sản phẩm gắn vào các cháu cấp 3 của child
        for (const subChild of child.children) {
          const subChildProducts = productsByCategory.get(subChild.slug) || [];
          for (const p of subChildProducts) {
            if (!seenLabels.has(p.data.title.toLowerCase())) {
              items.push({
                label: p.data.title,
                href: productHref(p.id),
                isProduct: true,
              });
              seenLabels.add(p.data.title.toLowerCase());
            }
          }
        }

        subcategories.push({
          slug: child.slug,
          label: child.label,
          href: child.href,
          icon: child.icon,
          items,
        });
      }
    }

    // 4. Nếu có sản phẩm gắn trực tiếp vào root mà chưa vào subcategory nào
    const rootDirectProducts = productsByCategory.get(root.slug) || [];
    if (rootDirectProducts.length > 0) {
      const items: MegaMenuItem[] = rootDirectProducts.map((p) => ({
        label: p.data.title,
        href: productHref(p.id),
        isProduct: true,
      }));
      subcategories.push({
        slug: `${root.slug}-noi-bat`,
        label: `Sản phẩm ${root.label.toLowerCase()}`,
        href: root.href,
        items,
      });
    }

    return {
      slug: root.slug,
      label: root.label,
      href: root.href,
      icon: root.icon,
      subcategories,
    };
  });
}


