import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createMember } from "@/lib/actions/membri";
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

export const metadata = { title: "Membri — Cercola Admin" };

export default async function MembriPage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "membro")
    .maybeSingle();

  const { data: members } = role
    ? await supabase
        .from("users")
        .select("id, name, surname, email, phone, status")
        .eq("role_id", role.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <PageHeader
        title="Membri"
        description="Utenti che identificano i soci e applicano gli sconti."
      >
        <FormDialog
          title="Nuovo membro"
          description="Crea un account membro con accesso all'app mobile."
          submitLabel="Crea membro"
          action={createMember}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo membro
            </Button>
          }
        >
          <MemberForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(members ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nessun membro presente.
                </TableCell>
              </TableRow>
            ) : (
              (members ?? []).map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {[member.name, member.surname].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell>{member.email ?? "—"}</TableCell>
                  <TableCell>{member.phone ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={member.status}
                      label={USER_STATUS_LABELS[member.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <MemberRowActions
                      member={{
                        id: member.id,
                        name: member.name,
                        surname: member.surname,
                        phone: member.phone,
                        status: member.status,
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
