import React from "react";
import Link from "next/link";
import { FileCheck2, Scale, HeartHandshake, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="px-0 text-xs font-bold text-primary">
          <Link href="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Home
          </Link>
        </Button>
        <Badge variant="default" className="text-xs font-bold">
          Platform Governance
        </Badge>
        <h1 className="text-3xl font-extrabold text-secondary tracking-tight">
          Terms of Service & Service Commitments
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Clear rules governing transparent quotations, temporary loaner eligibility, sanitization
          accountability, and partner verification on REPAIRLINK.
        </p>
      </div>

      <Card className="p-6 bg-white border-slate-200 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-secondary flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-primary" />
            <span>1. Upfront Quotations & User Approval</span>
          </h2>
          <p className="text-slate-600">
            Repair providers must issue an itemized digital quotation detailing replacement parts,
            labor charges, and estimated turnaround time prior to commencing chargeable work.
            Wheelchair users retain the right to approve or decline any quotation without hidden
            cancellation fees before work begins.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-secondary flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <span>2. Temporary Wheelchair Loaner Allocation</span>
          </h2>
          <p className="text-slate-600">
            Listing an available loaner wheelchair on REPAIRLINK constitutes an invitation to request
            temporary support, not an unconditional dispatch guarantee. Participating hospitals,
            rehabilitation centres, and NGOs reserve full clinical discretion to approve or decline a
            reservation based on seating measurements, weight ratings, and active inventory availability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-secondary flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <span>3. Return Condition & Partner Accountability</span>
          </h2>
          <p className="text-slate-600">
            Borrowers agree to return temporary loaner equipment on or before the agreed return date
            once primary wheelchair servicing completes. Participating institutions commit to inspecting
            brakes, casters, and cushions and logging sanitization checks before re-listing returned
            units as Available. Platform Administrators may suspend accounts violating SLA or safety
            guidelines.
          </p>
        </section>
      </Card>
    </div>
  );
}
