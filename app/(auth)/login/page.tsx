import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "Questo account non ha accesso al pannello amministrativo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;
  const initialError = error ? (ERROR_MESSAGES[error] ?? null) : null;

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-heading">Cercola Admin</CardTitle>
          <CardDescription>
            Pannello amministrativo del Club Juventus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} initialError={initialError} />
        </CardContent>
      </Card>
    </main>
  );
}
