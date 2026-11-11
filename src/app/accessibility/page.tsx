import React from "react";
import Link from "next/link";
import { Accessibility, Keyboard, Eye, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="px-0 text-xs font-bold text-primary">
          <Link href="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Home
          </Link>
        </Button>
        <Badge variant="success" className="text-xs font-bold">
          Inclusive Assistive Design
        </Badge>
        <h1 className="text-3xl font-extrabold text-secondary tracking-tight">
          Accessibility Statement (WCAG 2.1 AA Alignment)
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          REPAIRLINK is designed alongside wheelchair users, caregivers, and rehabilitation
          professionals. Accessibility is foundational to every workflow on our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-slate-200 space-y-2">
          <Keyboard className="w-6 h-6 text-primary" />
          <h2 className="text-sm font-bold text-secondary">Full Keyboard Operability</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Includes a Skip-to-Main-Content link (`Tab` on page entry), visible focus rings (`#087F8C`),
            logical tab ordering, and `Escape` dismissal across modals and the Notification Centre.
          </p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 space-y-2">
          <Eye className="w-6 h-6 text-primary" />
          <h2 className="text-sm font-bold text-secondary">High Contrast & Legible Type</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deep Teal (`#087F8C`) and Dark Navy (`#17324D`) against crisp `#FFFFFF` / `#F7F9FA`
            surfaces avoid low-contrast gradients and neon glare, prioritizing effortless reading.
          </p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 space-y-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-sm font-bold text-secondary">Reduced Motion Compliance</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Both Framer Motion (`reducedMotion=&quot;user&quot;`) and CSS media queries honor system
            preferences to eliminate dizzying parallax, pings, or abrupt motion transitions.
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-white border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-secondary flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-primary" />
          <span>Implemented Accessibility Standards</span>
        </h2>

        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          {[
            "Semantic landmarks (<header>, <nav>, <main id='main-content'>, <footer>) with explicit aria-label attributes.",
            "Form controls paired with accessible labels, aria-invalid error flags, and role='alert' inline validation feedback.",
            "Radix UI dialog primitives with focus trapping, Escape key handling, and accessible screen-reader titles.",
            "Responsive touch-friendly buttons (44px standard control height) tested across 360px mobile to 1440px desktop.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-slate-100 text-xs text-muted-foreground">
          Encounter an accessibility barrier or need human assistance? Call{" "}
          <strong className="text-secondary">{APP_CONFIG.supportPhone}</strong> or email{" "}
          <strong className="text-primary">{APP_CONFIG.supportEmail}</strong>.
        </div>
      </Card>
    </div>
  );
}
