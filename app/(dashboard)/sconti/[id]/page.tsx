import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { removeAssignment } from "@/lib/actions/sconti";
import {
  DISCOUNT_STATUS_LABELS,
  DISCOUNT_TYPE_LABELS,
  SOCIO_DISCOUNT_STATUS_LABELS,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ActionButton } from "@/components/action-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SocioDiscountStatus } from "@/lib/database.types";
import { AssignDialog } from "./assign-dialog";

export default async function ScontoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: discount } = await supabase
    .from("discounts")
    .select("id, title, description, type, value, status, start_date, expiry_date, usage_limit")
    .eq("id", id)
    .maybeSingle();

  if (!discount) notFound();

  const [{ data: assignments }, { data: allSoci }] = await Promise.all([
    supabase
      .from("socio_discounts")
      .select(
        "id, status, assigned_at, socio_id, socio_profiles(codice_socio, users(name, surname))",
      )
      .eq("discount_id", id)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("socio_profiles")
      .select("id, codice_socio, status, users(name, surname)")
      .eq("status", "active"),
  ]);

  const assignedIds = new Set((assignments ?? []).map((a) => a.socio_id));
  const availableSoci = (allSoci ?? [])
    .filter((s) => !assignedIds.has(s.id))
    .map((s) => {
      const user = s.users as { name: string | null; surname: string | null } | null;
      return {
        id: s.id,
        codice: s.codice_socio,
        label:
          [user?.name, user?.surname].filter(Boolean).join(" ") || s.codice_socio,
      };
    });

  return (
    <div>
      <PageHeader title={discount.title} description="Dettaglio e assegnazione dello sconto.">
        <Button variant="outline" asChild>
          <Link href="/sconti">
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna agli sconti
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Informazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Tipologia" value={DISCOUNT_TYPE_LABELS[discount.type]} />
            <Info
              label="Valore"
              value={discount.value !== null ? String(discount.value) : "—"}
            />
            <Info label="Inizio" value={discount.start_date ?? "—"} />
            <Info label="Scadenza" value={discount.expiry_date ?? "—"} />
            <Info
              label="Limite utilizzi"
              value={discount.usage_limit !== null ? String(discount.usage_limit) : "Illimitato"}
            />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stato</span>
              <StatusBadge
                status={discount.status}
                label={DISCOUNT_STATUS_LABELS[discount.status]}
              />
            </div>
            {discount.description ? (
              <p className="border-t pt-3 text-muted-foreground">
                {discount.description}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Soci assegnati</CardTitle>
            <AssignDialog discountId={discount.id} soci={availableSoci} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Socio</TableHead>
                  <TableHead>Codice</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(assignments ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Nessun socio assegnato.
                    </TableCell>
                  </TableRow>
                ) : (
                  (assignments ?? []).map((assignment) => {
                    const socio = assignment.socio_profiles as {
                      codice_socio: string;
                      users: { name: string | null; surname: string | null } | null;
                    } | null;
                    const user = socio?.users;
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {[user?.name, user?.surname].filter(Boolean).join(" ") ||
                            socio?.codice_socio ||
                            "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {socio?.codice_socio ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={assignment.status}
                            label={
                              SOCIO_DISCOUNT_STATUS_LABELS[
                                assignment.status as SocioDiscountStatus
                              ]
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <ActionButton
                              action={removeAssignment}
                              hidden={{ id: assignment.id }}
                              ariaLabel="Rimuovi assegnazione"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </ActionButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
