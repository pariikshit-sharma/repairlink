"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Wrench,
  HeartHandshake,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Phone,
  User,
  Star,
  Disc,
  Loader2,
  Sparkles,
  Award,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_PROVIDERS } from "@/lib/data/providers";
import { useAuth } from "@/context/auth-context";
import { useRepairs, STATUS_CONFIG } from "@/context/repair-context";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { TemporaryRequestTracker } from "@/components/temporary-support/request-tracker";
import { WheelchairUserDetails } from "@/lib/supabase/types";
import { toast } from "sonner";

type DashboardTab = "overview" | "requests" | "wheelchair" | "temporary" | "profile";

function UserDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get("tab") as DashboardTab) || "overview";

  const { user, updateCurrentUserProfile } = useAuth();
  const { repairRequests, activeRequest } = useRepairs();
  const {
    inventory: loanInventory,
    institutions: loanInstitutions,
    requests: tempRequests,
    cancelRequest,
  } = useTemporarySupport();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    const paramTab = searchParams?.get("tab") as DashboardTab | null;
    if (
      paramTab &&
      ["overview", "requests", "wheelchair", "temporary", "profile"].includes(paramTab)
    ) {
      setActiveTab(paramTab);
    }
  }, [searchParams]);

  const userName = user?.profile?.full_name || (user?.email ? user.email.split("@")[0] : "Wheelchair User");
  const userCity = user?.profile?.city || "New Delhi";
  const userPhone = user?.profile?.phone || "";
  
  const userDetails = (user?.details as WheelchairUserDetails | undefined) || undefined;
  const userEmergencyName = userDetails?.emergency_contact_name || "";
  const userEmergencyPhone = userDetails?.emergency_contact_phone || "";

  const [editFullName, setEditFullName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [editCity, setEditCity] = useState(userCity);
  const [editEmergencyName, setEditEmergencyName] = useState(userEmergencyName);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(userEmergencyPhone);

  useEffect(() => {
    setEditFullName(userName);
    setEditPhone(userPhone);
    setEditCity(userCity);
    setEditEmergencyName(userEmergencyName);
    setEditEmergencyPhone(userEmergencyPhone);
  }, [userName, userPhone, userCity, userEmergencyName, userEmergencyPhone]);

  const liveAvailableLoaners = loanInventory.filter(
    (w) => w.availability_status === "available"
  ).length;

  // Filter real requests for current user
  const myRequests = useMemo(() => {
    return repairRequests.filter((r) => {
      if (user?.id && r.user_id === user.id) return true;
      if (user?.profile?.full_name && r.user_name?.toLowerCase() === user.profile.full_name.toLowerCase()) return true;
      // Default initial requests for testing preview
      if (user?.id === "user-default-01" && (r.user_id === "user-default-01" || r.user_id === "demo-user-001")) return true;
      return false;
    });
  }, [repairRequests, user]);

  const userTempRequests = useMemo(() => {
    return tempRequests.filter((r) => {
      if (user?.id && r.user_id === user.id) return true;
      if (user?.email && r.user_email === user.email) return true;
      if (user?.profile?.full_name && r.user_name?.toLowerCase() === user.profile.full_name.toLowerCase()) return true;
      if (user?.id === "user-default-01" && (r.user_id === "user-default-01" || r.user_id === "usr-demo-01")) return true;
      return false;
    });
  }, [tempRequests, user]);

  // Dynamic real stats computed from actual user records
  const totalRequestsCount = myRequests.length;
  const activeRepairsCount = myRequests.filter(
    (r) => r.status !== "repair_completed" && r.status !== "request_closed" && r.status !== "cancelled"
  ).length;
  const completedRepairsCount = myRequests.filter(
    (r) => r.status === "repair_completed" || r.status === "request_closed"
  ).length;
  const activeLoaner = userTempRequests.find(
    (r) => r.status === "lent_active" || r.status === "approved"
  );
  const activeLoanCount = activeLoaner ? 1 : 0;

  // Genuine Mobility Care Points System
  const mobilityPoints = (user ? 100 : 0) + (completedRepairsCount * 150) + (activeRepairsCount * 50) + (userTempRequests.length * 75);
  const mobilityTier = mobilityPoints >= 500 ? "Gold" : mobilityPoints >= 250 ? "Silver" : "Bronze";

  const displayTicket = myRequests.find((r) => r.status !== "repair_completed" && r.status !== "request_closed") || myRequests[0];
  const ticketStatusConfig = displayTicket
    ? STATUS_CONFIG[displayTicket.status] || STATUS_CONFIG.request_submitted
    : STATUS_CONFIG.request_submitted;

  const wheelchairBrand = userDetails?.wheelchair_brand || "Active Wheelchair";
  const wheelchairModel = userDetails?.wheelchair_model || "Ergonomic Rigid";
  const wheelchairType = userDetails?.wheelchair_type || "Manual Active";
  const seatWidth = userDetails?.seat_width_cm ? `${userDetails.seat_width_cm} cm` : "40 cm";

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="text-xs font-bold">
              Wheelchair User Portal
            </Badge>
            <span className="text-xs text-muted-foreground">• {userCity} Zone</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track real-time wheelchair repairs, coordinate temporary hospital loaners, and manage your device specs.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button asChild size="default" className="font-bold shadow-sm bg-primary hover:bg-primary-600 text-white">
            <Link href="/book-repair" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Book New Repair</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => setActiveTab("temporary")}
            className="font-bold border-secondary/20 hover:border-secondary/40 text-secondary"
          >
            <HeartHandshake className="w-4 h-4 text-primary mr-1.5" />
            <span>Loaner Pool ({liveAvailableLoaners})</span>
          </Button>
        </div>
      </div>

      {/* Real Dynamic Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Repairs
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-black text-secondary">{activeRepairsCount}</p>
            <span className="text-xs text-primary font-bold">In Progress</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Repairs Completed
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-black text-emerald-700">{completedRepairsCount}</p>
            <span className="text-xs text-emerald-700 font-bold">Lifetime</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Hospital Loans
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-black text-secondary">{activeLoanCount}</p>
            <span className="text-xs text-muted-foreground font-semibold">
              {activeLoanCount > 0 ? "In Use" : "None Required"}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 via-surface to-accent/20 border-primary/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Mobility Points
            </span>
            <Badge variant="accent" className="text-[10px] font-bold">
              {mobilityTier} Tier
            </Badge>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-black text-primary">{mobilityPoints} <span className="text-xs font-semibold">pts</span></p>
            <span className="text-xs text-muted-foreground font-semibold">Tracked Real-Time</span>
          </div>
        </Card>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {[
            { id: "overview", label: "Overview", icon: Wrench },
            { id: "requests", label: `My Requests (${totalRequestsCount})`, icon: Clock },
            { id: "wheelchair", label: "My Wheelchair", icon: Disc },
            { id: "temporary", label: `Temporary Support (${userTempRequests.length})`, icon: HeartHandshake },
            { id: "profile", label: "Profile & Emergency", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  isActive
                    ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-secondary hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Registered Wheelchair Summary Card (7 cols) */}
            <div className="lg:col-span-7">
              <Card className="h-full border-slate-200 shadow-subtle bg-white flex flex-col justify-between">
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Primary Registered Device
                    </span>
                    <CardTitle className="text-lg sm:text-xl mt-0.5">
                      {wheelchairBrand} {wheelchairModel}
                    </CardTitle>
                  </div>
                  <Badge variant="accent" className="font-bold text-xs py-0.5 px-2">
                    {wheelchairType}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 text-xs">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-bold text-secondary">{wheelchairType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seat Width</p>
                      <p className="font-bold text-secondary">{seatWidth}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City Zone</p>
                      <p className="font-bold text-secondary">{userCity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-bold text-emerald-700">Registered</p>
                    </div>
                  </div>

                  {/* Active Repair Ticket Status Highlight */}
                  {displayTicket ? (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                          <span className="text-xs font-bold text-secondary">
                            Active Ticket #{displayTicket.ticket_number}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-white font-semibold">
                            {displayTicket.issue_category}
                          </Badge>
                        </div>
                        <Badge
                          variant={displayTicket.status === "request_closed" ? "success" : "default"}
                          className="text-[10px] font-bold self-start sm:self-auto"
                        >
                          {ticketStatusConfig.label}
                        </Badge>
                      </div>

                      {/* Visual Progress Steps */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-center text-[10px] font-bold">
                        <div className={`p-1.5 rounded-lg ${ticketStatusConfig.step >= 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-muted-foreground"}`}>
                          ✓ Submitted
                        </div>
                        <div className={`p-1.5 rounded-lg ${ticketStatusConfig.step >= 3 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-muted-foreground"}`}>
                          {ticketStatusConfig.step >= 3 ? "✓ Quoted" : "2. Quote"}
                        </div>
                        <div className={`p-1.5 rounded-lg ${ticketStatusConfig.step >= 5 ? "bg-primary text-white animate-pulse" : "bg-slate-100 text-muted-foreground"}`}>
                          {ticketStatusConfig.step >= 5 ? "⚙ In Progress" : "3. In Progress"}
                        </div>
                        <div className={`p-1.5 rounded-lg ${ticketStatusConfig.step >= 6 ? "bg-emerald-600 text-white" : "bg-slate-100 text-muted-foreground"}`}>
                          4. Completed
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-primary/10">
                        <span className="text-muted-foreground">
                          Provider: <strong className="text-secondary">{displayTicket.provider_name || "Assigned Technician"}</strong>
                        </span>
                        <Link
                          href={`/repairs/${displayTicket.ticket_number}`}
                          className="text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Track Full Lifecycle</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-secondary">No Active Repair Issues</p>
                      <p className="text-[11px] text-muted-foreground">Your wheelchair is currently operating normally.</p>
                      <Button asChild size="sm" variant="outline" className="text-xs font-bold mt-1">
                        <Link href="/book-repair">Report a Breakdown</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Temporary Loaner Support Continuity (5 cols) */}
            <div className="lg:col-span-5">
              <Card className="h-full border-emerald-200 bg-gradient-to-b from-white via-surface to-accent/30 shadow-subtle flex flex-col justify-between">
                <CardHeader className="pb-2 border-b border-emerald-100/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                      Mobility Continuity
                    </span>
                    <Badge variant="accent" className="text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                      {activeLoaner ? "Active Loan" : "Zero Downtime"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {activeLoaner ? "Active Hospital Loaner" : "Temporary Loaner Pool"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeLoaner
                      ? `Provided by ${activeLoaner.institution_name}`
                      : `${liveAvailableLoaners} loaner wheelchairs available from partner institutions`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs pt-3">
                  {activeLoaner ? (
                    <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1.5 shadow-subtle">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loan Unit:</span>
                        <span className="font-bold text-secondary">#{activeLoaner.wheelchair_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Partner:</span>
                        <span className="font-bold text-secondary">{activeLoaner.institution_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-bold text-emerald-700 capitalize">{activeLoaner.status.replace("_", " ")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-2 text-slate-600">
                      <p className="text-[11px] leading-relaxed">
                        If a breakdown takes your primary wheelchair to the workshop for multi-day repairs, you qualify for zero-cost temporary loaners from partnered hospitals and NGOs.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("temporary")}
                    className="w-full text-xs font-bold text-emerald-900 border-emerald-200 hover:bg-emerald-50 mt-2"
                  >
                    {activeLoaner ? "View Loan Details" : "Browse Available Loaner Chairs"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div>
            <h2 className="text-base font-bold text-secondary mb-3">Quick Mobility Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/book-repair">
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Book Repair Wizard</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Step-by-step diagnostic intake for model-matched repairer dispatch.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary mt-4 flex items-center gap-1">
                    <span>Start Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </Link>

              <button type="button" onClick={() => setActiveTab("temporary")} className="text-left w-full">
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Hospital Loaner Pool</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Access {liveAvailableLoaners} loaner wheelchairs across verified healthcare centers.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
                    <span>Browse Equipment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </button>

              <button type="button" onClick={() => setActiveTab("wheelchair")} className="text-left w-full">
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Device Specifications</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dimensions, seat width, and digital maintenance logbook.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-secondary mt-4 flex items-center gap-1">
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </button>

              <button type="button" onClick={() => setActiveTab("profile")} className="text-left w-full">
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                      <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Emergency Contacts</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Roadside breakdown alert and designated caregiver details.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
                    <span>Manage Contacts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-secondary">My Service Requests</h2>
              <p className="text-xs text-muted-foreground">Track live diagnostics, quotes, and repair milestones</p>
            </div>
            <Button size="sm" asChild className="font-bold bg-primary hover:bg-primary-600 text-white">
              <Link href="/book-repair">+ Book New Repair</Link>
            </Button>
          </div>

          {myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.request_submitted;
                return (
                  <Card key={req.id} className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-secondary">Ticket #{req.ticket_number}</span>
                          <Badge
                            variant={
                              req.status === "request_closed"
                                ? "success"
                                : req.status === "cancelled"
                                ? "destructive"
                                : "default"
                            }
                            className="text-[10px] font-bold"
                          >
                            {statusCfg.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(req.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-xs text-secondary font-medium">
                          Device: <strong>{req.wheelchair_summary.brand} {req.wheelchair_summary.model}</strong> • Issue: <strong>{req.issue_category}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted-foreground">Total Quoted</span>
                        <p className="text-base font-black text-secondary">
                          {req.quotation ? `₹${req.quotation.total_cost}` : "Pending Quote"}
                        </p>
                      </div>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-slate-600 line-clamp-1">{req.description}</p>
                        <span className="text-muted-foreground">
                          Assigned Provider: <strong className="text-secondary">{req.provider_name || "Auto-Match"}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" asChild className="text-xs font-bold bg-primary hover:bg-primary-600 text-white">
                          <Link href={`/repairs/${req.ticket_number}`}>
                            <span>Track Lifecycle</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-10 text-center bg-white border-slate-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-secondary">No Repair Requests Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Need a technician to service your brakes, motor, or tires? Create your first ticket.
              </p>
              <Button asChild size="sm" className="font-bold bg-primary hover:bg-primary-600 text-white">
                <Link href="/book-repair">Book Wheelchair Repair</Link>
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: MY WHEELCHAIR */}
      {activeTab === "wheelchair" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-secondary">Assistive Wheelchair Profile</h2>
            <p className="text-xs text-muted-foreground">Technical dimensions, frame configurations, and maintenance specs</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 p-6 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-secondary">Device Configuration</h3>
                <Badge variant="accent" className="text-xs font-bold">{wheelchairType}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Brand / Manufacturer:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">{wheelchairBrand}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Model Name:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">{wheelchairModel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seat Width:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">{seatWidth}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">{wheelchairType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">City Zone:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">{userCity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Registered Status:</span>
                  <p className="font-bold text-emerald-700 text-sm mt-0.5">Active</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-muted-foreground">Device Description:</span>
                <p className="text-xs text-secondary mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {userDetails?.device_description || "Standard active wheelchair registered with RepairLink."}
                </p>
              </div>
            </Card>

            <Card className="lg:col-span-4 p-6 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-secondary">Mobility Continuity Status</h3>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital Pool:</span>
                  <span className="font-bold text-emerald-700">{liveAvailableLoaners} Chairs Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partner Centers:</span>
                  <span className="font-bold text-secondary">{loanInstitutions.length} Facilities</span>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold">
                <Link href="/temporary-support">View Equipment Registry</Link>
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: TEMPORARY SUPPORT */}
      {activeTab === "temporary" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-secondary">Temporary Mobility Support (Loaner Registry)</h2>
              <p className="text-xs text-muted-foreground">
                Hospital and rehabilitation equipment pools coordinated for zero mobility downtime during repairs
              </p>
            </div>
            <Link href="/temporary-support">
              <Button size="sm" className="font-bold text-xs bg-primary hover:bg-primary-600 text-white">
                <HeartHandshake className="w-3.5 h-3.5 mr-1.5" />
                <span>Browse Available Loaners ({liveAvailableLoaners})</span>
              </Button>
            </Link>
          </div>

          {userTempRequests.length > 0 ? (
            <div className="space-y-4">
              {userTempRequests.map((req) => (
                <TemporaryRequestTracker
                  key={req.id}
                  request={req}
                  onCancel={cancelRequest}
                />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-secondary">No Active Loan Requests</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                If your wheelchair is currently in the workshop or you need temporary assistance, browse the participating hospital pool.
              </p>
              <Button size="sm" asChild className="font-bold text-xs bg-primary hover:bg-primary-600 text-white">
                <Link href="/temporary-support">Request Temporary Wheelchair</Link>
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-secondary">Profile & Emergency Settings</h2>
            <p className="text-xs text-muted-foreground">Manage your contact details and designated emergency alerts</p>
          </div>

          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-4">
            <Input
              label="Full Name"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Contact Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Operating City"
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
              placeholder="e.g. New Delhi"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name"
                value={editEmergencyName}
                onChange={(e) => setEditEmergencyName(e.target.value)}
                placeholder="Caregiver or family member"
              />
              <Input
                label="Emergency Contact Phone"
                value={editEmergencyPhone}
                onChange={(e) => setEditEmergencyPhone(e.target.value)}
                placeholder="+91 98765 43210"
                helperText="Alerted automatically during emergency roadside breakdown assistance."
              />
            </div>

            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => {
                  updateCurrentUserProfile(
                    {
                      full_name: editFullName.trim() || userName,
                      phone: editPhone.trim() || userPhone,
                      city: editCity.trim() || userCity,
                    },
                    {
                      emergency_contact_name: editEmergencyName.trim(),
                      emergency_contact_phone: editEmergencyPhone.trim(),
                    }
                  );
                  toast.success("Profile preferences saved.");
                }}
                className="font-bold bg-primary hover:bg-primary-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <UserDashboardContent />
    </Suspense>
  );
}
