import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, USER_STATUS_LABELS, type AppRole } from "@/lib/constants";
import { formatSectionCardNumber } from "@/lib/card-number";
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

const CARD_ROLES: AppRole[] = ["tesserato", "operatore_partner"];

type SectionMemberRow = {
  id: string;
  name: string;
  email: string | null;
  card_number: string | null;
  codice_socio: string;
  roles: AppRole[];
  status: "active" | "inactive";
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: section } = await supabase
    .from("club_sections")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return {
    title: section ? `${section.name} — Sezioni — Cercola Admin` : "Sezione — Cercola Admin",
  };
}

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: section } = await supabase
    .from("club_sections")
    .select("id, name, code, next_card_number, status")
    .eq("id", id)
    .maybeSingle();

  if (!section) notFound();

  const { data: profiles } = await supabase
    .from("club_member_profiles")
    .select(
      `
      id,
      codice_socio,
      card_number,
      status,
      users (
        id,
        name,
        surname,
        email,
        user_roles ( roles ( name ) )
      )
    `,
    )
    .eq("section_id", id)
    .order("card_number", { ascending: true, nullsFirst: false });

  const members: SectionMemberRow[] = (profiles ?? [])
    .map((profile) => {
      const user = profile.users as {
        id: string;
        name: string | null;
        surname: string | null;
        email: string | null;
        user_roles: { roles: { name: string } | null }[];
      } | null;

      if (!user) return null;

      const roles = user.user_roles
        .map((ur) => ur.roles?.name)
        .filter((name): name is AppRole =>
          Boolean(name && CARD_ROLES.includes(name as AppRole)),
        );

      return {
        id: user.id,
        name: [user.name, user.surname].filter(Boolean).join(" ") || profile.codice_socio,
        email: user.email,
        card_number: profile.card_number,
        codice_socio: profile.codice_socio,
        roles,
        status: profile.status,
      };
    })
    .filter((row): row is SectionMemberRow => row !== null);

  const nextCard = formatSectionCardNumber(section.code, section.next_card_number);

  return (
    <div>
      <PageHeader
        title={section.name}
        description={`Prefisso ${section.code} · ${members.length} tessere emesse`}
      >
        <Button variant="outline" asChild>
          <Link href="/sezioni">
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna alle sezioni
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prefisso tessera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg font-semibold">{section.code}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prossima tessera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg font-semibold">{nextCard}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge
              status={section.status}
              label={USER_STATUS_LABELS[section.status as "active" | "inactive"]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membri della sezione</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tessera</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nessun membro in questa sezione.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {member.card_number ?? member.codice_socio}
                    </TableCell>
                    <TableCell>
                      {member.roles.length > 0
                        ? member.roles.map((role) => ROLE_LABELS[role]).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={member.status}
                        label={USER_STATUS_LABELS[member.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
