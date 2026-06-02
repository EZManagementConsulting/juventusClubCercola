import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createTesserato } from "@/lib/actions/tesserati";
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

export const metadata = { title: "Tesserati — Cercola Admin" };

export default async function SociPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { q } = await searchParams;
  const supabase = await createClient();

  const [{ data: socioRole }, { data: sections }] = await Promise.all([
    supabase.from("roles").select("id").eq("name", "tesserato").maybeSingle(),
    supabase
      .from("club_sections")
      .select("id, name, code")
      .eq("status", "active")
      .order("name"),
  ]);

  const sectionOptions = sections ?? [];

  let soci: Array<{
    id: string;
    user_id: string;
    section_id: string;
    codice_socio: string;
    card_number: string | null;
    membership_start: string | null;
    membership_expiry: string | null;
    status: "active" | "inactive";
    club_sections: { name: string } | null;
    users: {
      name: string | null;
      surname: string | null;
      email: string | null;
      phone: string | null;
      user_roles: { roles: { name: string } | null }[];
    } | null;
  }> = [];

  if (socioRole) {
    const { data: socioUserRows } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role_id", socioRole.id);

    const userIds = (socioUserRows ?? []).map((r) => r.user_id);

    if (userIds.length > 0) {
      let query = supabase
        .from("club_member_profiles")
        .select(
          `
          id,
          user_id,
          section_id,
          codice_socio,
          card_number,
          membership_start,
          membership_expiry,
          status,
          club_sections ( name ),
          users (
            name,
            surname,
            email,
            phone,
            user_roles ( roles ( name ) )
          )
        `,
        )
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      if (q) {
        query = query.or(`codice_socio.ilike.%${q}%,card_number.ilike.%${q}%`);
      }

      const { data } = await query;
      soci = (data ?? []) as typeof soci;
    }
  }

  return (
    <div>
      <PageHeader
        title="Tesserati"
        description="Beneficiari con tessera digitale e sconti assegnati."
      >
        <FormDialog
          title="Nuovo socio"
          description="Il numero tessera viene generato automaticamente in base alla sezione."
          submitLabel="Crea socio"
          action={createTesserato}
          trigger={
            <Button disabled={sectionOptions.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Nuovo socio
            </Button>
          }
        >
          <SocioForm mode="create" sections={sectionOptions} />
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
              <TableHead>Sezione</TableHead>
              <TableHead>Codice</TableHead>
              <TableHead>Tessera</TableHead>
              <TableHead>Scadenza</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {soci.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nessun socio trovato.
                </TableCell>
              </TableRow>
            ) : (
              soci.map((socio) => {
                const user = socio.users;
                const roleNames = (user?.user_roles ?? [])
                  .map((ur) => ur.roles?.name)
                  .filter(Boolean) as string[];

                return (
                  <TableRow key={socio.id}>
                    <TableCell>
                      <div className="font-medium">
                        {[user?.name, user?.surname].filter(Boolean).join(" ") || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user?.email ?? ""}
                      </div>
                      {roleNames.includes("operatore_partner") ? (
                        <div className="text-xs text-muted-foreground">Anche partner</div>
                      ) : null}
                    </TableCell>
                    <TableCell>{socio.club_sections?.name ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {socio.codice_socio}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {socio.card_number ?? "—"}
                    </TableCell>
                    <TableCell>{socio.membership_expiry ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={socio.status}
                        label={USER_STATUS_LABELS[socio.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <SocioRowActions
                        sections={sectionOptions}
                        socio={{
                          id: socio.id,
                          user_id: socio.user_id,
                          section_id: socio.section_id,
                          name: user?.name ?? null,
                          surname: user?.surname ?? null,
                          phone: user?.phone ?? null,
                          codice_socio: socio.codice_socio,
                          card_number: socio.card_number,
                          membership_start: socio.membership_start,
                          membership_expiry: socio.membership_expiry,
                          status: socio.status,
                          also_operatore_partner: roleNames.includes("operatore_partner"),
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
