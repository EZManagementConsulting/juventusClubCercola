import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createSocio } from "@/lib/actions/soci";
import { USER_STATUS_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SocioForm } from "./socio-form";
import { SocioRowActions } from "./socio-row-actions";

export const metadata = { title: "Soci — Cercola Admin" };

export default async function SociPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("socio_profiles")
    .select(
      "id, user_id, codice_socio, card_number, membership_start, membership_expiry, status, users(name, surname, email, phone)",
    )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`codice_socio.ilike.%${q}%,card_number.ilike.%${q}%`);
  }

  const { data: soci } = await query;

  return (
    <div>
      <PageHeader
        title="Soci"
        description="Anagrafica dei soci del club, tessere e codici identificativi."
      >
        <FormDialog
          title="Nuovo socio"
          description="Crea il socio con account, tessera e codice identificativo."
          submitLabel="Crea socio"
          action={createSocio}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo socio
            </Button>
          }
        >
          <SocioForm mode="create" />
        </FormDialog>
      </PageHeader>

      <div className="mb-4">
        <SearchBar placeholder="Cerca per codice o tessera..." />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Socio</TableHead>
              <TableHead>Codice</TableHead>
              <TableHead>Tessera</TableHead>
              <TableHead>Scadenza</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(soci ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nessun socio trovato.
                </TableCell>
              </TableRow>
            ) : (
              (soci ?? []).map((socio) => {
                const user = socio.users as {
                  name: string | null;
                  surname: string | null;
                  email: string | null;
                  phone: string | null;
                } | null;
                return (
                  <TableRow key={socio.id}>
                    <TableCell>
                      <div className="font-medium">
                        {[user?.name, user?.surname].filter(Boolean).join(" ") || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user?.email ?? ""}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {socio.codice_socio}
                    </TableCell>
                    <TableCell>{socio.card_number ?? "—"}</TableCell>
                    <TableCell>{socio.membership_expiry ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={socio.status}
                        label={USER_STATUS_LABELS[socio.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <SocioRowActions
                        socio={{
                          id: socio.id,
                          user_id: socio.user_id,
                          name: user?.name ?? null,
                          surname: user?.surname ?? null,
                          phone: user?.phone ?? null,
                          codice_socio: socio.codice_socio,
                          card_number: socio.card_number,
                          membership_start: socio.membership_start,
                          membership_expiry: socio.membership_expiry,
                          status: socio.status,
                        }}
                      />
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
