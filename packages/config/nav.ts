import type { BrandId, FnbBrandId } from "./brands";
import { BRANDS } from "./brands";
import {
  buildMegaMenuTree,
  type CategoryEntryLike,
  type MegaMenuParent,
  type ProductEntryLike,
} from "./categories";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: { label: string; href: string }[];
}

/** Nhóm link phẳng cho site chưa CMS-hoá danh mục (dựng từ `NavItem.children`) */
export interface FallbackGroup {
  heading?: { label: string; href: string; icon?: string };
  items: { label: string; href: string }[];
}

/**
 * Một mục trên thanh nav sau khi đã trộn hai nguồn: cây danh mục từ content
 * (CFC) hoặc `NAV[brand]` tĩnh (Tetta/Catbox).
 *
 * Đặt ở đây thay vì khai trong component vì cả `CategoryNav` (thanh ngang từ
 * md) lẫn `MobileNav` (drawer dưới md, mở từ nút trên `MainHeader`) đều nhận
 * đúng danh sách này — `BaseLayout` dựng một lần qua `buildNavEntries` rồi
 * truyền xuống, hai component không được dựng menu bằng hai logic khác nhau.
 */
export interface NavEntry {
  label: string;
  href: string;
  icon?: string;
  isMega?: boolean;
  megaParents?: MegaMenuParent[];
  fallbackGroups?: FallbackGroup[];
}

/**
 * CategoryNav theo từng brand — TETTA_CFC_DESIGN_SPEC §2, hàng "Category Navigation".
 * Catbox theo SITEMAP_CATBOX.md (có Industry thay cho danh mục F&B).
 */
export const NAV: Record<BrandId, NavItem[]> = {
  catbox: [
    { label: "Trang chủ", href: "/", icon: "lucide:sparkles" },
    { label: "Về chúng tôi", href: "/about-us", icon: "lucide:factory" },
    {
      label: "Lĩnh vực",
      href: "/industry",
      icon: "lucide:building-2",
      children: [
        { label: "Mỹ phẩm", href: "/industry/my-pham" },
        { label: "Thời trang", href: "/industry/thoi-trang" },
        { label: "Thực phẩm", href: "/industry/thuc-pham" },
        { label: "Điện tử", href: "/industry/dien-tu" },
        { label: "Quà tặng doanh nghiệp", href: "/industry/qua-tang-doanh-nghiep" },
      ],
    },
    { label: "Sản phẩm", href: "/products", icon: "lucide:package" },
    { label: "Dự án", href: "/case-studies", icon: "lucide:trophy" },
    { label: "Chia sẻ", href: "/sharing", icon: "lucide:newspaper" },
    { label: "Liên hệ", href: "/contact", icon: "lucide:phone" },
  ],

  tetta: [
    { label: "Trang chủ", href: "/", icon: "lucide:gift" },
    { label: "Về chúng tôi", href: "/about-us", icon: "lucide:factory" },
    {
      label: "Bộ sưu tập",
      href: "/bo-suu-tap",
      icon: "lucide:gift",
      children: [
        { label: "Hộp quà Tết", href: "/bo-suu-tap/hop-qua-tet" },
        { label: "Hộp rượu vang", href: "/bo-suu-tap/hop-ruou-vang" },
        { label: "Hộp yến sào", href: "/bo-suu-tap/hop-yen-sao" },
        { label: "Quà doanh nghiệp", href: "/bo-suu-tap/qua-doanh-nghiep" },
      ],
    },
    { label: "Sản phẩm", href: "/products", icon: "lucide:package" },
    { label: "Quy cách", href: "/services", icon: "lucide:scroll-text" },
    { label: "Tin tức", href: "/blog", icon: "lucide:newspaper" },
    { label: "Liên hệ", href: "/contact", icon: "lucide:phone" },
  ],

  /**
   * CFC KHÔNG còn dùng danh sách này: menu dựng từ collection `categories`
   * (xem `packages/config/categories.ts` + `Layout.astro` của site cfc), để
   * khách tự thêm đầu mục trong Keystatic là menu tự có — yêu cầu ghi trong
   * sitemap CFC. Giữ lại một mục "Trang chủ" làm fallback phòng khi chưa có
   * danh mục nào trong content (site mới clone, content rỗng).
   */
  cfc: [{ label: "Trang chủ", href: "/", icon: "lucide:croissant" }],
};

/**
 * Link phụ trên Topbar (bên cạnh hotline).
 *
 * Đọc từ "Cài đặt" của từng brand thay vì khai cứng ở đây — khách đổi được
 * nhãn và đích đến mà không cần dev. Giữ nguyên tên và hình dạng export để
 * `TopbarSwitcher` không phải sửa.
 */
export const TOPBAR_LINKS: Record<BrandId, { label: string; href: string }[]> = {
  catbox: BRANDS.catbox.nav.topbarLinks,
  tetta: BRANDS.tetta.nav.topbarLinks,
  cfc: BRANDS.cfc.nav.topbarLinks,
};

/** Dựng nhóm link phẳng từ `NAV[brand]` cho site chưa CMS-hoá danh mục */
const fromNav = (nav: NavItem[]): NavEntry[] =>
  nav.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
    fallbackGroups: item.children?.length ? [{ items: item.children }] : [],
  }));

/**
 * Dựng danh sách mục cho thanh nav của khung F&B — MỘT nguồn sự thật cho cả
 * `CategoryNav` (thanh ngang + mega menu, từ md) lẫn `MobileNav` (drawer, dưới
 * md).
 *
 * Vì sao nằm ở đây chứ không trong `CategoryNav.astro` như trước: từ khi nút
 * hamburger chuyển lên `MainHeader`, hai component ở hai nhánh khác nhau của
 * cây DOM cùng cần đúng danh sách này. Để logic trong một component thì
 * component kia phải dựng lại lần hai — đúng cái bẫy mà chú thích đầu
 * `MobileNav.astro` đã cảnh báo (hai nơi dựng menu bằng hai logic khác nhau
 * rồi lệch nội dung). Giờ `BaseLayout` gọi một lần rồi truyền xuống cả hai.
 *
 * Hàm thuần, không đụng `astro:content` — site tự lấy collection rồi truyền
 * vào, giống `buildMegaMenuTree`.
 */
export function buildNavEntries(
  brand: FnbBrandId,
  categories?: CategoryEntryLike[],
  products: ProductEntryLike[] = [],
): NavEntry[] {
  const entries = BRANDS[brand].nav.entries;

  // Chưa có danh mục trong content (site mới clone), hoặc khách xoá sạch menu
  // trong CMS → quay về `NAV[brand]` để trang không bị mất thanh điều hướng.
  if (!categories || categories.length === 0 || entries.length === 0) {
    return fromNav(NAV[brand]);
  }

  // Nhãn/thứ tự/icon của từng mục đến từ CMS; riêng cây danh mục bên trong mega
  // menu vẫn dựng từ collection `categories` để khách thêm đầu mục là menu tự có.
  return entries.map((e) => ({
    label: e.label,
    href: e.href,
    icon: e.icon,
    ...(e.isMega && {
      isMega: true,
      megaParents: buildMegaMenuTree(categories, products),
    }),
  }));
}
