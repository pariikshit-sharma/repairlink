"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Info,
  Phone,
  FileText,
  User,
  MapPin,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InventoryWheelchair, TemporarySupportRequest } from "@/lib/supabase/types";
import { useAuth } from "@/context/auth-context";
import { useRepairs } from "@/context/repair-context";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { toast } from "sonner";

interface RequestTemporarySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelchair: InventoryWheelchair | null;
  onSuccess?: (request: TemporarySupportRequest) => void;
}

export function RequestTemporarySupportModal({
  isOpen,
  onClose,
  wheelchair,
  onSuccess,
}: RequestTemporarySupportModalProps) {
  const { user } = useAuth();
  const { repairRequests: userRepairRequests } = useRepairs();
  const { submitRequest } = useTemporarySupport();

  // Active repair tickets the user currently has
  const activeTickets = userRepairRequests.filter(
    (r) => r.status !== "request_closed" && r.status !== "cancelled"
  );

  // Form State
  const [userName, setUserName] = useState(user?.profile?.full_name || "Ramesh Kumar");
  const [userPhone, setUserPhone] = useState(user?.profile?.phone || "+91 98112 34567");
  const [userAddress, setUserAddress] = useState(
    user?.profile?.address || "Flat 402, Block C, Mayur Vihar Phase 1, New Delhi"
  );
  const [selectedTicket, setSelectedTicket] = useState(
    activeTickets.length > 0 ? activeTickets[0].ticket_number : "RL-2024-8941"
  );
  const [manualTicket, setManualTicket] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "hospital_delivery">("pickup");
  const [patientNotes, setPatientNotes] = useState(
    "Primary active chair in workshop for camber axle tube replacement. Need loaner for daily work and clinic visits."
  );
  const [userHeight, setUserHeight] = useState("172");
  const [userWeight, setUserWeight] = useState("68");
  const [suitabilityAcknowledged, setSuitabilityAcknowledged] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<TemporarySupportRequest | null>(null);

  if (!wheelchair) return null;

  // Compute dates
  const today = new Date();
  const startDateStr = today.toISOString().split("T")[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + durationDays);
  const endDateStr = endDate.toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !userPhone.trim() || !userAddress.trim()) {
      toast.error("Please complete your contact and address details");
      return;
    }

    if (!suitabilityAcknowledged) {
      toast.error("Please acknowledge the hospital clinical assessment guideline");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketId = manualTicket.trim() ? manualTicket.trim() : selectedTicket;

      const created = submitRequest({
        user_id: user?.id || "usr-demo-01",
        user_name: userName,
        user_phone: userPhone,
        user_email: user?.email || "patient@repairlink.org",
        user_address: userAddress,
        wheelchair_id: wheelchair.id,
        institution_id: wheelchair.institution_id,
        institution_name: wheelchair.institution_name,
        repair_ticket_id: ticketId || null,
        requested_start_date: startDateStr,
        requested_end_date: endDateStr,
        delivery_mode: deliveryMode,
        patient_medical_notes: `[Patient Specs: ${userHeight}cm, ${userWeight}kg] ${patientNotes}`,
      });

      setSubmittedRequest(created);
      if (onSuccess) onSuccess(created);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRequest(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-white border border-slate-200">
        {submittedRequest ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <Badge variant="success" className="text-xs">
                Application Dispatched
              </Badge>
              <h2 className="text-2xl font-black text-secondary">
                Temporary Mobility Request Confirmed!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your loan request for{" "}
                <strong className="text-secondary">{wheelchair.model_name}</strong> has been
                forwarded to the clinical team at{" "}
                <strong className="text-secondary">{wheelchair.institution_name}</strong>.
              </p>
            </div>

            {/* Request Summary Box */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Request Tracking Number
                  </span>
                  <div className="font-mono text-base font-extrabold text-primary">
                    #{submittedRequest.request_number}
                  </div>
                </div>
                <Badge variant="warning" className="text-xs">
                  Pending Hospital Review
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Requested Duration:</span>
                  <p className="font-bold text-secondary">
                    {durationDays} Days ({startDateStr} to {endDateStr})
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Handover Preference:</span>
                  <p className="font-bold text-secondary capitalize">
                    {deliveryMode === "pickup" ? "Depot Self-Pickup" : "Hospital Delivery"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Participating Facility:</span>
                  <p className="font-bold text-secondary">{wheelchair.institution_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact Helpline:</span>
                  <p className="font-bold text-secondary">{wheelchair.institution_phone}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-muted-foreground flex items-start gap-2 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>What happens next:</strong> The hospital assistive desk officer reviews
                  wheelchair dimensions against your posture notes. You will receive an SMS and dashboard
                  notification once approved for collection!
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button onClick={handleResetAndClose} className="w-full sm:w-auto font-bold px-8">
                Done & Return to Catalog
              </Button>
            </div>
          </div>
        ) : (
          /* Request Intake Form */
          <div>
            <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="accent" className="text-[10px] mb-1 font-bold">
                    Mobility Continuity Loan
                  </Badge>
                  <DialogTitle className="text-xl font-bold text-secondary">
                    Request Temporary Wheelchair
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Preserve your independence while your primary device is undergoing maintenance.
              </DialogDescription>
            </DialogHeader>

            {/* Selected Wheelchair Preview Strip */}
            <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                <Image
                  src={wheelchair.image_url}
                  alt={wheelchair.model_name}
                  fill
                  unoptimized={wheelchair.image_url?.startsWith("data:")}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-primary">
                    {wheelchair.serial_tag}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-secondary truncate">
                    {wheelchair.institution_name}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-secondary truncate">
                  {wheelchair.model_name}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Seat: {wheelchair.seat_width_cm}cm • Cap: {wheelchair.weight_capacity_kg}kg •{" "}
                  {wheelchair.manual_or_powered.toUpperCase()} •{" "}
                  {wheelchair.deposit_amount === 0 ? "Zero Deposit" : `₹${wheelchair.deposit_amount} Dep.`}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              {/* Patient Contact Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-secondary text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Applicant Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <Input
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Residential Address (Delhi NCR) *
                  </label>
                  <Input
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="House/Flat, Sector/Colony, City"
                    required
                  />
                </div>
              </div>

              {/* Linked Repair Ticket */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-secondary text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Link Primary Wheelchair Repair Ticket</span>
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  Connecting an active repair ticket accelerates clinical approval and qualifies for 100%
                  deposit waiver.
                </p>

                {activeTickets.length > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Select Active Repair Ticket:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeTickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTicket(t.ticket_number);
                            setManualTicket("");
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            selectedTicket === t.ticket_number && !manualTicket
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="font-mono font-bold text-xs text-primary">
                            #{t.ticket_number}
                          </div>
                          <div className="text-[11px] text-secondary font-medium truncate">
                            {t.wheelchair_summary.brand} {t.wheelchair_summary.model}
                          </div>
                          <div className="text-[10px] text-muted-foreground capitalize">
                            Status: {t.status.replace(/_/g, " ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enter Repair Ticket Number (or Workshop Intake Slip)
                    </label>
                    <Input
                      value={manualTicket}
                      onChange={(e) => setManualTicket(e.target.value)}
                      placeholder="e.g. RL-2024-8941 or Workshop Bill No."
                    />
                  </div>
                )}
              </div>

              {/* Loan Duration & Dates */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-secondary text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Estimated Loan Duration</span>
                  </h4>
                  <span className="text-[11px] font-bold text-primary">
                    {durationDays} Days ({startDateStr} → {endDateStr})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[3, 7, 10, 14, 21].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs border transition-all ${
                        durationDays === days
                          ? "bg-secondary text-white border-secondary shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Handover Delivery Mode */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-secondary text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Handover Mode</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryMode("pickup")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === "pickup"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-bold text-secondary block text-xs">
                      Self-Pickup at Hospital Counter
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Collect at {wheelchair.institution_name} mobility depot. Fast, zero handling charge.
                    </span>
                    <Badge variant="success" className="text-[10px] mt-2">
                      Instant Dispatch
                    </Badge>
                  </div>

                  <div
                    onClick={() => setDeliveryMode("hospital_delivery")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === "hospital_delivery"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-bold text-secondary block text-xs">
                      Doorstep Accessible Delivery
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Coordinated medical ambulance/delivery van to your residence in Delhi NCR.
                    </span>
                    <Badge variant="outline" className="text-[10px] mt-2">
                      Coordinated within 24h
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Seating Specs & Posture Requirements */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-secondary text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Ergonomic & Postural Safety Checklist</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      User Height (cm)
                    </label>
                    <Input
                      type="number"
                      value={userHeight}
                      onChange={(e) => setUserHeight(e.target.value)}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      User Weight (kg)
                    </label>
                    <Input
                      type="number"
                      value={userWeight}
                      onChange={(e) => setUserWeight(e.target.value)}
                      placeholder="65"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Special Posture or Cushioning Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Roho pressure relief cushion, right lateral trunk support, transfer board clearance"
                  />
                </div>

                {/* Important Clinical Advisory Box */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="suitability-checkbox"
                    checked={suitabilityAcknowledged}
                    onChange={(e) => setSuitabilityAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded border-amber-400 focus:ring-primary"
                  />
                  <label
                    htmlFor="suitability-checkbox"
                    className="text-[11px] text-amber-900 leading-relaxed cursor-pointer"
                  >
                    <strong>Medical Suitability & Assessment Clause:</strong> I understand that loaner
                    equipment availability and final clinical fit are determined by the participating
                    healthcare institution ({wheelchair.institution_name}) to prevent secondary skin
                    breakdown or postural misalignment.
                  </label>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold px-6 shadow-sm">
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Loan Request</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
