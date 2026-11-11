"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Wrench,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  User,
  ArrowRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_NAVIGATION_LINKS, ROLE_PORTALS } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, signOut, switchDemoRole } = useAuth();
  const activeNavLinks = ROLE_NAVIGATION_LINKS[user?.role || "user"];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      {/* Top ideathon announcement bar */}
      <div className="bg-secondary text-slate-100 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 bg-primary/20 text-accent px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-accent" /> SBI Young Innovators
        </span>
        <span className="hidden sm:inline">Prototype Exhibition:</span>
        <span className="text-slate-300">
          Digital Wheelchair Repair & Mobility-Continuity Platform
        </span>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Brand Logo with Official Motif */}
          <div className="flex items-center gap-6">
            <Logo size="md" showTagline={true} taglineVariant="possibilities" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 ml-4" aria-label="Main Navigation">
              {activeNavLinks.map((item) => {
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

              {/* Role Portals Dropdown for Ideathon evaluation */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  onBlur={() => setTimeout(() => setRoleDropdownOpen(false), 200)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  aria-expanded={roleDropdownOpen}
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Portals & Dashboards</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", roleDropdownOpen && "rotate-180")} />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl bg-white p-2 shadow-elevated border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Switch Stakeholder Role
                      </p>
                      <Badge variant="accent" className="text-[9px]">
                        1-Click Test
                      </Badge>
                    </div>
                    <div className="py-1">
                      {ROLE_PORTALS.map((portal) => (
                        <button
                          key={portal.role}
                          type="button"
                          onClick={() => {
                            switchDemoRole(portal.role);
                            setRoleDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left flex flex-col p-2.5 rounded-lg hover:bg-slate-50 transition-colors group",
                            user?.role === portal.role && "bg-primary/5 border-l-2 border-primary"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">
                              {portal.title}
                            </span>
                            <Badge variant={user?.role === portal.role ? "default" : "outline"} className="text-[9px] py-0 px-1.5">
                              {portal.badge}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {portal.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Quick Action CTAs / User Session */}
          <div className="hidden md:flex items-center gap-2.5">
            <NotificationBell />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/${user.role}`}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/40 transition-all text-xs font-bold text-secondary"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-extrabold uppercase">
                    {user.profile?.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="line-clamp-1">{user.profile?.full_name}</p>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      {user.role} Dashboard
                    </span>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-xs text-muted-foreground hover:text-error"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <>
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
                  className="font-semibold shadow-sm"
                >
                  <Link href="/register" className="flex items-center gap-1.5">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile action bar & hamburger button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <NotificationBell />
            {isAuthenticated && user ? (
              <Link
                href={`/dashboard/${user.role}`}
                className="px-2 py-1 text-xs font-bold text-primary bg-primary/10 rounded-md"
              >
                {user.role.toUpperCase()}
              </Link>
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
            {activeNavLinks.map((item) => (
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
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Role Portals (1-Click Evaluation)
            </p>
            <div className="grid grid-cols-1 gap-1">
              {ROLE_PORTALS.map((portal) => (
                <button
                  key={portal.role}
                  type="button"
                  onClick={() => {
                    switchDemoRole(portal.role);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-secondary hover:bg-slate-50 rounded-lg text-left"
                >
                  <span>{portal.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {portal.badge}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <Button
                variant="destructive"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Sign Out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="default" asChild className="w-full">
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
