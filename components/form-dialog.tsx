"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { idleState, type ActionState } from "@/lib/actions/types";
import { useMounted } from "@/lib/hooks/use-mounted";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ServerAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function FormDialog({
  trigger,
  title,
  description,
  submitLabel = "Salva",
  action,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  submitLabel?: string;
  action: ServerAction;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const mounted = useMounted();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(idleState, formData);
      if (result.status === "success") {
        toast.success(result.message ?? "Operazione completata");
        setOpen(false);
        router.refresh();
      } else if (result.status === "error" && result.message) {
        toast.error(result.message);
      }
    });
  }

  // Radix assegna id (aria-controls) solo lato client: evita hydration mismatch.
  if (!mounted) {
    return trigger;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {children}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvataggio..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
