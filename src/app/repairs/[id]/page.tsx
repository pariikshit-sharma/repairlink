"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Star,
  Check,
  X,
  Send,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRepairs, STATUS_CONFIG } from "@/context/repair-context";
import { useAuth } from "@/context/auth-context";
import { RepairLifecycleStatus } from "@/lib/supabase/types";
import { toast } from "sonner";

export default function RepairTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params?.id as string) || "RL-2024-8941";

  const {
    getRepairById,
    userAcceptQuotation,
    userDeclineQuotation,
    updateRepairStatus,
    cancelRepairRequest,
    submitReview,
  } = useRepairs();

  const { user } = useAuth();
  const repair = getRepairById(ticketId) || getRepairById("RL-2024-8941");

  // Modals state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (!repair) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-error mx-auto" />
        <h1 className="text-xl font-bold text-secondary">Repair Ticket Not Found</h1>
        <p className="text-xs text-muted-foreground">The requested service ticket does not exist or has been archived.</p>
        <Button asChild size="sm">
          <Link href="/dashboard/user">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const currentStatusConfig = STATUS_CONFIG[repair.status] || STATUS_CONFIG.request_submitted;

  // The 7 progressive lifecycle milestones (excluding cancelled)
  const LIFECYCLE_STEPS: { key: RepairLifecycleStatus; label: string; stepNum: number }[] = [
    { key: "request_submitted", label: "Request Submitted", stepNum: 1 },
    { key: "provider_reviewing", label: "Provider Reviewing", stepNum: 2 },
    { key: "quotation_received", label: "Quotation Generated", stepNum: 3 },
    { key: "service_scheduled", label: "Service Scheduled", stepNum: 4 },
    { key: "repair_in_progress", label: "Repair In Progress", stepNum: 5 },
    { key: "repair_completed", label: "Repair Completed", stepNum: 6 },
    { key: "request_closed", label: "Request Closed", stepNum: 7 },
  ];

  const currentStepNumber = currentStatusConfig.step;

  // Handlers
  const handleAcceptQuote = () => {
    userAcceptQuotation(repair.id);
  };

  const handleConfirmDeclineQuote = () => {
    if (!declineReason.trim()) {
      toast.error("Please state a reason for declining the quote.");
      return;
    }
    userDeclineQuotation(repair.id, declineReason);
    setDeclineModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    cancelRepairRequest(repair.id, cancelReason);
    setCancelModalOpen(false);
  };

  const handleConfirmReview = () => {
    submitReview(repair.id, reviewRating, reviewComment);
    setReviewModalOpen(false);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs font-semibold text-secondary hover:text-primary pl-0 mb-1"
          >
            <Link href="/dashboard/user?tab=requests" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Requests</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
              Ticket #{repair.ticket_number}
            </h1>
            <Badge
              variant={
                repair.status === "cancelled"
                  ? "destructive"
                  : repair.status === "request_closed"
                  ? "success"
                  : "default"
              }
              className="text-xs font-bold py-1 px-2.5"
            >
              {currentStatusConfig.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged: {new Date(repair.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • Service Preference: {repair.service_preference.replace("_", " ").toUpperCase()}
          </p>
        </div>

        {/* Quick Role Simulation Control for Evaluation */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs flex flex-col items-end gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Ideathon Lifecycle Controls
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {repair.status === "service_scheduled" && (
              <Button
                size="sm"
                onClick={() => updateRepairStatus(repair.id, "repair_in_progress")}
                className="text-[11px] h-7 bg-primary text-white font-bold"
              >
                Mark In Progress ⚙
              </Button>
            )}
            {repair.status === "repair_in_progress" && (
              <Button
                size="sm"
                onClick={() => updateRepairStatus(repair.id, "repair_completed")}
                className="text-[11px] h-7 bg-emerald-700 text-white font-bold"
              >
                Mark Completed ✓
              </Button>
            )}
            {repair.status === "repair_completed" && (
              <Button
                size="sm"
                onClick={() => setReviewModalOpen(true)}
                className="text-[11px] h-7 bg-primary text-white font-bold"
              >
                Review & Close ★
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Progress Timeline (All 8 Lifecycle Steps) */}
      <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
          Repair Lifecycle Progress Timeline
        </h2>

        {repair.status === "cancelled" ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">This repair request has been cancelled.</p>
              <p className="text-[11px] mt-0.5">Reason: {repair.cancellation_reason || "Cancelled by user"}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop timeline track */}
            <div className="hidden lg:grid grid-cols-7 gap-2 relative z-10 text-center">
              {LIFECYCLE_STEPS.map((step) => {
                const isPassed = step.stepNum <= currentStepNumber;
                const isCurrent = step.stepNum === currentStepNumber;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20 scale-110 animate-pulse"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-muted-foreground border border-slate-200"
                      }`}
                    >
                      {isPassed && !isCurrent ? <Check className="w-4 h-4 stroke-[3]" /> : step.stepNum}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 leading-tight ${
                        isCurrent
                          ? "text-primary"
                          : isPassed
                          ? "text-secondary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="lg:hidden space-y-3">
              {LIFECYCLE_STEPS.map((step) => {
                const isPassed = step.stepNum <= currentStepNumber;
                const isCurrent = step.stepNum === currentStepNumber;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrent
                          ? "bg-primary text-white ring-2 ring-primary/20 animate-pulse"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-muted-foreground"
                      }`}
                    >
                      {isPassed && !isCurrent ? <Check className="w-3.5 h-3.5" /> : step.stepNum}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-primary font-bold" : isPassed ? "text-secondary" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Main Grid: Details Left, Quotation / Actions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Malfunction Details & Full History Audit */}
        <div className="lg:col-span-7 space-y-6">
          {/* Diagnostic Summary */}
          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-secondary">
              Diagnostic & Device Information
            </h3>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 text-xs">
              <div>
                <span className="text-muted-foreground">Wheelchair:</span>
                <p className="font-bold text-secondary mt-0.5">{repair.wheelchair_summary.brand} {repair.wheelchair_summary.model}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Problem Category:</span>
                <p className="font-bold text-primary mt-0.5">{repair.issue_category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Service Preference:</span>
                <p className="font-bold text-secondary mt-0.5 uppercase">{repair.service_preference.replace("_", " ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned Technician:</span>
                <p className="font-bold text-secondary mt-0.5">{repair.provider_name || "Apex Mobility Hub"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-secondary">Customer Description:</span>
              <p className="text-xs text-secondary/85 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                {repair.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Service Location: <strong className="text-secondary">{repair.service_address}</strong></span>
            </div>
          </Card>

          {/* Differentiated Temporary Mobility Support Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-accent/30 to-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Need Temporary Loaner Wheelchair?</h4>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  AIIMS & ISIC partner hospital inventories are available for zero mobility pause while your chair is serviced.
                </p>
              </div>
            </div>

            <Button size="sm" asChild className="text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shrink-0">
              <Link href="/temporary-support">
                Request Loaner
              </Link>
            </Button>
          </div>

          {/* Status History Audit Trail */}
          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl">
            <h3 className="text-base font-bold text-secondary mb-4">
              Status Milestone History Log
            </h3>

            <div className="divide-y divide-slate-100">
              {repair.status_history.map((hist) => (
                <div key={hist.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary">{hist.status_label}</span>
                    <span className="text-[10px] text-muted-foreground">{hist.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600">{hist.notes}</p>
                  <span className="text-[10px] text-muted-foreground italic">
                    Logged by: {hist.changed_by_name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Itemized Quotation & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quotation Card */}
          {repair.quotation ? (
            <Card className="border-slate-200 bg-white shadow-elevated rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Itemized Quotation
                  </span>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </div>
                <Badge
                  variant={
                    repair.quotation.status === "accepted"
                      ? "success"
                      : repair.quotation.status === "declined"
                      ? "destructive"
                      : "warning"
                  }
                  className="text-xs font-bold"
                >
                  {repair.quotation.status.toUpperCase()}
                </Badge>
              </div>

              {/* Itemized list */}
              <div className="space-y-2 divide-y divide-slate-100 text-xs">
                {repair.quotation.itemized_items.map((item) => (
                  <div key={item.id} className="flex justify-between pt-2">
                    <span className="text-secondary font-medium">{item.title}</span>
                    <span className="font-bold text-secondary">₹{item.cost}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Parts Subtotal:</span>
                  <span>₹{repair.quotation.parts_cost}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Labor & Calibration:</span>
                  <span>₹{repair.quotation.labor_cost}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-secondary pt-2 border-t border-slate-200">
                  <span>Total Approved Quote:</span>
                  <span className="text-primary text-base">₹{repair.quotation.total_cost}</span>
                </div>
              </div>

              {repair.quotation.estimated_completion && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Est. Completion:</span>
                  <strong className="text-secondary">{repair.quotation.estimated_completion}</strong>
                </div>
              )}

              {/* Quotation Action Buttons (if pending user approval) */}
              {repair.quotation.status === "pending" && repair.status === "quotation_received" && (
                <div className="pt-2 space-y-2">
                  <Button
                    size="default"
                    onClick={handleAcceptQuote}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    <span>Approve Quotation (₹{repair.quotation.total_cost})</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeclineModalOpen(true)}
                    className="w-full text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    <span>Decline Quotation</span>
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-secondary">Awaiting Provider Quotation</h3>
              <p className="text-xs text-muted-foreground">
                Technician is evaluating your reported issue and will submit an itemized quote with parts and labor.
              </p>
            </Card>
          )}

          {/* Assigned Technician Card */}
          <Card className="p-5 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-secondary uppercase tracking-wider text-[11px]">
              Assigned Service Partner
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-secondary">{repair.provider_name || "Apex Mobility Diagnostics"}</p>
                <p className="text-muted-foreground">Lead Tech: Vikram Sharma</p>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold">
              <a href="tel:+919811254321" className="flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Call Technician Desk</span>
              </a>
            </Button>
          </Card>

          {/* User Cancellation Option (where permitted) */}
          {(repair.status === "request_submitted" || repair.status === "quotation_received") && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-error underline transition-colors"
              >
                Cancel this repair request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decline Quotation Modal */}
      <Dialog open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Quotation</DialogTitle>
            <DialogDescription>
              Please let us know why you are declining this repair quotation:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <textarea
              rows={3}
              className="flex w-full rounded-lg border border-slate-300 p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. Quoted cost is too high / Found an alternative repairer / Postponing service..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeclineModalOpen(false)}>
              Back
            </Button>
            <Button size="sm" variant="destructive" onClick={handleConfirmDeclineQuote}>
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Request Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Repair Request #{repair.ticket_number}</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this service ticket?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <textarea
              rows={3}
              className="flex w-full rounded-lg border border-slate-300 p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="State reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Request
            </Button>
            <Button size="sm" variant="destructive" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completed Repair Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate & Review Completed Service</DialogTitle>
            <DialogDescription>
              Your feedback verifies technician quality for the entire wheelchair community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5 text-center">
              <span className="font-bold text-secondary">Overall Technician Rating:</span>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating
                          ? "fill-amber-500 text-amber-500"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-secondary">Review Comments:</label>
              <textarea
                rows={3}
                className="flex w-full rounded-lg border border-slate-300 p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="How was the punctuality, part quality, and wheelchair alignment?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Skip
            </Button>
            <Button size="sm" onClick={handleConfirmReview} className="bg-primary hover:bg-primary-600 font-bold">
              Submit Review & Close Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
