import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createOperatorePartner } from "@/lib/actions/operatori-partner";
import { USER_STATUS_LABELS } from "@/lib/constants";
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
import { MemberForm } from "./member-form";
import { MemberRowActions } from "./member-row-actions";

export const metadata = { title: "Operatori partner — Cercola Admin" };

type MemberRowData = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
  profile_id: string | null;
  section_id: string | null;
  section_name: string | null;
  codice_socio: string | null;
  card_number: string | null;
  membership_start: string | null;
  membership_expiry: string | null;
  profile_status: "active" | "inactive" | null;
  also_tesserato: boolean;
};

export default async function MembriPage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const [{ data: membroRole }, { data: sections }] = await Promise.all([
    supabase.from("roles").select("id").eq("name", "operatore_partner").maybeSingle(),
    supabase
      .from("club_sections")
      .select("id, name, code")
      .eq("status", "active")
      .order("name"),
  ]);

  const sectionOptions = sections ?? [];

  let members: MemberRowData[] = [];

  if (membroRole) {
    const { data: rows } = await supabase
      .from("user_roles")
      .select(
        `
        user_id,
        users (
          id,
          name,
          surname,
          email,
          phone,
          status,
          club_member_profiles (
            id,
            section_id,
            codice_socio,
            card_number,
            membership_start,
            membership_expiry,
            status,
            club_sections ( name )
          ),
          user_roles (
            roles ( name )
          )
        )
      `,
      )
      .eq("role_id", membroRole.id);

    members = (rows ?? [])
      .map((row) => {
        const user = row.users as {
          id: string;
          name: string | null;
          surname: string | null;
          email: string | null;
          phone: string | null;
          status: "active" | "inactive";
          club_member_profiles: {
            id: string;
            section_id: string;
            codice_socio: string;
            card_number: string | null;
            membership_start: string | null;
            membership_expiry: string | null;
            status: "active" | "inactive";
            club_sections: { name: string } | null;
          } | null;
          user_roles: { roles: { name: string } | null }[];
        } | null;

        if (!user) return null;

        const profile = user.club_member_profiles;
        const roleNames = user.user_roles
          .map((ur) => ur.roles?.name)
          .filter(Boolean) as string[];

        return {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: user.phone,
          status: user.status,
          profile_id: profile?.id ?? null,
          section_id: profile?.section_id ?? null,
          section_name: profile?.club_sections?.name ?? null,
          codice_socio: profile?.codice_socio ?? null,
          card_number: profile?.card_number ?? null,
          membership_start: profile?.membership_start ?? null,
          membership_expiry: profile?.membership_expiry ?? null,
          profile_status: profile?.status ?? null,
          also_tesserato: roleNames.includes("tesserato"),
        };
      })
      .filter((m): m is MemberRowData => m !== null);
  }

  return (
    <div>
      <PageHeader
        title="Operatori partner"
        description="Personale presso le attività partner: scannerizza tessere e valida gli sconti."
      >
        <FormDialog
          title="Nuovo operatore partner"
          description="Il numero tessera viene generato automaticamente in base alla sezione."
          submitLabel="Crea operatore"
          action={createOperatorePartner}
          trigger={
            <Button disabled={sectionOptions.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Nuovo operatore
            </Button>
          }
        >
          <MemberForm mode="create" sections={sectionOptions} />
        </FormDialog>
      </PageHeader>

      {sectionOptions.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Crea almeno una sezione attiva prima di aggiungere operatori partner.
        </p>
      ) : null}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Sezione</TableHead>
              <TableHead>Tessera</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nessun operatore partner presente.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">
                      {[member.name, member.surname].filter(Boolean).join(" ") || "—"}
                    </div>
                    {member.also_tesserato ? (
                      <div className="text-xs text-muted-foreground">Anche tesserato</div>
                    ) : null}
                  </TableCell>
                  <TableCell>{member.section_name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{member.card_number ?? "—"}</TableCell>
                  <TableCell>{member.email ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={member.status}
                      label={USER_STATUS_LABELS[member.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <MemberRowActions member={member} sections={sectionOptions} />
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
