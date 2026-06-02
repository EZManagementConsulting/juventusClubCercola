import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createUser } from "@/lib/actions/users";
import { ROLE_LABELS, USER_STATUS_LABELS, type AppRole } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import { UserForm, type RoleOption } from "./user-form";
import { UserRowActions } from "./user-row-actions";

export const metadata = { title: "Utenti — Cercola Admin" };

export default async function UtentiPage() {
  await requireRole(["superadmin"]);
  const supabase = await createClient();

  const [{ data: users }, { data: roles }] = await Promise.all([
    supabase
      .from("users")
      .select(
        `
        id,
        name,
        surname,
        email,
        phone,
        status,
        role_id,
        roles ( name, label ),
        user_roles ( role_id, roles ( name, label ) )
      `,
      )
      .order("created_at", { ascending: false }),
    supabase.from("roles").select("id, name, label").order("name"),
  ]);

  const roleOptions: RoleOption[] = roles ?? [];

  return (
    <div>
      <PageHeader
        title="Utenti"
        description="Gestione completa di tutti gli utenti della piattaforma."
      >
        <FormDialog
          title="Nuovo utente"
          description="Crea un nuovo account con ruolo e credenziali."
          submitLabel="Crea utente"
          action={createUser}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo utente
            </Button>
          }
        >
          <UserForm mode="create" roles={roleOptions} />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Ruoli</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nessun utente presente.
                </TableCell>
              </TableRow>
            ) : (
              (users ?? []).map((user) => {
                const userRoles = user.user_roles as {
                  role_id: string;
                  roles: { name: string; label: string } | null;
                }[];
                const roleLabels = userRoles
                  .map((ur) => ur.roles?.name)
                  .filter(Boolean)
                  .map((name) => ROLE_LABELS[name as AppRole] ?? name)
                  .join(", ");

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {[user.name, user.surname].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>{user.email ?? "—"}</TableCell>
                    <TableCell>{user.phone ?? "—"}</TableCell>
                    <TableCell>{roleLabels || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={user.status}
                        label={USER_STATUS_LABELS[user.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <UserRowActions
                        user={{
                          id: user.id,
                          name: user.name,
                          surname: user.surname,
                          phone: user.phone,
                          role_id: user.role_id,
                          role_ids: userRoles.map((ur) => ur.role_id),
                          status: user.status,
                        }}
                        roles={roleOptions}
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
