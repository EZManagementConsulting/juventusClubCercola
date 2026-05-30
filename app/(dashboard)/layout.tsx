import Link from "next/link";
import { requireWebAccess, getCurrentUser } from "@/lib/auth";
import { NAV_ITEMS, ROLE_LABELS, type AppRole } from "@/lib/constants";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireWebAccess();
  const user = await getCurrentUser();

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const displayName =
    [user?.name, user?.surname].filter(Boolean).join(" ") ||
    user?.email ||
    "Utente";

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-heading text-lg font-semibold">
            Cercola Admin
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav items={items} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-2 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MobileNav items={items} />
            <span className="font-heading text-base font-semibold md:hidden">
              Cercola Admin
            </span>
          </div>
          <UserMenu
            name={displayName}
            email={user?.email ?? null}
            roleLabel={ROLE_LABELS[(role as AppRole) ?? "admin"]}
          />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
