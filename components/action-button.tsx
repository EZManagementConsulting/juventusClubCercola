"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { idleState, type ActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";

type ServerAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

// Pulsante che esegue una Server Action one-shot con feedback toast e refresh.
export function ActionButton({
  action,
  hidden,
  children,
  variant = "ghost",
  size = "icon",
  ariaLabel,
}: {
  action: ServerAction;
  hidden?: Record<string, string>;
  children: ReactNode;
  variant?: "ghost" | "outline" | "secondary" | "default" | "destructive";
  size?: "icon" | "sm" | "default";
  ariaLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Operazione completata");
      router.refresh();
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={pending}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
    </form>
  );
}
