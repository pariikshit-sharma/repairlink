"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H2, Lead } from "@/components/ui/typography";

const DEMO_INSTITUTIONS = [
  {
    name: "AIIMS Dept of Physical Medicine & Rehab",
    city: "New Delhi",
    availableUnits: 14,
    types: ["Manual Active", "Standard Transport", "Pediatric"],
    category: "Government Apex Hospital",
    verified: true,
  },
  {
    name: "Indian Spinal Injuries Centre (ISIC)",
    city: "Vasant Kunj, Delhi",
    availableUnits: 9,
    types: ["High-Back Ergonomic", "Power Wheelchairs"],
    category: "Specialized Rehab Centre",
    verified: true,
  },
  {
    name: "Mobility India Partner Network",
    city: "Bengaluru / Regional",
    availableUnits: 18,
    types: ["Rough Terrain", "Standard Folding"],
    category: "Assistive Technology NGO",
    verified: true,
  },
];

export function TemporaryMobilitySpotlight() {
  return (
    <section id="temporary-support" className="py-20 bg-gradient-to-b from-background to-accent/30 border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & The Mobility Continuity Guarantee */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <HeartHandshake className="w-4 h-4" />
              <span>Differentiating Breakthrough</span>
            </div>

            <H2 className="text-secondary">
              Temporary Wheelchair Support — <br />
              <span className="text-primary">Life Doesn’t Wait for Spare Parts</span>
            </H2>

            <Lead className="text-secondary/80">
              When a wheelchair needs 48 hours for motor rewinding or specialized part fabrication,
              the user cannot be trapped in bed. REPAIRLINK coordinates loaner wheelchairs directly
              from verified hospital inventories, rehabilitation centers, and non-profits.
            </Lead>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-subtle">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-secondary">Pre-Matched Suitability</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Matches seat width, weight rating, and spinal support to minimize injury risks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-subtle">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-secondary">Verified Return Protocol</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Digital check-in/check-out with sanitization inspection upon return.
                  </p>
                </div>
              </div>
            </div>

            {/* Clear Transparency Callout */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Honest Availability Notice:</strong> Equipment loans are coordinated based on live institutional stock. Final allocation and medical suitability approval are verified by the lending institution.
              </p>
            </div>

            <div>
              <Button size="lg" asChild className="font-bold">
                <Link href="/temporary-support" className="flex items-center gap-2">
                  <span>Browse Available Loaner Equipment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Participating Centers & Simulated Inventory Cards */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                Sample Participating Centers (Demonstration Pool)
              </p>
              <Badge variant="outline" className="text-[10px]">
                Live Inventory Feed
              </Badge>
            </div>

            <div className="space-y-3">
              {DEMO_INSTITUTIONS.map((inst, index) => (
                <Card
                  key={index}
                  hoverEffect
                  className="bg-white border-slate-200 p-4 sm:p-5 rounded-xl shadow-subtle transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-secondary">
                            {inst.name}
                          </h4>
                          {inst.verified && (
                            <Badge variant="accent" className="text-[9px] py-0 px-1">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {inst.city} • {inst.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-primary">
                        {inst.availableUnits} Available
                      </span>
                      <p className="text-[10px] text-muted-foreground">Ready for Dispatch</p>
                    </div>
                  </div>

                  {/* Device configurations available */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Wheelchair Stock:
                    </span>
                    {inst.types.map((type, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-slate-100 text-secondary px-2 py-0.5 rounded-md font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/register?role=institution"
                className="text-xs font-bold text-primary hover:underline"
              >
                Are you a Hospital or NGO? Register Equipment in Institution Portal →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
