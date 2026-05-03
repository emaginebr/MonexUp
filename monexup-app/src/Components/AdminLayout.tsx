import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout — shell for the `/admin/**` routes that own a sidebar.
 *
 * The dark `HomeHeader` is injected by `LayoutAdmin` in `App.tsx` and
 * sits ABOVE this component, so this layout only owns the row beneath
 * the header: the sticky `<AdminSidebar />` rail + the page outlet.
 *
 * The sidebar is sticky-positioned at the bottom edge of the header
 * (`top: h-16 lg:h-20`), self-collapses to a 64px icon rail under `lg`,
 * and persists its open/closed state in localStorage. We deliberately
 * dropped the legacy floating "burger" button — the chevron toggle
 * inside the sidebar header is the single control surface now.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex items-stretch min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] bg-mnx-neutral-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
