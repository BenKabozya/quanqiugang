import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/admin/sign-out-button";
import NotificationBell from "@/components/shared/notification-bell";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sections", label: "Page sections" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/quotations", label: "Quotations" },
  { href: "/admin/shipments", label: "Shipments" },
  { href: "/admin/inbox", label: "Chat inbox" },
  { href: "/admin/settings", label: "Site settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-bg">
      <aside className="w-full md:w-60 shrink-0 bg-panel border-r border-line flex flex-row md:flex-col md:h-screen md:sticky md:top-0">
        <div className="p-4 md:p-6 border-b-0 md:border-b border-line shrink-0">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-field border border-line flex items-center justify-center">
        <span className="text-teal font-bold text-sm">QG</span>
      </div>
      <div>
        <p className="text-white text-sm font-semibold">Quanqiugang</p>
        <p className="text-white/40 text-[11px]">Admin panel</p>
      </div>
    </div>
    <NotificationBell dark />
  </div>
</div>

        <nav className="flex-1 flex md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-3 gap-1 md:gap-0 md:space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 md:shrink block px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-field transition whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

<div className="hidden md:block p-4 border-t border-line mt-auto">
          <p className="text-white/40 text-xs mb-1">Signed in as</p>
          <p className="text-white text-sm font-medium truncate">
            {session.user?.name}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}