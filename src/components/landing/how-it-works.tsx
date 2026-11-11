"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  HeartHandshake,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H2, Lead } from "@/components/ui/typography";
import { WORKFLOW_STEPS } from "@/lib/constants";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/motion/motion-primitives";

export function HowItWorks() {
  const stepIcons = [FileText, Search, HeartHandshake, CheckCircle];

  return (
    <section id="how-it-works" className="py-20 bg-surface border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="secondary" className="text-xs uppercase font-bold tracking-wider">
            Simplicity & Transparency
          </Badge>
          <H2>How REPAIRLINK Works in 4 Steps</H2>
          <Lead>
            From breakdown to verified doorstep return, our coordinated flow keeps you informed and mobile every step of the way.
          </Lead>
        </FadeInSection>

        {/* 4 Steps Horizontal / Responsive Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx];
            return (
              <StaggerItem key={step.step} className="flex">
                <div className="w-full relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group">
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black text-slate-200 group-hover:text-primary transition-colors">
                    {step.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="text-base font-bold text-secondary group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center text-[11px] font-semibold text-primary">
                  <span>Step {idx + 1} of 4</span>
                  {idx < 3 && (
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Action button beneath */}
        <div className="mt-12 text-center">
          <Button size="lg" asChild className="font-bold shadow-card">
            <Link href="/book-repair">
              Experience the 4-Step Booking Flow
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
