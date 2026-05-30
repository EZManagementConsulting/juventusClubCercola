import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createRole } from "@/lib/actions/roles";
import { ROLE_LABELS, type AppRole } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleForm } from "./role-form";
import { RoleRowActions } from "./role-row-actions";

export const metadata = { title: "Ruoli — Cercola Admin" };

export default async function RuoliPage() {
  await requireRole(["superadmin"]);
  const supabase = await createClient();

  const [{ data: roles }, { data: permissions }, { data: rolePermissions }] =
    await Promise.all([
      supabase.from("roles").select("id, name, label").order("name"),
      supabase.from("permissions").select("id, name, label").order("name"),
      supabase.from("role_permissions").select("role_id, permission_id"),
    ]);

  const permissionList = permissions ?? [];
  const byRole = new Map<string, string[]>();
  for (const rp of rolePermissions ?? []) {
    const list = byRole.get(rp.role_id) ?? [];
    list.push(rp.permission_id);
    byRole.set(rp.role_id, list);
  }

  return (
    <div>
      <PageHeader
        title="Ruoli"
        description="Definisci i ruoli applicativi e i permessi associati."
      >
        <FormDialog
          title="Nuovo ruolo"
          submitLabel="Crea ruolo"
          action={createRole}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo ruolo
            </Button>
          }
        >
          <RoleForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ruolo</TableHead>
              <TableHead>Nome tecnico</TableHead>
              <TableHead>Permessi</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(roles ?? []).map((role) => {
              const assigned = byRole.get(role.id) ?? [];
              return (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    {ROLE_LABELS[role.name as AppRole] ?? role.label}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {role.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{assigned.length} permessi</Badge>
                  </TableCell>
                  <TableCell>
                    <RoleRowActions
                      role={role}
                      permissions={permissionList}
                      assignedPermissionIds={assigned}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
