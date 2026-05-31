const PUBLIC_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function getMissingSupabasePublicEnvVars(): string[] {
  return PUBLIC_ENV_VARS.filter((name) => !process.env[name]?.trim());
}

export function getSupabasePublicEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  return { url, key };
}

export function assertSupabasePublicEnv(): { url: string; key: string } {
  const missing = getMissingSupabasePublicEnvVars();
  if (missing.length > 0) {
    throw new Error(
      `Variabili Supabase mancanti: ${missing.join(", ")}. ` +
        "Impostale su Vercel (Production) e rifai il deploy.",
    );
  }
  return getSupabasePublicEnv();
}
