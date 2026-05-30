import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createDiscount } from "@/lib/actions/sconti";
import {
  DISCOUNT_STATUS_LABELS,
  DISCOUNT_TYPE_LABELS,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DiscountType } from "@/lib/database.types";
import { DiscountForm } from "./discount-form";
import { DiscountRowActions } from "./discount-row-actions";

export const metadata = { title: "Sconti — Cercola Admin" };

function formatValue(type: DiscountType, value: number | null) {
  if (value === null) return "—";
  if (type === "percentage") return `${value}%`;
  if (type === "fixed_amount") return `${value.toFixed(2)} €`;
  return String(value);
}

export default async function ScontiPage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const { data: discounts } = await supabase
    .from("discounts")
    .select(
      "id, title, description, type, value, start_date, expiry_date, usage_limit, status, socio_discounts(count)",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Sconti"
        description="Crea sconti personalizzati e assegnali ai soci del club."
      >
        <FormDialog
          title="Nuovo sconto"
          description="Definisci titolo, tipologia, valore e validita."
          submitLabel="Crea sconto"
          action={createDiscount}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo sconto
            </Button>
          }
        >
          <DiscountForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valore</TableHead>
              <TableHead>Scadenza</TableHead>
              <TableHead>Soci</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(discounts ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nessuno sconto creato.
                </TableCell>
              </TableRow>
            ) : (
              (discounts ?? []).map((discount) => {
                const assignedCount =
                  (discount.socio_discounts as { count: number }[] | null)?.[0]
                    ?.count ?? 0;
                return (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.title}</TableCell>
                    <TableCell>{DISCOUNT_TYPE_LABELS[discount.type]}</TableCell>
                    <TableCell>{formatValue(discount.type, discount.value)}</TableCell>
                    <TableCell>{discount.expiry_date ?? "—"}</TableCell>
                    <TableCell>{assignedCount}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={discount.status}
                        label={DISCOUNT_STATUS_LABELS[discount.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Assegna ai soci"
                          asChild
                        >
                          <Link href={`/sconti/${discount.id}`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DiscountRowActions
                          discount={{
                            id: discount.id,
                            title: discount.title,
                            description: discount.description,
                            type: discount.type,
                            value: discount.value,
                            start_date: discount.start_date,
                            expiry_date: discount.expiry_date,
                            usage_limit: discount.usage_limit,
                            status: discount.status,
                          }}
                        />
                      </div>
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
