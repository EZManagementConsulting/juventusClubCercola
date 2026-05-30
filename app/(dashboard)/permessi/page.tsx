import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createPermission } from "@/lib/actions/permissions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionForm } from "./permission-form";
import { PermissionRowActions } from "./permission-row-actions";

export const metadata = { title: "Permessi — Cercola Admin" };

export default async function PermessiPage() {
  await requireRole(["superadmin"]);
  const supabase = await createClient();

  const { data: permissions } = await supabase
    .from("permissions")
    .select("id, name, label")
    .order("name");

  return (
    <div>
      <PageHeader
        title="Permessi"
        description="Catalogo dei permessi assegnabili ai ruoli."
      >
        <FormDialog
          title="Nuovo permesso"
          submitLabel="Crea permesso"
          action={createPermission}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo permesso
            </Button>
          }
        >
          <PermissionForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permesso</TableHead>
              <TableHead>Nome tecnico</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(permissions ?? []).map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.label}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {permission.name}
                </TableCell>
                <TableCell>
                  <PermissionRowActions permission={permission} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
