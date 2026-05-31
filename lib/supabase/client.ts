import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { assertSupabasePublicEnv } from "@/lib/supabase/env";

// Client Supabase per i Client Component (browser).
// Usa SOLO la chiave publishable, mai la secret.
export function createClient() {
  const { url, key } = assertSupabasePublicEnv();
  return createBrowserClient<Database>(url, key);
}
