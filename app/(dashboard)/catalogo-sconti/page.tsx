import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createDiscountTemplate } from "@/lib/actions/discount-templates";
import {
  DISCOUNT_TYPE_LABELS,
  TEMPLATE_STATUS_LABELS,
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
import { DiscountTemplateForm } from "./discount-template-form";
import { DiscountTemplateRowActions } from "./discount-template-row-actions";

export const metadata = { title: "Catalogo sconti — Cercola Admin" };

function formatValue(type: DiscountType, value: number | null) {
  if (value === null) return "—";
  if (type === "percentage") return `${value}%`;
  if (type === "fixed_amount") return `${value.toFixed(2)} €`;
  return String(value);
}

export default async function CatalogoScontiPage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("discount_templates")
    .select("id, title, description, type, value, status")
    .order("title");

  return (
    <div>
      <PageHeader
        title="Catalogo sconti"
        description="Tipologie riutilizzabili (es. 10%, 15€) da associare alle offerte dei partner."
      >
        <FormDialog
          title="Nuova tipologia"
          description="Definisci titolo, tipologia e valore dello sconto."
          submitLabel="Crea tipologia"
          action={createDiscountTemplate}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuova tipologia
            </Button>
          }
        >
          <DiscountTemplateForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valore</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(templates ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  Nessuna tipologia nel catalogo.
                </TableCell>
              </TableRow>
            ) : (
              (templates ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      {DISCOUNT_TYPE_LABELS[row.type as DiscountType] ?? row.type}
                    </TableCell>
                    <TableCell>
                      {formatValue(row.type as DiscountType, row.value)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={row.status}
                        label={
                          TEMPLATE_STATUS_LABELS[
                            row.status as keyof typeof TEMPLATE_STATUS_LABELS
                          ] ?? row.status
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <DiscountTemplateRowActions
                        template={{
                          id: row.id,
                          title: row.title,
                          description: row.description,
                          type: row.type as DiscountType,
                          value: row.value,
                          status: row.status,
                        }}
                      />
                    </TableCell>
                  </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
