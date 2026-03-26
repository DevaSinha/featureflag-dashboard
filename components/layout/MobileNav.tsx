"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Flag, Settings } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/flags", label: "Flags", icon: Flag },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md pb-safe z-40">
      <div className="flex items-center justify-around h-16 px-4">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
