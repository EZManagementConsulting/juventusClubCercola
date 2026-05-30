import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VARIANTS: Record<string, string> = {
  active: "border-transparent bg-emerald-500/15 text-emerald-500",
  used: "border-transparent bg-sky-500/15 text-sky-500",
  inactive: "border-transparent bg-muted text-muted-foreground",
  expired: "border-transparent bg-amber-500/15 text-amber-500",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <Badge variant="outline" className={cn(VARIANTS[status] ?? "")}>
      {label}
    </Badge>
  );
}
