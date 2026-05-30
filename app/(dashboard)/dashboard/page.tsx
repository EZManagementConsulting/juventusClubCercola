import { IdCard, Tag, TicketCheck, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireWebAccess } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Panoramica — Cercola Admin" };

async function countRows(
  table: "socio_profiles" | "discounts" | "discount_usages",
  filter?: { column: string; value: string },
) {
  const supabase = await createClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count } = await query;
  return count ?? 0;
}

async function countMembers() {
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "membro")
    .maybeSingle();
  if (!role) return 0;
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role_id", role.id);
  return count ?? 0;
}

export default async function DashboardPage() {
  await requireWebAccess();

  const [sociAttivi, scontiAttivi, utilizzi, membri] = await Promise.all([
    countRows("socio_profiles", { column: "status", value: "active" }),
    countRows("discounts", { column: "status", value: "active" }),
    countRows("discount_usages"),
    countMembers(),
  ]);

  const stats = [
    { label: "Soci attivi", value: sociAttivi, icon: IdCard },
    { label: "Membri", value: membri, icon: UserCog },
    { label: "Sconti attivi", value: scontiAttivi, icon: Tag },
    { label: "Sconti utilizzati", value: utilizzi, icon: TicketCheck },
  ];

  return (
    <div>
      <PageHeader
        title="Panoramica"
        description="Riepilogo generale del club Juventus Cercola."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
