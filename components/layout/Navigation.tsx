"use client";

import { cn } from "@/lib/utils";
import { BarChart3, Heart, House, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Wrench },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto rounded-full border border-white/20 bg-[#041024]/70 p-1 backdrop-blur">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
              active
                ? "bg-cyan-300 text-slate-900"
                : "text-cyan-100 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
