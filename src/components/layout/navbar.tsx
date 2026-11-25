"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  User,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ROLE_NAVIGATION_LINKS } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";

const PUBLIC_NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Find Repairs", href: "/find-repairs" },
  { name: "Temporary Support", href: "/temporary-support" },
  { name: "FAQ", href: "/faq" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  
  const navLinks = isAuthenticated && user
    ? ROLE_NAVIGATION_LINKS[user.role]
    : PUBLIC_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Brand Logo with Official Motif */}
          <div className="flex items-center gap-6 shrink-0">
            <Logo size="md" showTagline={true} taglineVariant="possibilities" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 ml-4" aria-label="Main Navigation">
              {navLinks.map((item) => {
                const baseHref = item.href.split("?")[0];
                const isActive = baseHref === "/" ? pathname === "/" : pathname === baseHref;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-slate-50",
                      isActive ? "text-primary bg-primary/5" : "text-secondary/80 hover:text-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Action CTAs / User Session */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link
                  href={`/dashboard/${user.role}`}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/40 transition-all text-xs font-bold text-secondary"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-extrabold uppercase">
                    {user.profile?.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="line-clamp-1 max-w-[130px] font-bold text-secondary">
                      {user.profile?.full_name || user.email}
                    </p>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      {user.role} Dashboard
                    </span>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-xs text-muted-foreground hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-secondary font-semibold"
                >
                  <Link href="/login">Sign In</Link>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="font-semibold shadow-sm bg-primary hover:bg-primary-600 text-white"
                >
                  <Link href="/register" className="flex items-center gap-1.5">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile action bar & hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && user ? (
              <>
                <NotificationBell />
                <Link
                  href={`/dashboard/${user.role}`}
                  className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-md"
                >
                  {user.role.toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1.5 text-xs font-semibold text-secondary hover:text-primary"
              >
                Sign In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-secondary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-elevated">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-semibold text-secondary hover:bg-slate-50 hover:text-primary rounded-lg transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  href={`/dashboard/${user.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-sm font-bold text-secondary"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Open {user.role.toUpperCase()} Dashboard</span>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="default" asChild className="w-full bg-primary hover:bg-primary-600 text-white">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
