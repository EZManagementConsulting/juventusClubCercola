import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function generateSectionCardNumber(
  admin: AdminClient,
  sectionId: string,
): Promise<{ cardNumber: string | null; error: string | null }> {
  const { data, error } = await admin.rpc("generate_section_card_number", {
    p_section_id: sectionId,
  });

  if (error) {
    if (error.message.includes("section_not_found_or_inactive")) {
      return { cardNumber: null, error: "Sezione non trovata o non attiva." };
    }
    return { cardNumber: null, error: error.message };
  }

  if (typeof data !== "string" || !data) {
    return { cardNumber: null, error: "Errore generazione numero tessera." };
  }

  return { cardNumber: data, error: null };
}
