import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/filter-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Storico sconti — Cercola Admin" };

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ discount?: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { discount } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("discount_usages")
    .select(
      "id, used_at, note, discount_id, discounts(title), socio_profiles(codice_socio, users(name, surname)), users(name, surname)",
    )
    .order("used_at", { ascending: false })
    .limit(200);

  if (discount) query = query.eq("discount_id", discount);

  const [{ data: usages }, { data: discounts }] = await Promise.all([
    query,
    supabase.from("discounts").select("id, title").order("title"),
  ]);

  return (
    <div>
      <PageHeader
        title="Storico sconti"
        description="Registro di tutti gli utilizzi degli sconti (audit)."
      />

      <div className="mb-4">
        <FilterSelect
          param="discount"
          placeholder="Tutti gli sconti"
          options={(discounts ?? []).map((d) => ({ value: d.id, label: d.title }))}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e ora</TableHead>
              <TableHead>Sconto</TableHead>
              <TableHead>Socio</TableHead>
              <TableHead>Usato da (membro)</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(usages ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nessun utilizzo registrato.
                </TableCell>
              </TableRow>
            ) : (
              (usages ?? []).map((usage) => {
                const discountRel = usage.discounts;
                const discountInfo = Array.isArray(discountRel) ? discountRel[0] : discountRel;
                const socioRel = usage.socio_profiles;
                const socio = Array.isArray(socioRel) ? socioRel[0] : socioRel;
                const userRel = socio?.users;
                const socioUser = Array.isArray(userRel) ? userRel[0] : userRel;
                const memberRel = usage.users;
                const member = Array.isArray(memberRel) ? memberRel[0] : memberRel;
                return (
                  <TableRow key={usage.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(usage.used_at)}
                    </TableCell>
                    <TableCell>{discountInfo?.title ?? "—"}</TableCell>
                    <TableCell>
                      {[socioUser?.name, socioUser?.surname]
                        .filter(Boolean)
                        .join(" ") ||
                        socio?.codice_socio ||
                        "—"}
                    </TableCell>
                    <TableCell>
                      {[member?.name, member?.surname].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {usage.note ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
