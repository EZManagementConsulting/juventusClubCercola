import { IdCard, TicketCheck, Tag, UserCog } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Statistiche — Cercola Admin" };

export default async function StatistichePage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const [
    sociTot,
    sociAttivi,
    scontiTot,
    scontiAttivi,
    utilizziTot,
    { data: membroRole },
    { data: usages },
  ] = await Promise.all([
    supabase.from("club_member_profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("club_member_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("discounts").select("*", { count: "exact", head: true }),
    supabase
      .from("discounts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("discount_usages").select("*", { count: "exact", head: true }),
    supabase.from("roles").select("id").eq("name", "operatore_partner").maybeSingle(),
    supabase
      .from("discount_usages")
      .select("discount_id, discounts(title)")
      .limit(1000),
  ]);

  let membriCount = 0;
  if (membroRole) {
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role_id", membroRole.id);
    membriCount = count ?? 0;
  }

  // Aggregazione utilizzi per sconto.
  const byDiscount = new Map<string, { title: string; count: number }>();
  for (const usage of usages ?? []) {
    const title = (usage.discounts as { title: string } | null)?.title ?? "—";
    const entry = byDiscount.get(usage.discount_id) ?? { title, count: 0 };
    entry.count += 1;
    byDiscount.set(usage.discount_id, entry);
  }
  const topDiscounts = [...byDiscount.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const stats = [
    { label: "Soci totali", value: sociTot.count ?? 0, icon: IdCard },
    { label: "Soci attivi", value: sociAttivi.count ?? 0, icon: IdCard },
    { label: "Membri", value: membriCount, icon: UserCog },
    { label: "Sconti attivi", value: scontiAttivi.count ?? 0, icon: Tag },
    { label: "Sconti totali", value: scontiTot.count ?? 0, icon: Tag },
    { label: "Utilizzi totali", value: utilizziTot.count ?? 0, icon: TicketCheck },
  ];

  return (
    <div>
      <PageHeader
        title="Statistiche"
        description="Report e indicatori principali del club."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sconti piu utilizzati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sconto</TableHead>
                <TableHead className="text-right">Utilizzi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDiscounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
                    Nessun dato disponibile.
                  </TableCell>
                </TableRow>
              ) : (
                topDiscounts.map((d) => (
                  <TableRow key={d.title}>
                    <TableCell className="font-medium">{d.title}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
