import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ROUTES } from "@/lib/routes";

type LegacyDeprecationBannerProps = {
  title?: string;
  children?: ReactNode;
};

/** Avviso per schermate legacy MVP (`discounts` / assegnazioni dirette). */
export function LegacyDeprecationBanner({
  title = "Area legacy in dismissione",
  children,
}: LegacyDeprecationBannerProps) {
  return (
    <div
      role="status"
      className="mb-6 flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">
          {children ?? (
            <>
              Per le nuove convenzioni usa{" "}
              <Link href={ROUTES.partner} className="font-medium text-foreground underline">
                Partner
              </Link>{" "}
              e{" "}
              <Link
                href={ROUTES.catalogoSconti}
                className="font-medium text-foreground underline"
              >
                Catalogo sconti
              </Link>
              . Gli sconti MVP restano solo per compatibilità con codici e storico già attivi.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
