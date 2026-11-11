"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  HeartHandshake,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H2, Lead } from "@/components/ui/typography";
import { CORE_SERVICES } from "@/lib/constants";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/motion/motion-primitives";

export function CoreServices() {
  const iconMap = {
    Wrench: Wrench,
    HeartHandshake: HeartHandshake,
    FileCheck2: FileCheck2,
  };

  return (
    <section id="services" className="py-20 bg-background border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
            Three Core Pillars
          </Badge>
          <H2>Built Ground-Up for Total Mobility Continuity</H2>
          <Lead>
            Existing repair options leave wheelchair users stranded for weeks.
            REPAIRLINK solves the entire breakdown lifecycle with an integrated three-way network.
          </Lead>
        </FadeInSection>

        {/* 3 Core Services Grid */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CORE_SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap] || Wrench;
            const isHighlight = index === 1; // Temporary mobility is the standout innovation

            return (
              <StaggerItem key={service.id} className="flex">
                <Card
                  hoverEffect
                  className={`w-full flex flex-col justify-between rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isHighlight
                      ? "border-primary/50 shadow-elevated bg-gradient-to-b from-white via-surface to-accent/20 ring-1 ring-primary/20"
                      : "border-slate-200 bg-white shadow-subtle"
                  }`}
                >
                {isHighlight && (
                  <div className="bg-primary text-white text-[11px] font-extrabold uppercase tracking-wider py-1.5 px-4 text-center">
                    Unique Startup Innovation — Mobility Continuity
                  </div>
                )}

                <CardContent className={`p-6 sm:p-8 flex-1 flex flex-col justify-between ${isHighlight ? "pt-6" : ""}`}>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isHighlight
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <Badge variant={isHighlight ? "accent" : "outline"} className="text-xs">
                        {service.popularTag}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-1.5">
                        {service.title}
                      </h3>
                      <p className="text-xs font-semibold text-primary">
                        {service.tagline}
                      </p>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                        Key Capabilities:
                      </p>
                      {service.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-secondary/85">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 mt-auto">
                    <Button
                      variant={isHighlight ? "default" : "outline"}
                      asChild
                      className="w-full font-bold justify-between"
                    >
                      <Link href={service.ctaLink}>
                        <span>{service.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
