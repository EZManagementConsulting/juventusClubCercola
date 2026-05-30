"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { WEB_ROLES, type AppRole } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "Inserisci la password"),
  redirectTo: z.string().optional(),
});

export type LoginState = { error: string | null };

export async function signIn(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Credenziali non valide" };
  }

  // Verifica che il ruolo possa accedere al pannello web.
  const { data: claimsData } = await supabase.auth.getClaims();
  const role = (claimsData?.claims as { app_metadata?: { role?: AppRole } } | undefined)
    ?.app_metadata?.role;

  if (!role || !WEB_ROLES.includes(role)) {
    await supabase.auth.signOut();
    return {
      error: "Questo account non ha accesso al pannello amministrativo.",
    };
  }

  const target = parsed.data.redirectTo?.startsWith("/")
    ? parsed.data.redirectTo
    : "/dashboard";
  redirect(target);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
