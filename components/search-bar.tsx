"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ placeholder = "Cerca..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onSubmit(formData: FormData) {
    const q = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form action={onSubmit} className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder={placeholder}
        className="pl-9"
      />
    </form>
  );
}
