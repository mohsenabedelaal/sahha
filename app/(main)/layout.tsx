"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/plan", label: "Plan", icon: "📋" },
  { href: "/log", label: "Log", icon: null }, // center floating button
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col pb-[84px]">
      <main className="flex-1 max-w-lg mx-auto w-full">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40">
        <div className="flex items-start pt-2 max-w-lg mx-auto h-[84px]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isLog = item.href === "/log";

            if (isLog) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-1 flex-col items-center gap-[3px] -mt-[22px]"
                >
                  <div className="w-[54px] h-[54px] rounded-full bg-gradient-to-br from-mint to-[#06b6d4] border-[3px] border-background flex items-center justify-center text-2xl text-background shadow-[0_4px_24px_var(--mint-g)] active:scale-[0.92] transition-transform">
                    +
                  </div>
                  <span className="text-[10px] font-semibold text-tx3 mt-[3px]">Log</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-[3px] py-[6px] transition-colors ${
                  isActive ? "text-mint" : "text-tx3"
                }`}
              >
                <div
                  className={`w-[26px] h-[26px] flex items-center justify-center text-[17px] rounded-lg transition-colors ${
                    isActive ? "bg-mint-d" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
