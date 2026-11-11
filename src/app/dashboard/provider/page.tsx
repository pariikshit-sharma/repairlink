"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  Send,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Activity,
  History,
  Settings,
  MessageSquarePlus,
  Star,
  MapPin,
  Power,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { usePlatform } from "@/context/platform-context";
import { RepairRequest, ItemizedCostItem, ProviderDetails } from "@/lib/supabase/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ProviderTab = "incoming" | "quotations" | "active" | "history" | "profile";

function ProviderDashboardContent() {
  const searchParams = useSearchParams();
  const paramTab = searchParams?.get("tab") as ProviderTab | null;

  const { user, switchDemoRole, updateCurrentUserProfile } = useAuth();
  const { categories } = usePlatform();
  const {
    repairRequests,
    providerAcceptRequest,
    providerDeclineRequest,
    submitQuotation,
    updateRepairStatus,
    addServiceNote,
  } = useRepairs();

  const [activeTab, setActiveTab] = useState<ProviderTab>(paramTab || "incoming");

  useEffect(() => {
    if (
      paramTab &&
      ["incoming", "quotations", "active", "history", "profile"].includes(paramTab)
    ) {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  // Provider Profile & Availability state synced with AuthContext
  const providerDetails = (user?.details as ProviderDetails | null) || null;
  const [isAvailable, setIsAvailable] = useState<boolean>(
    providerDetails?.is_available ?? true
  );
  const [businessName, setBusinessName] = useState(
    providerDetails?.business_name || "Apex Mobility Diagnostics & Servicing"
  );
  const [contactName, setContactName] = useState(
    user?.profile?.full_name || "Vikram Sharma (Apex Mobility)"
  );
  const [contactPhone, setContactPhone] = useState(
    user?.profile?.phone || "+91 98223 54321"
  );
  const [workshopAddress, setWorkshopAddress] = useState(
    user?.profile?.address || "14 Okhla Industrial Area Phase 3, New Delhi"
  );
  const [city, setCity] = useState(user?.profile?.city || "New Delhi");
  const [serviceRadius, setServiceRadius] = useState(
    String(providerDetails?.service_radius_km ?? 30)
  );
  const [experienceYears, setExperienceYears] = useState(
    providerDetails?.experience_years || "5+ years"
  );
  const [certificationDetails, setCertificationDetails] = useState(
    providerDetails?.certification_details ||
      "Certified Assistive Technology Repair Specialist (ISPO India Affiliated)"
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    providerDetails?.service_categories || [
      "Brake Repairs",
      "Motor & Battery Diagnostics",
      "Spoke Welding",
    ]
  );
  const [selectedWheelchairTypes, setSelectedWheelchairTypes] = useState<string[]>(
    providerDetails?.supported_wheelchair_types || [
      "Manual Active Rigid",
      "Standard Folding Transit",
      "Motorized / Electric Powerchair",
    ]
  );

  // Quotation Builder Modal State
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [selectedTicketForQuote, setSelectedTicketForQuote] = useState<RepairRequest | null>(null);
  const [estimatedCompletion, setEstimatedCompletion] = useState("Tomorrow, 04:00 PM");
  const [quoteNotes, setQuoteNotes] = useState(
    "Replacement of high-tensile spokes and precision caster bearings."
  );
  const [itemizedList, setItemizedList] = useState<ItemizedCostItem[]>([
    { id: "1", title: "Stainless Steel High-Tensile Spokes (x4)", category: "parts", cost: 250 },
    { id: "2", title: "Precision Sealed Caster Bearing 608RS", category: "parts", cost: 200 },
    { id: "3", title: "Wheel Truing, Alignment & Doorstep Labor", category: "labor", cost: 400 },
  ]);

  // Decline Modal State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedTicketForDecline, setSelectedTicketForDecline] = useState<RepairRequest | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Service Note Modal State
  const [noteModalTicket, setNoteModalTicket] = useState<RepairRequest | null>(null);
  const [serviceNoteText, setServiceNoteText] = useState("");

  // Dynamic Metrics & Filtered Buckets from Real Records
  const totalRequests = repairRequests.length;
  const incomingList = useMemo(
    () =>
      repairRequests.filter(
        (r) => r.status === "request_submitted" || r.status === "provider_reviewing"
      ),
    [repairRequests]
  );
  const quotationsList = useMemo(
    () =>
      repairRequests.filter(
        (r) => r.quotation !== null && r.quotation !== undefined
      ),
    [repairRequests]
  );
  const activeRepairsList = useMemo(
    () =>
      repairRequests.filter(
        (r) =>
          r.status === "quotation_received" ||
          r.status === "awaiting_user_approval" ||
          r.status === "service_scheduled" ||
          r.status === "repair_in_progress"
      ),
    [repairRequests]
  );
  const completedList = useMemo(
    () =>
      repairRequests.filter(
        (r) =>
          r.status === "repair_completed" ||
          r.status === "request_closed" ||
          r.status === "cancelled"
      ),
    [repairRequests]
  );
  const completedSuccessCount = useMemo(
    () =>
      repairRequests.filter(
        (r) => r.status === "repair_completed" || r.status === "request_closed"
      ).length,
    [repairRequests]
  );

  // Average rating computed from real reviews
  const averageRating = useMemo(() => {
    const rated = repairRequests.filter((r) => typeof r.rating === "number" && r.rating > 0);
    if (rated.length === 0) return providerDetails?.rating?.toFixed(1) || "4.9";
    const avg = rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length;
    return avg.toFixed(1);
  }, [repairRequests, providerDetails]);

  // Recent Activity derived from actual ticket status_history
  const recentActivityFeed = useMemo(() => {
    const items: {
      id: string;
      ticketNumber: string;
      label: string;
      notes: string;
      actor: string;
      timestamp: string;
    }[] = [];

    repairRequests.forEach((req) => {
      req.status_history.forEach((h) => {
        items.push({
          id: `${req.id}-${h.id}`,
          ticketNumber: req.ticket_number,
          label: h.status_label,
          notes: h.notes || "",
          actor: h.changed_by_name,
          timestamp: h.timestamp,
        });
      });
    });

    return items.reverse().slice(0, 8);
  }, [repairRequests]);

  const repairCategoryOptions = categories.filter(
    (c) => c.kind === "repair_issue" && c.is_active
  );
  const deviceTypeOptions = categories.filter(
    (c) => c.kind === "wheelchair_type" && c.is_active
  );

  // Handlers
  const handleToggleAvailability = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    updateCurrentUserProfile({}, { is_available: next });
    toast.success(
      next
        ? "Status: Accepting New Dispatch Requests"
        : "Status: Workshop Marked Busy / Paused"
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile(
      {
        full_name: contactName,
        phone: contactPhone,
        address: workshopAddress,
        city,
      },
      {
        business_name: businessName,
        service_radius_km: parseInt(serviceRadius, 10) || 25,
        experience_years: experienceYears,
        certification_details: certificationDetails,
        service_categories: selectedServices,
        supported_wheelchair_types: selectedWheelchairTypes,
        is_available: isAvailable,
      }
    );
    toast.success("Business profile & capabilities saved!");
  };

  const handleOpenQuotation = (ticket: RepairRequest) => {
    setSelectedTicketForQuote(ticket);
    if (ticket.quotation) {
      setEstimatedCompletion(ticket.quotation.estimated_completion);
      setQuoteNotes(ticket.quotation.notes);
      setItemizedList(ticket.quotation.itemized_items);
    }
    setQuotationModalOpen(true);
  };

  const handleAddItem = () => {
    setItemizedList([
      ...itemizedList,
      { id: `item-${Date.now()}`, title: "New Part / Labor Item", category: "parts", cost: 150 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItemizedList(itemizedList.filter((item) => item.id !== id));
  };

  const handleConfirmQuotation = () => {
    if (!selectedTicketForQuote) return;
    const calcParts = itemizedList
      .filter((i) => i.category === "parts")
      .reduce((sum, i) => sum + i.cost, 0);
    const calcLabor = itemizedList
      .filter((i) => i.category === "labor" || i.category === "inspection")
      .reduce((sum, i) => sum + i.cost, 0);

    submitQuotation(selectedTicketForQuote.id, {
      partsCost: calcParts,
      laborCost: calcLabor,
      estimatedCompletion,
      notes: quoteNotes,
      items: itemizedList,
    });

    setQuotationModalOpen(false);
  };

  const handleSubmitServiceNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalTicket || !serviceNoteText.trim()) return;
    addServiceNote(noteModalTicket.id, serviceNoteText);
    setServiceNoteText("");
    setNoteModalTicket(null);
  };

  const toggleSelection = (item: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant="secondary" className="text-xs">
              Repair Provider Operations
            </Badge>
            <Badge variant="accent" className="text-xs font-bold">
              {businessName}
            </Badge>
            <Badge
              variant={isAvailable ? "success" : "warning"}
              className="text-xs font-bold"
            >
              {isAvailable ? "Accepting Dispatches" : "Paused / At Capacity"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Provider Repair Desk & Quotation Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Accept repair tickets, submit itemized digital quotations, log service notes, and manage workshop availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant={isAvailable ? "outline" : "default"}
            onClick={handleToggleAvailability}
            className="text-xs font-bold"
          >
            <Power className="w-3.5 h-3.5 mr-1.5" />
            <span>{isAvailable ? "Pause Availability" : "Go Online / Available"}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => switchDemoRole("user")}
            className="text-xs font-bold text-primary hover:bg-primary/5"
          >
            Evaluate as Wheelchair User →
          </Button>
        </div>
      </div>

      {/* Metrics Row (Computed Directly from Live Records) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Requests</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-secondary">{totalRequests}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Synced platform tickets</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Pending Review</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{incomingList.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Needs triage / quotation</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Active Repairs</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary">{activeRepairsList.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Quoted & in-progress</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Completed Repairs</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{completedSuccessCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {averageRating} ★ Average User Rating
          </p>
        </Card>
      </div>

      {/* Main Operational Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-4 sm:gap-6 no-scrollbar">
        {[
          { id: "incoming", label: "Incoming Requests", count: incomingList.length },
          { id: "quotations", label: "Quotations", count: quotationsList.length },
          { id: "active", label: "Active Repairs", count: activeRepairsList.length },
          { id: "history", label: "Service History", count: completedList.length },
          { id: "profile", label: "Business Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ProviderTab)}
            className={cn(
              "pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-secondary"
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <Badge
                variant={activeTab === tab.id ? "default" : "outline"}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Grid Layout with Recent Activity Sidebar on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Operational Pane */}
        <div className="lg:col-span-8 space-y-4">
          {/* TAB 1: INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <Card className="border-slate-200 shadow-subtle bg-white">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Inbound Triage Queue</CardTitle>
                  <CardDescription className="text-xs">
                    Accept diagnostic jobs, build itemized quotations, or decline out-of-scope requests.
                  </CardDescription>
                </div>
                <Badge variant="warning" className="text-xs font-bold">
                  {incomingList.length} Pending
                </Badge>
              </CardHeader>

              <CardContent className="pt-4 divide-y divide-slate-100">
                {incomingList.length > 0 ? (
                  incomingList.map((req) => {
                    const config = STATUS_CONFIG[req.status];
                    return (
                      <div key={req.id} className="py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-secondary text-sm">
                                #{req.ticket_number}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {req.wheelchair_summary.brand} {req.wheelchair_summary.model}
                              </Badge>
                              <Badge variant="warning" className="text-[10px] font-bold">
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-xs font-semibold text-secondary">
                              <span className="text-primary">{req.issue_category}</span> —{" "}
                              {req.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <span>
                                Customer: <strong className="text-secondary">{req.user_name}</strong>
                              </span>
                              <span>•</span>
                              <span>{req.service_address}</span>
                              <span>•</span>
                              <span className="uppercase font-semibold text-secondary">
                                {req.service_preference}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {req.status === "request_submitted" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTicketForDecline(req);
                                    setDeclineModalOpen(true);
                                  }}
                                  className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => providerAcceptRequest(req.id)}
                                  className="text-xs font-bold bg-primary hover:bg-primary-hover text-white"
                                >
                                  Accept & Review
                                </Button>
                              </>
                            )}
                            {req.status === "provider_reviewing" && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenQuotation(req)}
                                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                              >
                                <DollarSign className="w-3.5 h-3.5 mr-1" />
                                <span>Build Quotation</span>
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" asChild className="text-xs font-semibold">
                              <Link href={`/repairs/${req.ticket_number}`}>Details →</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-sm font-bold text-secondary">No Pending Triage Requests</p>
                    <p className="text-xs text-muted-foreground">
                      Check Active Repairs or Quotations tabs for ongoing work.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2: QUOTATIONS */}
          {activeTab === "quotations" && (
            <Card className="border-slate-200 shadow-subtle bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base sm:text-lg">Issued Digital Quotations</CardTitle>
                <CardDescription className="text-xs">
                  Track customer approval status and itemized parts & labor estimates.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-slate-100">
                {quotationsList.length > 0 ? (
                  quotationsList.map((req) => (
                    <div key={req.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-secondary text-sm">
                              #{req.ticket_number}
                            </span>
                            <Badge
                              variant={
                                req.quotation?.status === "accepted"
                                  ? "success"
                                  : req.quotation?.status === "declined"
                                  ? "destructive"
                                  : "warning"
                              }
                              className="text-[10px] uppercase font-bold"
                            >
                              Quote {req.quotation?.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {req.user_name} • {req.wheelchair_summary.brand}{" "}
                            {req.wheelchair_summary.model}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-primary">
                            ₹{req.quotation?.total_cost}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            Parts ₹{req.quotation?.parts_cost} + Labor ₹{req.quotation?.labor_cost}
                          </span>
                        </div>
                      </div>

                      {req.quotation?.itemized_items && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                          {req.quotation.itemized_items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span className="text-secondary">{item.title}</span>
                              <span className="font-semibold text-secondary">₹{item.cost}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted-foreground">
                          Est. Completion: <strong>{req.quotation?.estimated_completion}</strong>
                        </span>
                        <Link
                          href={`/repairs/${req.ticket_number}`}
                          className="text-primary font-bold hover:underline"
                        >
                          Open Ticket Timeline →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    No quotations have been generated yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 3: ACTIVE REPAIRS */}
          {activeTab === "active" && (
            <Card className="border-slate-200 shadow-subtle bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base sm:text-lg">Active Repairs in Workshop / Field</CardTitle>
                <CardDescription className="text-xs">
                  Advance milestones, record live diagnostic service notes, and sign off finished jobs.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-slate-100">
                {activeRepairsList.length > 0 ? (
                  activeRepairsList.map((req) => {
                    const config = STATUS_CONFIG[req.status];
                    return (
                      <div key={req.id} className="py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-secondary text-sm">
                                #{req.ticket_number}
                              </span>
                              <Badge variant="default" className="text-[10px] font-bold">
                                {config.label}
                              </Badge>
                              {req.quotation && (
                                <Badge variant="outline" className="text-[10px]">
                                  ₹{req.quotation.total_cost}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-secondary">
                              {req.wheelchair_summary.brand} {req.wheelchair_summary.model} —{" "}
                              <span className="text-primary">{req.issue_category}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Customer: {req.user_name} ({req.user_phone}) • {req.service_address}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setNoteModalTicket(req);
                                setServiceNoteText("");
                              }}
                              className="text-xs font-semibold"
                            >
                              <MessageSquarePlus className="w-3.5 h-3.5 mr-1" />
                              <span>Add Note</span>
                            </Button>

                            {req.status === "service_scheduled" && (
                              <Button
                                size="sm"
                                onClick={() => updateRepairStatus(req.id, "repair_in_progress")}
                                className="text-xs font-bold bg-primary hover:bg-primary-hover text-white"
                              >
                                <Wrench className="w-3.5 h-3.5 mr-1" />
                                <span>Start Repair</span>
                              </Button>
                            )}

                            {req.status === "repair_in_progress" && (
                              <Button
                                size="sm"
                                onClick={() => updateRepairStatus(req.id, "repair_completed")}
                                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Mark Completed</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {req.status_history.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-muted-foreground">
                            <strong className="text-secondary">Latest Log: </strong>
                            {req.status_history[req.status_history.length - 1].notes} (
                            {req.status_history[req.status_history.length - 1].timestamp})
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    No active repairs currently scheduled or in progress.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 4: COMPLETED REPAIRS & SERVICE HISTORY */}
          {activeTab === "history" && (
            <Card className="border-slate-200 shadow-subtle bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base sm:text-lg">Completed Repairs & Service History</CardTitle>
                <CardDescription className="text-xs">
                  Finalized repairs, cancelled records, and verified customer satisfaction ratings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-slate-100">
                {completedList.length > 0 ? (
                  completedList.map((req) => {
                    const config = STATUS_CONFIG[req.status];
                    return (
                      <div key={req.id} className="py-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-secondary text-sm">
                                #{req.ticket_number}
                              </span>
                              <Badge
                                variant={req.status === "cancelled" ? "destructive" : "success"}
                                className="text-[10px]"
                              >
                                {config.label}
                              </Badge>
                              {req.rating && (
                                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  {req.rating}/5
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-secondary mt-1">
                              {req.wheelchair_summary.brand} {req.wheelchair_summary.model} —{" "}
                              {req.issue_category}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            {req.quotation && (
                              <span className="font-bold text-emerald-700 block">
                                ₹{req.quotation.total_cost} Billed
                              </span>
                            )}
                            <Link
                              href={`/repairs/${req.ticket_number}`}
                              className="text-primary font-bold hover:underline"
                            >
                              View Audit Log →
                            </Link>
                          </div>
                        </div>

                        {req.review_comment && (
                          <p className="text-xs italic text-slate-600 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                            &ldquo;{req.review_comment}&rdquo; — {req.user_name}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    No completed repair history recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 5: BUSINESS PROFILE & CAPABILITIES */}
          {activeTab === "profile" && (
            <Card className="border-slate-200 shadow-subtle bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base sm:text-lg">Business Profile & Workshop Availability</CardTitle>
                <CardDescription className="text-xs">
                  Keep your supported wheelchair types, certifications, and dispatch radius updated.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-secondary block">Live Dispatch Availability</span>
                      <span className="text-[11px] text-muted-foreground">
                        Toggle off during holidays or workshop backlog
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isAvailable ? "default" : "outline"}
                      onClick={handleToggleAvailability}
                      className="text-xs font-bold"
                    >
                      {isAvailable ? "Online & Available" : "Paused"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Business / Workshop Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                    <Input
                      label="Lead Technician Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Contact Phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                    <Input
                      label="Service City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                    <Input
                      label="Service Radius (km)"
                      type="number"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Workshop Street Address"
                    value={workshopAddress}
                    onChange={(e) => setWorkshopAddress(e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Field Experience"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                    <Input
                      label="Trade / Clinical Certifications"
                      value={certificationDetails}
                      onChange={(e) => setCertificationDetails(e.target.value)}
                    />
                  </div>

                  {/* Platform Categories Selection */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-secondary">
                      Repair Capabilities (Platform Categories)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {repairCategoryOptions.map((cat) => {
                        const checked = selectedServices.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              toggleSelection(cat.name, selectedServices, setSelectedServices)
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                              checked
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-secondary">
                      Supported Wheelchair Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {deviceTypeOptions.map((cat) => {
                        const checked = selectedWheelchairTypes.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              toggleSelection(
                                cat.name,
                                selectedWheelchairTypes,
                                setSelectedWheelchairTypes
                              )
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                              checked
                                ? "bg-secondary text-white border-secondary"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button type="submit" className="font-bold text-xs px-6">
                      Save Business Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Live Recent Activity Feed */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-200 shadow-subtle bg-white">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Recent Workshop Activity</span>
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  Live Feed
                </Badge>
              </div>
              <CardDescription className="text-[11px]">
                Latest repair milestones & user approvals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {recentActivityFeed.map((act) => (
                <div
                  key={act.id}
                  className="pb-3 border-b border-slate-100 last:border-0 last:pb-0 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/repairs/${act.ticketNumber}`}
                      className="font-mono font-bold text-primary hover:underline"
                    >
                      #{act.ticketNumber}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                  </div>
                  <p className="font-semibold text-secondary">{act.label}</p>
                  {act.notes && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{act.notes}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200 text-xs space-y-2">
            <div className="font-bold text-secondary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Technician Standing</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Service Radius: <strong>{serviceRadius} km</strong> around {city}. Average customer satisfaction:{" "}
              <strong>{averageRating} ★</strong>.
            </p>
          </Card>
        </div>
      </div>

      {/* Itemized Quotation Builder Modal */}
      {selectedTicketForQuote && (
        <Dialog open={quotationModalOpen} onOpenChange={setQuotationModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Build Quotation for #{selectedTicketForQuote.ticket_number}</DialogTitle>
              <DialogDescription>
                Itemize replacement parts, calibration labor, and arrival turnaround for user approval.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-secondary uppercase tracking-wider text-[11px]">
                    Itemized Parts & Labor
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {itemizedList.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...itemizedList];
                          updated[index].title = e.target.value;
                          setItemizedList(updated);
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...itemizedList];
                          updated[index].category = e.target.value as "parts" | "labor" | "inspection";
                          setItemizedList(updated);
                        }}
                        className="bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px]"
                      >
                        <option value="parts">Parts</option>
                        <option value="labor">Labor</option>
                        <option value="inspection">Inspect</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span>₹</span>
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => {
                            const updated = [...itemizedList];
                            updated[index].cost = parseFloat(e.target.value) || 0;
                            setItemizedList(updated);
                          }}
                          className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-error hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-bold text-sm">
                <span>Calculated Total Quotation:</span>
                <span className="text-primary text-base">
                  ₹{itemizedList.reduce((sum, item) => sum + item.cost, 0)}
                </span>
              </div>

              <Input
                label="Estimated Completion SLA *"
                value={estimatedCompletion}
                onChange={(e) => setEstimatedCompletion(e.target.value)}
                placeholder="e.g. Tomorrow, 04:00 PM"
              />

              <div className="space-y-1">
                <label className="font-semibold text-secondary">Technician Service Notes:</label>
                <textarea
                  rows={2}
                  className="flex w-full rounded-lg border border-slate-300 p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setQuotationModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmQuotation} className="bg-primary font-bold">
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Submit Itemized Quote to User</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Decline Job Modal */}
      {selectedTicketForDecline && (
        <Dialog open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Decline Service Ticket #{selectedTicketForDecline.ticket_number}</DialogTitle>
              <DialogDescription>
                State the reason for declining (e.g. out of service radius, spare parts backordered).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <textarea
                rows={3}
                className="flex w-full rounded-lg border border-slate-300 p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Reason for declining..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeclineModalOpen(false)}>
                Back
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  providerDeclineRequest(selectedTicketForDecline.id, declineReason);
                  setDeclineModalOpen(false);
                }}
              >
                Confirm Decline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Service Note Modal */}
      {noteModalTicket && (
        <Dialog open={true} onOpenChange={() => setNoteModalTicket(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Service Note — #{noteModalTicket.ticket_number}</DialogTitle>
              <DialogDescription>
                Append a transparent progress log entry visible to the wheelchair user.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitServiceNote} className="space-y-3 py-2 text-xs">
              <textarea
                rows={3}
                required
                className="flex w-full rounded-lg border border-slate-300 p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="e.g. Replaced left rear spoke set and calibrated brake caliper tension; starting test roll."
                value={serviceNoteText}
                onChange={(e) => setServiceNoteText(e.target.value)}
              />

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setNoteModalTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Service Note
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium">Loading Provider Operations Desk...</p>
        </div>
      }
    >
      <ProviderDashboardContent />
    </Suspense>
  );
}
