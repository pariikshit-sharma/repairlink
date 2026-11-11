"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Wrench, HeartHandshake, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/lib/constants";
import { FadeInSection } from "@/components/motion/motion-primitives";

export function CtaBanner() {
  return (
    <section className="py-16 bg-gradient-to-br from-secondary via-secondary-700 to-primary-900 text-white relative overflow-hidden">
      <FadeInSection className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="accent" className="text-xs uppercase font-extrabold tracking-wider">
            Ready to Experience REPAIRLINK?
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            When Mobility Stops, <br className="hidden sm:inline" />
            <span className="text-accent underline decoration-primary decoration-4">
              Support Shouldn&apos;t.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join India&apos;s pioneering mobility-continuity network. Whether you need immediate
            wheelchair diagnostics or want to contribute loaner units as a hospital or NGO partner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white font-bold text-base px-8 h-12 shadow-card"
            >
              <Link href="/register?role=user" className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                <span>Book Wheelchair Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto font-bold text-base bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white px-8 h-12"
            >
              <Link href="/register?role=institution" className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-accent" />
                <span>Partner as Institution</span>
              </Link>
            </Button>
          </div>

          <p className="text-xs text-slate-400 pt-2">
            SBI Young Innovators Ideathon Prototype • Open for Demonstrations & Evaluations
          </p>
        </div>
      </FadeInSection>
    </section>
  );
}
