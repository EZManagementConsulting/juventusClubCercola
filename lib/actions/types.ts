// Stato standard restituito dalle Server Action verso i form client.
export type ActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const idleState: ActionState = { status: "idle", message: null };

export function errorState(message: string): ActionState {
  return { status: "error", message };
}

export function successState(message: string): ActionState {
  return { status: "success", message };
}
