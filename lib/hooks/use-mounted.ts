"use client";

import { useEffect, useState } from "react";

/** True dopo il primo paint client — evita mismatch di id Radix in SSR. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
