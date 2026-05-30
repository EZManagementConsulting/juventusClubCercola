"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import type { NavItem } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Apri menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="font-heading">Cercola Admin</SheetTitle>
        </SheetHeader>
        <div className="px-3 py-4" onClick={() => setOpen(false)}>
          <SidebarNav items={items} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
