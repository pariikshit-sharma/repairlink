"use client";

import React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Truck,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemporarySupportRequest, LoanRequestStatus } from "@/lib/supabase/types";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { cn } from "@/lib/utils";

interface TemporaryRequestTrackerProps {
  request: TemporarySupportRequest;
  onCancel?: (requestId: string) => void;
}

export function TemporaryRequestTracker({ request, onCancel }: TemporaryRequestTrackerProps) {
  const { institutions } = useTemporarySupport();
  const institutionInfo = institutions.find((i) => i.id === request.institution_id);
  const steps: { key: LoanRequestStatus | "review"; title: string; desc: string }[] = [
    {
      key: "pending",
      title: "Request Logged",
      desc: "Application submitted to institution",
    },
    {
      key: "approved",
      title: "Clinically Approved",
      desc: "Wheelchair reserved at mobility depot",
    },
    {
      key: "lent_active",
      title: "Active Loan",
      desc: "Mobility continuity safeguard active",
    },
    {
      key: "returned",
      title: "Restocked",
      desc: "Returned, sanitized & verified",
    },
  ];

  const getStepIndex = (status: LoanRequestStatus) => {
    switch (status) {
      case "pending":
        return 0;
      case "approved":
        return 1;
      case "lent_active":
        return 2;
      case "returned":
        return 3;
      case "rejected":
      case "cancelled":
        return -1;
    }
  };

  const currentIndex = getStepIndex(request.status);

  return (
    <Card className="border-slate-200 shadow-subtle bg-white overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="bg-slate-50 border-b border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black text-primary px-2.5 py-0.5 rounded bg-primary/10">
              #{request.request_number}
            </span>
            {request.repair_ticket_id && (
              <Badge variant="outline" className="text-[11px] font-medium">
                Linked Repair: #{request.repair_ticket_id}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-secondary">
            {request.wheelchair?.model_name || "Loaner Wheelchair Support"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{request.institution_name}</span>
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {request.status === "pending" && (
            <Badge variant="warning" className="text-xs font-bold">
              <Clock className="w-3 h-3 mr-1" /> Awaiting Review
            </Badge>
          )}
          {request.status === "approved" && (
            <Badge variant="success" className="text-xs font-bold">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Approved & Reserved
            </Badge>
          )}
          {request.status === "lent_active" && (
            <Badge variant="default" className="text-xs font-bold bg-primary text-white">
              <ShieldCheck className="w-3 h-3 mr-1" /> Currently In Use
            </Badge>
          )}
          {request.status === "returned" && (
            <Badge variant="outline" className="text-xs font-bold text-slate-600 bg-slate-100">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed & Returned
            </Badge>
          )}
          {request.status === "rejected" && (
            <Badge variant="destructive" className="text-xs font-bold">
              Declined
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Progress Milestone Stepper */}
        {request.status !== "rejected" && request.status !== "cancelled" ? (
          <div className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => {
                const isCompleted = currentIndex > idx;
                const isCurrent = currentIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all mb-2 shadow-xs",
                        isCompleted
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                          : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20 scale-105"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold block",
                        isCurrent ? "text-primary" : isCompleted ? "text-secondary" : "text-slate-400"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[140px] leading-tight">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "p-4 rounded-xl border text-xs flex items-start gap-2.5",
              request.status === "cancelled"
                ? "bg-slate-100 border-slate-200 text-slate-800"
                : "bg-red-50 border-red-200 text-red-900"
            )}
          >
            <AlertCircle
              className={cn(
                "w-4 h-4 shrink-0 mt-0.5",
                request.status === "cancelled" ? "text-slate-500" : "text-red-600"
              )}
            />
            <div>
              <strong>Request Status: {request.status.toUpperCase()}</strong>
              <p className="mt-1">
                {request.institution_notes || "Clinical matching could not be approved at this time."}
              </p>
            </div>
          </div>
        )}

        {/* Operational Coordination Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Left details */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-secondary font-bold">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Loan Schedule & Handover</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested Period:</span>
                <span className="font-bold text-secondary">
                  {request.requested_start_date} → {request.requested_end_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Handover Mode:</span>
                <span className="font-bold text-secondary capitalize">
                  {request.delivery_mode === "pickup" ? "Depot Self-Pickup" : "Doorstep Delivery"}
                </span>
              </div>
              {request.expected_return_date && (
                <div className="flex justify-between border-t border-slate-200 pt-1 text-emerald-800">
                  <span className="font-medium">Scheduled Return Deadline:</span>
                  <span className="font-bold">{request.expected_return_date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right details: Institutional Action / Pickup & Return Coordination */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-secondary font-bold">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Pickup & Return Coordination Desk</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-emerald-950">
              <p className="font-semibold text-[11px] leading-relaxed">
                {request.pickup_instructions ||
                  "Awaiting institution assignment. When approved, counter location and pickup time slot will appear here."}
              </p>
              {institutionInfo && (
                <div className="pt-1.5 border-t border-emerald-200/70 space-y-1 text-[10px] text-emerald-900">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-emerald-700" />
                    <span>{institutionInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      {institutionInfo.counterHours}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono font-semibold">
                      <Phone className="w-3 h-3 text-emerald-700" />
                      {institutionInfo.phone}
                    </span>
                  </div>
                </div>
              )}
              {request.institution_notes && (
                <p className="text-[10px] text-emerald-800/90 pt-1 border-t border-emerald-200">
                  <strong>Rehab Note: </strong>
                  {request.institution_notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Notes & Cancel Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {request.patient_medical_notes && (
            <div className="p-3 rounded-lg bg-slate-50 text-slate-600 text-[11px] border border-slate-100 flex items-start gap-2 flex-1">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Seating & Diagnostic Note: </strong>
                {request.patient_medical_notes}
              </span>
            </div>
          )}

          {onCancel && (request.status === "pending" || request.status === "approved") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(request.id)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0"
            >
              Cancel Application
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
