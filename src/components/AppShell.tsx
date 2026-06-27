"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import bcLogo from "@/src/public/bc-logo.png";
import { cn } from "./utils";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/competitions", label: "Competitions" },
  { href: "/athletes", label: "Athletes" },
];

export type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function renderNavLinks(isMobile = false) {
    return navItems.map((item) => {
      const isActive =
        pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <NavLink
          href={item.href}
          isActive={isActive}
          isMobile={isMobile}
          key={item.href}
          label={item.label}
          onClick={() => {
            setIsMenuOpen(false);
          }}
        />
      );
    });
  }

  return (
    <div className="min-h-screen bg-bc-light-grey text-bc-dark-grey">
      <header className="sticky top-0 z-40 border-b border-bc-mid-grey bg-bc-white">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            className="flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
            href="/competitions"
          >
            <Image
              alt="British Cycling"
              className="h-7 w-auto shrink-0"
              priority
              src={bcLogo}
            />
            <span className="truncate text-sm font-semibold text-bc-navy sm:text-base">
              BMX Freestyle Park Performance Tracker
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {renderNavLinks()}
          </nav>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label="Open navigation menu"
            className="inline-flex size-8 items-center justify-center rounded-sm border border-bc-mid-grey bg-bc-white text-bc-navy transition-colors hover:bg-bc-light-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2 md:hidden"
            onClick={() => setIsMenuOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" size={18} strokeWidth={2.1} />
          </button>
        </div>
      </header>
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-bc-navy/35"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <aside
            aria-label="Mobile navigation"
            className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-bc-mid-grey bg-bc-white"
            id="mobile-navigation"
          >
            <div className="flex h-12 items-center justify-between border-b border-bc-mid-grey px-4">
              <span className="text-sm font-semibold text-bc-navy">
                Navigation
              </span>
              <button
                aria-label="Close navigation menu"
                className="inline-flex size-8 items-center justify-center rounded-sm border border-bc-mid-grey bg-bc-white text-bc-navy transition-colors hover:bg-bc-light-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={18} strokeWidth={2.1} />
              </button>
            </div>
            <nav aria-label="Mobile primary" className="flex flex-col gap-1 p-3">
              {renderNavLinks(true)}
            </nav>
          </aside>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        {children}
      </main>
    </div>
  );
}

type NavLinkProps = NavItem & {
  isActive: boolean;
  isMobile?: boolean;
  onClick: () => void;
};

function NavLink({
  href,
  isActive,
  isMobile = false,
  label,
  onClick,
}: NavLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-9 items-center rounded-sm px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2",
        isMobile && "w-full",
        isActive
          ? "bg-bc-navy text-bc-white"
          : "text-bc-dark-grey hover:bg-bc-light-grey hover:text-bc-navy",
      )}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}
