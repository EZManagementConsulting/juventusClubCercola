# Cercola Admin — Pannello Next.js

Pannello amministrativo web del Club Juventus Cercola, usato da `superadmin` e `admin`.
Backend: Supabase (Postgres + Auth + RLS). Vedi `../ARCHITECTURE.md`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- `@supabase/ssr` (sessione via cookie) + `@supabase/supabase-js` (admin)
- Validazione input con `zod`, mutazioni via Server Actions

## Requisiti

- Node.js 20+ (testato su 24)
- Un progetto Supabase con lo schema applicato (vedi `../supabase`)

## Configurazione

1. Copia le variabili d'ambiente:

   ```bash
   cp .env.example .env.local
   ```

2. Compila `.env.local` con i valori del progetto Supabase (Dashboard -> Project -> Connect / API Keys):

   - `NEXT_PUBLIC_SUPABASE_URL` — URL del progetto
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — chiave publishable (`sb_publishable_...`), esposta al browser
   - `SUPABASE_SECRET_KEY` — chiave secret (`sb_secret_...`), **solo server**, usata per creare utenti

   > Mai esporre la chiave secret con prefisso `NEXT_PUBLIC_`.

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
npm run lint     # ESLint
```

## Deploy su Vercel

1. **Root Directory:** imposta `frontend` (Project Settings → General).
2. **Environment Variables** (Environment **Production**, e Preview se serve):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
3. Usa i **nomi esatti** sopra (non `ANON_KEY` / `SERVICE_ROLE_KEY`).
4. Dopo ogni modifica alle variabili `NEXT_PUBLIC_*`: **Redeploy** (sono incluse nel build).
5. Su Supabase (Dashboard → Authentication → URL Configuration) aggiungi il dominio Vercel in **Site URL** e **Redirect URLs**.
6. Abilita l'hook JWT `public.custom_access_token_hook` (Authentication → Hooks).

Se le variabili mancano in produzione, l'app reindirizza a `/configurazione` invece di mostrare un Internal Server Error.

## Primo accesso (superadmin)

Solo gli account con ruolo `superadmin`/`admin` (in `app_metadata.role`) accedono al pannello.
Per creare il primo superadmin, dalla SQL/console Supabase crea un utente auth e imposta il ruolo,
oppure usa l'admin API impostando `app_metadata: { role: "superadmin" }`. Esempio SQL dopo aver
creato l'utente da Dashboard -> Authentication -> Add user:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"superadmin"}'::jsonb
where email = 'admin@club.it';

-- assicura il profilo applicativo con il ruolo corretto
update public.users u
set role_id = r.id
from public.roles r
where r.name = 'superadmin' and u.email = 'admin@club.it';
```

Dopo il prossimo refresh del token il ruolo sara presente nel JWT (custom access token hook).

## Struttura

```text
app/
  (auth)/login/        Login pubblico
  (dashboard)/         Area protetta (superadmin/admin)
    dashboard/         Panoramica
    utenti/ ruoli/ permessi/    (solo superadmin)
    soci/ membri/ sconti/ storico/ statistiche/
    impostazioni/      (solo superadmin)
components/            UI riutilizzabile (form-dialog, delete-dialog, ...)
components/ui/         Componenti shadcn/ui
lib/
  supabase/            client (browser), server, middleware, admin
  actions/             Server Actions (mutazioni)
  auth.ts              getClaims / requireRole / getCurrentUser
  validations.ts       Schemi zod
  database.types.ts    Tipi del DB (rigenerare con supabase gen types)
middleware.ts          Refresh sessione + protezione route
```

## Sicurezza

- Autorizzazione decisa lato DB (RLS) e basata su `app_metadata.role` nel JWT.
- Protezione pagine con `getClaims()` (valida il JWT), mai `getSession()` lato server.
- La chiave secret resta server-only (`lib/supabase/admin.ts`, `import "server-only"`).
