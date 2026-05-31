import Link from "next/link";
import { getMissingSupabasePublicEnvVars } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Configurazione — Cercola Admin" };

export default function ConfigurazionePage() {
  const missing = getMissingSupabasePublicEnvVars();

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading">
            Configurazione incompleta
          </CardTitle>
          <CardDescription>
            L&apos;app non può connettersi a Supabase finché mancano le variabili
            d&apos;ambiente in produzione.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {missing.length > 0 ? (
            <>
              <p>Variabili mancanti o vuote:</p>
              <ul className="list-inside list-disc space-y-1 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                {missing.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground">
              Le variabili pubbliche risultano presenti. Se vedi ancora errori,
              verifica anche <code className="text-xs">SUPABASE_SECRET_KEY</code>{" "}
              e rifai un deploy completo su Vercel.
            </p>
          )}

          <div className="space-y-2 rounded-md border px-3 py-2">
            <p className="font-medium">Checklist Vercel</p>
            <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
              <li>Root Directory: <strong>frontend</strong></li>
              <li>Environment: <strong>Production</strong></li>
              <li>Dopo ogni modifica env: <strong>Redeploy</strong></li>
              <li>
                Nomi esatti (non <code className="text-xs">ANON_KEY</code>):{" "}
                <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code className="text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>,{" "}
                <code className="text-xs">SUPABASE_SECRET_KEY</code>
              </li>
            </ol>
          </div>

          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Torna al login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
