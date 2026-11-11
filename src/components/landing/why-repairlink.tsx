"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { H2, Lead } from "@/components/ui/typography";
import { VALUE_PILLARS } from "@/lib/constants";
import { FadeInSection } from "@/components/motion/motion-primitives";

export function WhyRepairLink() {
  return (
    <section className="py-20 bg-background border-b border-slate-200/80">
      <FadeInSection className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="accent" className="text-xs uppercase font-bold tracking-wider">
            Why REPAIRLINK
          </Badge>
          <H2>Solving the Assistive Device Mobility Gap</H2>
          <Lead>
            Generic service apps do not understand motorized wheelchairs or custom postural seating.
            REPAIRLINK is purpose-built for assistive device engineering and emergency continuity.
          </Lead>
        </div>

        {/* 4 Value Pillars Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {VALUE_PILLARS.map((pillar, idx) => (
            <Card
              key={idx}
              className="p-6 bg-white border-slate-200 text-center rounded-2xl shadow-subtle hover:shadow-card transition-all"
            >
              <div className="text-3xl sm:text-4xl font-black text-primary mb-1">
                {pillar.metric}
              </div>
              <h3 className="text-sm font-bold text-secondary mb-2">
                {pillar.label}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pillar.detail}
              </p>
            </Card>
          ))}
        </div>

        {/* Direct Comparison Matrix Card */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle">
          <h3 className="text-lg font-bold text-secondary mb-6 text-center sm:text-left">
            How REPAIRLINK Compares to Current Alternatives
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-secondary">
                  <th className="pb-3 font-bold">Key Evaluation Criteria</th>
                  <th className="pb-3 font-extrabold text-primary">REPAIRLINK Platform</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Unorganized Local Mechanics</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Generic Service Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-secondary/85">
                <tr>
                  <td className="py-3 font-semibold">Temporary Loaner Wheelchairs</td>
                  <td className="py-3 font-bold text-emerald-700 bg-emerald-50/60 px-2 rounded">
                    ✓ Coordinated through NGOs & Hospitals
                  </td>
                  <td className="py-3 text-muted-foreground">✗ Not available (User stranded)</td>
                  <td className="py-3 text-muted-foreground">✗ Not supported</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Assistive Device Expertise</td>
                  <td className="py-3 font-bold text-emerald-700 bg-emerald-50/60 px-2 rounded">
                    ✓ Specialized (Manual & Power Chairs)
                  </td>
                  <td className="py-3 text-muted-foreground">⚠ Improvisational cycle mechanics</td>
                  <td className="py-3 text-muted-foreground">✗ General home repairs only</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Quotation Transparency</td>
                  <td className="py-3 font-bold text-emerald-700 bg-emerald-50/60 px-2 rounded">
                    ✓ Upfront digital itemized pricing
                  </td>
                  <td className="py-3 text-muted-foreground">✗ Arbitrary pricing & markups</td>
                  <td className="py-3 text-muted-foreground">⚠ Standardized fee + hidden extras</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Service Log & Warranty Audit</td>
                  <td className="py-3 font-bold text-emerald-700 bg-emerald-50/60 px-2 rounded">
                    ✓ Centralized digital maintenance log
                  </td>
                  <td className="py-3 text-muted-foreground">✗ No record or guarantee</td>
                  <td className="py-3 text-muted-foreground">⚠ Basic transaction history only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
