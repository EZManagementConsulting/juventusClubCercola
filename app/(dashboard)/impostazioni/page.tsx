import Link from "next/link";
import { requireRole, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, type AppRole } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Impostazioni — Cercola Admin" };

export default async function ImpostazioniPage() {
  const role = await requireRole(["superadmin"]);
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{ count: rolesCount }, { count: permsCount }] = await Promise.all([
    supabase.from("roles").select("*", { count: "exact", head: true }),
    supabase.from("permissions").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <PageHeader
        title="Impostazioni"
        description="Configurazione generale della piattaforma."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account corrente</CardTitle>
            <CardDescription>Dati del tuo profilo amministrativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Nome" value={[user?.name, user?.surname].filter(Boolean).join(" ") || "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Ruolo" value={ROLE_LABELS[(role as AppRole)]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ruoli e permessi</CardTitle>
            <CardDescription>Configurazione dei controlli di accesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Row label="Ruoli definiti" value={String(rolesCount ?? 0)} />
            <Row label="Permessi definiti" value={String(permsCount ?? 0)} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/ruoli">Gestisci ruoli</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/permessi">Gestisci permessi</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informazioni applicazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Applicazione" value="Cercola Admin — Club Juventus" />
            <Row label="Backend" value="Supabase (Postgres + Auth + RLS)" />
            <Row label="Ambiente" value={process.env.NODE_ENV} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
