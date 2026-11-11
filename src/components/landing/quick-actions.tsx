"use client";

import React from "react";
import Link from "next/link";
import {
  Disc,
  OctagonAlert,
  BatteryCharging,
  Armchair,
  Hammer,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-primitives";

const ISSUE_CATEGORIES = [
  {
    name: "Wheel & Tire Damage",
    desc: "Punctures, bearing lock, spoke damage",
    icon: Disc,
    color: "text-primary bg-primary/10",
    badge: "Fast Track",
  },
  {
    name: "Brake Malfunction",
    desc: "Slack cables, lever failure, locking issue",
    icon: OctagonAlert,
    color: "text-amber-600 bg-amber-50",
    badge: "High Priority",
  },
  {
    name: "Motor & Battery Failure",
    desc: "Power chair drain, joystick glitch, wiring",
    icon: BatteryCharging,
    color: "text-primary bg-primary/10",
    badge: "EV Diagnostic",
  },
  {
    name: "Seat & Cushion Damage",
    desc: "Pressure foam tear, sling replacement",
    icon: Armchair,
    color: "text-emerald-600 bg-emerald-50",
    badge: "Ergonomic",
  },
  {
    name: "Frame & Structural Weld",
    desc: "Bent footrest, axle alignment, crack",
    icon: Hammer,
    color: "text-secondary bg-secondary/10",
    badge: "Heavy Duty",
  },
  {
    name: "Annual General Service",
    desc: "Full safety tuneup, lubrication, inspection",
    icon: ShieldCheck,
    color: "text-primary bg-primary/10",
    badge: "Preventive",
  },
];

export function QuickActions() {
  return (
    <section className="py-12 bg-surface border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-accent text-accent-foreground">
                <Flame className="w-4 h-4 text-emerald-700" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Blinkit-Style Instant Triage
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
              Select Your Wheelchair Issue
            </h2>
          </div>
          <Link
            href="/find-repairs"
            className="text-xs font-bold text-primary hover:text-primary-700 inline-flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Explore All Diagnostic Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 6 Category Cards Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {ISSUE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <StaggerItem key={cat.name}>
                <Link
                  href={`/find-repairs?issue=${encodeURIComponent(cat.name)}`}
                  className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                >
                  <Card
                    hoverEffect
                    className="h-full p-4 flex flex-col justify-between border-slate-200/80 hover:border-primary/40 bg-white transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {cat.badge}
                        </Badge>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-secondary group-hover:text-primary transition-colors leading-snug">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                      {cat.desc}
                    </p>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
