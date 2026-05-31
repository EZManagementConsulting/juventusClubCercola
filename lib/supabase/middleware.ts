import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import {
  getMissingSupabasePublicEnvVars,
  getSupabasePublicEnv,
} from "@/lib/supabase/env";

// Route pubbliche che non richiedono autenticazione.
const PUBLIC_PATHS = ["/login", "/auth", "/configurazione"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// Aggiorna la sessione Supabase ad ogni richiesta e protegge le route private.
// Usa getClaims() (valida la firma del JWT), MAI getSession() lato server.
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const missingEnv = getMissingSupabasePublicEnvVars();

  if (missingEnv.length > 0) {
    console.error(
      `[supabase] Variabili mancanti: ${missingEnv.join(", ")}`,
    );
    if (pathname !== "/configurazione") {
      const url = request.nextUrl.clone();
      url.pathname = "/configurazione";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANTE: non eseguire codice tra createServerClient e getClaims().
  let claims: Record<string, unknown> | null = null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      console.error("[supabase] getClaims:", error.message);
    } else {
      claims = (data?.claims as Record<string, unknown> | undefined) ?? null;
    }
  } catch (error) {
    console.error("[supabase] getClaims exception:", error);
  }

  // Utente non autenticato su route privata -> redirect a /login.
  if (!claims && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Utente autenticato che visita /login -> redirect alla dashboard.
  if (claims && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
