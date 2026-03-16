"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/log", label: "Log", icon: "🍽️" },
  { href: "/plan", label: "Plan", icon: "📋" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-2 z-40">
        <div className="flex justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${isActive ? "text-mint" : "text-muted"}`}
              >
                <span className="text-xl mb-0.5">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
