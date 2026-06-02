import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createSection } from "@/lib/actions/sections";
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
import { formatSectionCardNumber } from "@/lib/card-number";
import { SectionForm } from "./section-form";
import { SectionRowActions } from "./section-row-actions";

export const metadata = { title: "Sezioni — Cercola Admin" };

export default async function SezioniPage() {
  await requireRole(["superadmin", "admin"]);
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("club_sections")
    .select("id, name, code, next_card_number, status")
    .order("name");

  const sectionIds = (sections ?? []).map((s) => s.id);
  const counts = new Map<string, number>();

  if (sectionIds.length > 0) {
    const { data: profiles } = await supabase
      .from("club_member_profiles")
      .select("section_id")
      .in("section_id", sectionIds);

    for (const profile of profiles ?? []) {
      counts.set(profile.section_id, (counts.get(profile.section_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sezioni"
        description="Sezioni del club: ogni sezione ha un prefisso e genera numeri tessera univoci (es. JCC-CR-000001)."
      >
        <FormDialog
          title="Nuova sezione"
          description="Il prefisso tessera non puo essere modificato dopo la creazione."
          submitLabel="Crea sezione"
          action={createSection}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuova sezione
            </Button>
          }
        >
          <SectionForm mode="create" />
        </FormDialog>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sezione</TableHead>
              <TableHead>Prefisso</TableHead>
              <TableHead>Prossima tessera</TableHead>
              <TableHead>Tessere emesse</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(sections ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nessuna sezione configurata.
                </TableCell>
              </TableRow>
            ) : (
              (sections ?? []).map((section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/sezioni/${section.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {section.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{section.code}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatSectionCardNumber(section.code, section.next_card_number)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/sezioni/${section.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {counts.get(section.id) ?? 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={section.status}
                      label={USER_STATUS_LABELS[section.status as "active" | "inactive"]}
                    />
                  </TableCell>
                  <TableCell>
                    <SectionRowActions section={section} />
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
