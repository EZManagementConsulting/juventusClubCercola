import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireLegacyScontiAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { removeAssignment, removeDiscountOperator } from "@/lib/actions/sconti";
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
import {
  parseTimeRangeConfig,
  parseWeekdaysConfig,
  type DiscountUsageRuleRow,
} from "@/lib/discount-usage-rules";
import { formatBusinessHoursIt } from "@/lib/business-hours";
import { LegacyDeprecationBanner } from "@/components/legacy-deprecation-banner";
import { AssignDialog } from "./assign-dialog";
import { OperatorAssignDialog } from "./operator-assign-dialog";
import { UsageRulesPanel } from "./usage-rules-panel";

export default async function ScontoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireLegacyScontiAccess();
  const { id } = await params;
  const supabase = await createClient();

  const { data: discount } = await supabase
    .from("discounts")
    .select(
      "id, title, description, type, value, status, start_date, expiry_date, usage_limit, phone, address, website, latitude, longitude, business_hours",
    )
    .eq("id", id)
    .maybeSingle();

  if (!discount) notFound();

  const [
    { data: assignments },
    { data: allSoci },
    { data: operators },
    { data: allUsers },
    { data: usageRulesRaw },
  ] = await Promise.all([
    supabase
      .from("member_discount_assignments")
      .select(
        "id, status, assigned_at, member_profile_id, club_member_profiles(codice_socio, users(name, surname))",
      )
      .eq("discount_id", id)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("club_member_profiles")
      .select("id, codice_socio, status, users(name, surname)")
      .eq("status", "active"),
    supabase
      .from("discount_operators")
      .select("id, user_id, users(name, surname, email)")
      .eq("discount_id", id),
    supabase.from("users").select("id, name, surname, email, status").eq("status", "active"),
    supabase
      .from("discount_usage_rules")
      .select("id, discount_id, rule_type, config, active")
      .eq("discount_id", id)
      .eq("active", true)
      .order("rule_type"),
  ]);

  const usageRules: DiscountUsageRuleRow[] = (usageRulesRaw ?? []).map((row) => ({
    id: row.id,
    discount_id: row.discount_id,
    rule_type: row.rule_type as DiscountUsageRuleRow["rule_type"],
    config:
      row.rule_type === "weekdays"
        ? parseWeekdaysConfig(row.config)
        : parseTimeRangeConfig(row.config),
    active: row.active,
  }));

  const assignedIds = new Set((assignments ?? []).map((a) => a.member_profile_id));
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

  const assignedOperatorIds = new Set((operators ?? []).map((o) => o.user_id));
  const availableOperators = (allUsers ?? [])
    .filter((u) => !assignedOperatorIds.has(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      label: [u.name, u.surname].filter(Boolean).join(" ") || u.email || "—",
    }));

  const hoursLabel = formatBusinessHoursIt(discount.business_hours);

  return (
    <div>
      <PageHeader title={discount.title} description="Dettaglio e assegnazione dello sconto.">
        <Button variant="outline" asChild>
          <Link href="/sconti">
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna agli sconti
          </Link>
        </Button>
      </PageHeader>

      <LegacyDeprecationBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
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
                value={
                  discount.usage_limit !== null ? String(discount.usage_limit) : "Illimitato"
                }
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attività / contatti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Info label="Telefono" value={discount.phone ?? "—"} />
              <Info label="Indirizzo" value={discount.address ?? "—"} />
              <Info label="Sito web" value={discount.website ?? "—"} />
              <Info label="Orari" value={hoursLabel ?? "—"} />
              <Info
                label="Posizione"
                value={
                  discount.latitude != null && discount.longitude != null
                    ? `${discount.latitude}, ${discount.longitude}`
                    : "—"
                }
              />
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tesserati assegnati</CardTitle>
            <AssignDialog discountId={discount.id} soci={availableSoci} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tesserato</TableHead>
                  <TableHead>Codice</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(assignments ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Nessun tesserato assegnato.
                    </TableCell>
                  </TableRow>
                ) : (
                  (assignments ?? []).map((assignment) => {
                    const socioRel = assignment.club_member_profiles;
                    const socio = Array.isArray(socioRel) ? socioRel[0] : socioRel;
                    const userRel = socio?.users;
                    const user = Array.isArray(userRel) ? userRel[0] : userRel;
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

      <UsageRulesPanel discountId={discount.id} rules={usageRules} />

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Operatori attività (scanner QR)</CardTitle>
          <OperatorAssignDialog discountId={discount.id} users={availableOperators} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(operators ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    Nessun operatore collegato a questa attività.
                  </TableCell>
                </TableRow>
              ) : (
                (operators ?? []).map((operator) => {
                  const user = operator.users as {
                    name: string | null;
                    surname: string | null;
                    email: string;
                  } | null;
                  return (
                    <TableRow key={operator.id}>
                      <TableCell className="font-medium">
                        {[user?.name, user?.surname].filter(Boolean).join(" ") || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user?.email ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <ActionButton
                            action={removeDiscountOperator}
                            hidden={{ id: operator.id, discount_id: discount.id }}
                            ariaLabel="Rimuovi operatore"
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
