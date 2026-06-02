"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureRole } from "@/lib/actions/guard";
import { errorState, successState, type ActionState } from "@/lib/actions/types";
import {
  excludeDateUsageRuleSchema,
  timeRangeUsageRuleSchema,
  weekdaysUsageRuleSchema,
} from "@/lib/validations";
import { parseExcludeDatesConfig } from "@/lib/discount-usage-rules";

export async function addWeekdaysUsageRule(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const days = formData.getAll("days").map((d) => Number(d));
  const parsed = weekdaysUsageRuleSchema.safeParse({
    discount_id: formData.get("discount_id"),
    days,
  });
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("discount_usage_rules").insert({
    discount_id: parsed.data.discount_id,
    rule_type: "weekdays",
    config: { days: parsed.data.days },
  });
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath(`/sconti/${parsed.data.discount_id}`);
  return successState("Regola giorni aggiunta.");
}

export async function addTimeRangeUsageRule(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = timeRangeUsageRuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("discount_usage_rules").insert({
    discount_id: parsed.data.discount_id,
    rule_type: "time_range",
    config: { start: parsed.data.start, end: parsed.data.end },
  });
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath(`/sconti/${parsed.data.discount_id}`);
  return successState("Regola orario aggiunta.");
}

export async function addExcludeDateUsageRule(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = excludeDateUsageRuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("discount_usage_rules")
    .select("id, config")
    .eq("discount_id", parsed.data.discount_id)
    .eq("rule_type", "exclude_dates")
    .eq("active", true)
    .maybeSingle();

  if (fetchError) return errorState(`Errore: ${fetchError.message}`);

  if (existing) {
    const cfg = parseExcludeDatesConfig(existing.config);
    if (cfg.dates.includes(parsed.data.date)) {
      return errorState("Questa data è già tra le esclusioni.");
    }
    const { error } = await supabase
      .from("discount_usage_rules")
      .update({ config: { dates: [...cfg.dates, parsed.data.date].sort() } })
      .eq("id", existing.id);
    if (error) return errorState(`Errore: ${error.message}`);
  } else {
    const { error } = await supabase.from("discount_usage_rules").insert({
      discount_id: parsed.data.discount_id,
      rule_type: "exclude_dates",
      config: { dates: [parsed.data.date] },
    });
    if (error) return errorState(`Errore: ${error.message}`);
  }

  revalidatePath(`/sconti/${parsed.data.discount_id}`);
  return successState("Data di esclusione aggiunta.");
}

export async function removeUsageRule(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  const discountId = String(formData.get("discount_id") ?? "");
  if (!id) return errorState("ID mancante.");

  const supabase = await createClient();
  const { error } = await supabase.from("discount_usage_rules").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  if (discountId) revalidatePath(`/sconti/${discountId}`);
  return successState("Regola rimossa.");
}
