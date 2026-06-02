import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createPartner } from "@/lib/actions/partners";
import { PARTNER_CATEGORY_LABELS, PARTNER_STATUS_LABELS } from "@/lib/constants";
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
import { PartnerForm } from "./partner-form";
import { PartnerRowActions } from "./partner-row-actions";

export const metadata = { title: "Partner — Cercola Admin" };

export default async function PartnerPage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from("partners")
    .select("id, name, category, phone, address, status, description, website")
    .order("name");

  return (
    <div>
      <PageHeader
        title="Partner"
        description="Attività convenzionate: ristoranti, negozi e servizi del circuito Cercola."
      >
        <FormDialog
          title="Nuovo partner"
          submitLabel="Crea partner"
          action={createPartner}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo partner
            </Button>
          }
        >
          <PartnerForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Contatti</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(partners ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  Nessun partner registrato.
                </TableCell>
              </TableRow>
            ) : (
              (partners ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      {row.category
                        ? (PARTNER_CATEGORY_LABELS[row.category] ?? row.category)
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {[row.phone, row.address].filter(Boolean).join(" · ") || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={row.status}
                        label={
                          PARTNER_STATUS_LABELS[
                            row.status as keyof typeof PARTNER_STATUS_LABELS
                          ] ?? row.status
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <PartnerRowActions partner={row} />
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
