"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  HeartHandshake,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  PhoneCall,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { H1, Lead } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/constants";
import { SubtleEntrance } from "@/components/motion/motion-primitives";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-surface to-background">
      {/* Subtle decorative background shapes */}
      <div
        className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-accent/40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <SubtleEntrance className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline / Sub-badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold border border-emerald-200/60 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" aria-hidden="true" />
              <span>{APP_CONFIG.tagline}</span>
            </div>

            {/* Main Headline */}
            <H1 className="leading-[1.12] tracking-tight">
              Rapid Wheelchair Repairs. <br />
              <span className="text-primary underline decoration-accent decoration-wavy decoration-2">
                Guaranteed Mobility Continuity.
              </span>
            </H1>

            {/* Subtitle / Value proposition */}
            <Lead className="max-w-2xl mx-auto lg:mx-0 text-secondary/80">
              When your wheelchair breaks down, daily life shouldn’t freeze. REPAIRLINK
              connects you with vetted repair technicians in minutes, plus instant access to
              <strong className="text-secondary font-semibold"> temporary loaner wheelchairs </strong>
              from partnered hospitals and NGOs while your chair is serviced.
            </Lead>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto text-base shadow-card group bg-primary hover:bg-primary-600 font-bold"
              >
                <Link href="/find-repairs" className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
                  <span>Find Repair Support</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto text-base font-bold border-secondary/20 hover:border-secondary/40 text-secondary hover:bg-slate-50"
              >
                <Link href="/temporary-support" className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <span>Explore Temporary Mobility Support</span>
                </Link>
              </Button>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 justify-center lg:justify-start text-xs font-semibold text-secondary/85">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Doorstep & On-Site Service</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start text-xs font-semibold text-secondary/85">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Verified Technicians Only</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start text-xs font-semibold text-secondary/85">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Downtime Loaners</span>
              </div>
            </div>
          </SubtleEntrance>

          {/* Right Column: Interactive Blinkit/Urban Company Style Live Dispatch Simulation Card */}
          <SubtleEntrance delay={0.12} className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative accent behind card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-accent/30 to-slate-100 rounded-2xl transform rotate-1 scale-[1.02] filter blur-sm" />

              <Card className="relative bg-white border border-slate-200 shadow-elevated rounded-2xl overflow-hidden">
                {/* Header card banner */}
                <div className="bg-secondary p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-accent">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">
                        Live Mobility Network
                      </p>
                      <p className="text-xs text-slate-300">New Delhi NCR • Available Now</p>
                    </div>
                  </div>
                  <Badge variant="accent" className="text-[10px] py-0.5 px-2 font-bold animate-pulse">
                    Active Dispatch
                  </Badge>
                </div>

                {/* Simulated service ticket body */}
                <div className="p-5 space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-secondary">Average Dispatch SLA</p>
                        <p className="text-[11px] text-muted-foreground">Certified technician arrives</p>
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-primary">&lt; 45 Mins</span>
                  </div>

                  {/* Dual Continuity Pipeline Preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Simultaneous Double Support
                    </p>

                    <div className="space-y-2 text-xs">
                      {/* Step A */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            1
                          </span>
                          <span className="font-semibold text-secondary">
                            Technician Diagnostic & Repair
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-white text-primary border-primary/30">
                          Matched
                        </Badge>
                      </div>

                      {/* Step B */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-accent/40">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                            2
                          </span>
                          <span className="font-semibold text-emerald-950">
                            Temporary Loaner Wheelchair
                          </span>
                        </div>
                        <Badge variant="accent" className="text-[10px] bg-emerald-700 text-white">
                          Reserved from AIIMS Rehab
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action Buttons inside Hero Card */}
                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full bg-secondary hover:bg-secondary-600 text-white font-bold h-11"
                    >
                      <Link href="/book-repair">
                        Start Quick Service Request
                      </Link>
                    </Button>
                  </div>

                  <p className="text-[11px] text-center text-muted-foreground">
                    Verified assistive device platform • Zero deposit for emergency loans
                  </p>
                </div>
              </Card>
            </div>
          </SubtleEntrance>
        </div>
      </div>
    </section>
  );
}
