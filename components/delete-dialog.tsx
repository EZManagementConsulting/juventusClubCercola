"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { idleState, type ActionState } from "@/lib/actions/types";
import { useMounted } from "@/lib/hooks/use-mounted";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ServerAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function DeleteDialog({
  trigger,
  title = "Confermi l'eliminazione?",
  description = "Questa operazione non puo essere annullata.",
  id,
  action,
}: {
  trigger: ReactNode;
  title?: string;
  description?: string;
  id: string;
  action: ServerAction;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const mounted = useMounted();

  function onConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      const result = await action(idleState, formData);
      if (result.status === "success") {
        toast.success(result.message ?? "Eliminato");
        setOpen(false);
        router.refresh();
      } else if (result.status === "error" && result.message) {
        toast.error(result.message);
      }
    });
  }

  if (!mounted) {
    return trigger;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={pending}
          >
            {pending ? "Eliminazione..." : "Elimina"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
