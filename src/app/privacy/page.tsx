import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="px-0 text-xs font-bold text-primary">
          <Link href="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Home
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="text-xs font-bold">
            Data Protection & Trust
          </Badge>
          <span className="text-xs text-muted-foreground">Effective Prototype Policy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-secondary tracking-tight">
          Privacy Policy & Security Practices
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          REPAIRLINK handles sensitive personal mobility and assistive seating information. We
          apply privacy-by-design and strict role-scoped access control across every user, workshop,
          and clinical lending portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-white border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-secondary">Row Level Security (RLS)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Database access policies in PostgreSQL/Supabase enforce that wheelchair users view only
            their own repair tickets, posture notes, and emergency contacts. Providers only see
            tickets matched or dispatched to their workshop.
          </p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-secondary">Clinical Seating Confidentiality</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Optional seating width, weight tolerance, and posture suitability details shared when
            requesting a temporary loaner wheelchair are disclosed exclusively to the verifying
            medical or rehabilitation institution coordinator.
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-white border-slate-200 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-secondary flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span>1. Information We Collect & Purpose</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>
              <strong>Account & Contact Information:</strong> Full name, email, phone number, city,
              and service address strictly to schedule doorstep mechanics or temporary chair delivery.
            </li>
            <li>
              <strong>Assistive Device Specifications:</strong> Wheelchair category, make, model,
              serial tag, and diagnostic images to match technicians carrying compatible parts.
            </li>
            <li>
              <strong>Institution & Technician Credentials:</strong> Workshop service certifications
              and hospital/NGO registrations audited by Platform Administrators prior to verification.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-secondary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>2. Prototype Simulation vs. Verified Real-World Notice</span>
          </h2>
          <p className="text-slate-600">
            This SBI Young Innovators Ideathon prototype includes seeded demonstration accounts,
            workshops, and Delhi NCR hospital inventory pools stored locally in browser{" "}
            <code>localStorage</code> and session cookies when live Supabase credentials are not
            attached. Real-world production deployments require signed Supabase Auth tokens and
            consent-audited clinical agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-secondary">3. Security Questions & Data Requests</h2>
          <p className="text-slate-600">
            To request account deletion, export your digital wheelchair maintenance logbook, or report
            a privacy concern, contact{" "}
            <span className="font-semibold text-primary">{APP_CONFIG.supportEmail}</span> or call{" "}
            <span className="font-semibold text-secondary">{APP_CONFIG.supportPhone}</span>.
          </p>
        </section>
      </Card>
    </div>
  );
}
