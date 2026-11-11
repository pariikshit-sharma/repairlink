"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Wrench,
  Building2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H2, Lead } from "@/components/ui/typography";
import { USER_SEGMENTS } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/lib/supabase/types";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/motion/motion-primitives";

export function WhoWeServe() {
  const { switchDemoRole } = useAuth();
  const segmentIcons = [Users, Wrench, Building2];
  const segmentRoles: UserRole[] = ["user", "provider", "institution"];
  const segmentButtons = ["User Portal", "Provider Portal", "Institution Portal"];

  return (
    <section id="who-we-serve" className="py-20 bg-surface border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
            Ecosystem Alignment
          </Badge>
          <H2>Who We Serve Across the Value Chain</H2>
          <Lead>
            A multi-stakeholder platform uniting users, specialized technicians, and healthcare institutions for collective mobility continuity.
          </Lead>
        </FadeInSection>

        {/* 3 User Segments */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USER_SEGMENTS.map((seg, idx) => {
            const Icon = segmentIcons[idx];
            return (
              <StaggerItem key={seg.title} className="flex">
                <Card
                  hoverEffect
                  className="w-full bg-white border-slate-200 p-6 sm:p-8 rounded-2xl flex flex-col justify-between"
                >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-secondary">
                      {seg.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {seg.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {seg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-secondary/85 font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => switchDemoRole(segmentRoles[idx])}
                    className="w-full text-xs font-bold justify-between"
                  >
                    <span>Explore {segmentButtons[idx]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
