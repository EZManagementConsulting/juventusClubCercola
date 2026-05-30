import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// Client Supabase per i Client Component (browser).
// Usa SOLO la chiave publishable, mai la secret.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
