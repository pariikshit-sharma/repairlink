"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wrench,
  Clock,
  HeartHandshake,
  User,
  FileCheck,
  Building2,
  ShieldAlert,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "user";

  const navItemsByRole = {
    user: [
      { name: "Home", href: "/", icon: Home, isActive: pathname === "/" },
      {
        name: "Repairs",
        href: "/find-repairs",
        icon: Wrench,
        isActive: pathname === "/find-repairs" || pathname.startsWith("/providers"),
      },
      {
        name: "Loaners",
        href: "/temporary-support",
        icon: HeartHandshake,
        isActive: pathname === "/temporary-support",
      },
      {
        name: "Requests",
        href: "/dashboard/user?tab=requests",
        icon: Clock,
        isActive: pathname.startsWith("/repairs"),
      },
      {
        name: "Account",
        href: "/dashboard/user",
        icon: User,
        isActive: pathname.startsWith("/dashboard/user"),
      },
    ],
    provider: [
      { name: "Home", href: "/", icon: Home, isActive: pathname === "/" },
      {
        name: "Incoming",
        href: "/dashboard/provider?tab=incoming",
        icon: Clock,
        isActive: pathname === "/dashboard/provider",
      },
      {
        name: "Quotes",
        href: "/dashboard/provider?tab=quotations",
        icon: FileCheck,
        isActive: false,
      },
      {
        name: "Active",
        href: "/dashboard/provider?tab=active",
        icon: Wrench,
        isActive: false,
      },
      {
        name: "Profile",
        href: "/dashboard/provider?tab=profile",
        icon: User,
        isActive: false,
      },
    ],
    institution: [
      { name: "Home", href: "/", icon: Home, isActive: pathname === "/" },
      {
        name: "Requests",
        href: "/dashboard/institution?tab=requests",
        icon: Clock,
        isActive: pathname === "/dashboard/institution",
      },
      {
        name: "Pool",
        href: "/dashboard/institution?tab=inventory",
        icon: Building2,
        isActive: false,
      },
      {
        name: "Returns",
        href: "/dashboard/institution?tab=returns",
        icon: HeartHandshake,
        isActive: false,
      },
      {
        name: "Catalog",
        href: "/temporary-support",
        icon: LayoutDashboard,
        isActive: pathname === "/temporary-support",
      },
    ],
    admin: [
      { name: "Home", href: "/", icon: Home, isActive: pathname === "/" },
      {
        name: "Verify",
        href: "/dashboard/admin?tab=verifications",
        icon: ShieldAlert,
        isActive: pathname === "/dashboard/admin",
      },
      {
        name: "Users",
        href: "/dashboard/admin?tab=users",
        icon: User,
        isActive: false,
      },
      {
        name: "Repairs",
        href: "/dashboard/admin?tab=repairs",
        icon: Wrench,
        isActive: false,
      },
      {
        name: "Categories",
        href: "/dashboard/admin?tab=categories",
        icon: LayoutDashboard,
        isActive: false,
      },
    ],
  };

  const navItems = navItemsByRole[role] || navItemsByRole.user;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all touch-manipulation min-w-[54px]",
                item.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-secondary active:scale-95"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-md transition-colors",
                  item.isActive && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={item.isActive ? 2.5 : 2} />
              </div>
              <span className="mt-0.5 tracking-tight line-clamp-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
