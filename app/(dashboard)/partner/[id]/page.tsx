import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { canAccessLegacySconti, getCurrentUser, requireRole } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  DISCOUNT_STATUS_LABELS,
  PARTNER_CATEGORY_LABELS,
  PARTNER_STATUS_LABELS,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DiscountType } from "@/lib/database.types";

export const metadata = { title: "Dettaglio partner — Cercola Admin" };

function formatTemplateValue(type: string, value: number | null) {
  if (value === null) return "—";
  if (type === "percentage") return `${value}%`;
  if (type === "fixed_amount") return `${value.toFixed(2)} €`;
  return String(value);
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const currentUser = await getCurrentUser();
  const showLegacySconti = canAccessLegacySconti(currentUser?.roles ?? []);
  const { id } = await params;
  const supabase = await createClient();

  const { data: partner } = await supabase
    .from("partners")
    .select(
      "id, name, description, category, phone, address, website, status, legacy_discount_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!partner) notFound();

  const { data: offers } = await supabase
    .from("partner_offers")
    .select(
      `
      id,
      title,
      status,
      start_date,
      expiry_date,
      legacy_discount_id,
      discount_templates ( title, type, value )
    `,
    )
    .eq("partner_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/partner">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai partner
          </Link>
        </Button>
      </div>

      <PageHeader title={partner.name} description="Dettaglio attività e offerte collegate.">
        <StatusBadge
          status={partner.status}
          label={
            PARTNER_STATUS_LABELS[partner.status as keyof typeof PARTNER_STATUS_LABELS] ??
            partner.status
          }
        />
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anagrafica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Categoria: </span>
              {partner.category
                ? (PARTNER_CATEGORY_LABELS[partner.category] ?? partner.category)
                : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Telefono: </span>
              {partner.phone ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Indirizzo: </span>
              {partner.address ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Sito: </span>
              {partner.website ? (
                <a
                  href={partner.website}
                  className="text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {partner.website}
                </a>
              ) : (
                "—"
              )}
            </p>
            {partner.description ? (
              <p className="pt-2 text-muted-foreground">{partner.description}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offerte attive</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Validità</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Sconto legacy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(offers ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                  Nessuna offerta per questo partner.
                </TableCell>
              </TableRow>
            ) : (
              (offers ?? []).map((offer) => {
                const tpl = offer.discount_templates;
                const template = Array.isArray(tpl) ? tpl[0] : tpl;
                return (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.title ?? "—"}</TableCell>
                    <TableCell>
                      {template ? (
                        <>
                          {template.title} (
                          {formatTemplateValue(template.type, template.value)})
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[offer.start_date, offer.expiry_date].filter(Boolean).join(" → ") || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={offer.status}
                        label={
                          DISCOUNT_STATUS_LABELS[
                            offer.status as keyof typeof DISCOUNT_STATUS_LABELS
                          ] ?? offer.status
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {offer.legacy_discount_id && showLegacySconti ? (
                        <Button variant="link" size="sm" asChild className="h-auto p-0">
                          <Link href={`${ROUTES.scontiLegacy}/${offer.legacy_discount_id}`}>
                            Sconto MVP
                          </Link>
                        </Button>
                      ) : (
                        "—"
                      )}
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
