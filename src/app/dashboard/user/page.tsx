"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  ExternalLink,
  Star,
  Settings,
  History,
  Info,
  Disc,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_PROVIDERS, ProviderItem } from "@/lib/data/providers";
import { useAuth } from "@/context/auth-context";
import { useRepairs, STATUS_CONFIG } from "@/context/repair-context";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { TemporaryRequestTracker } from "@/components/temporary-support/request-tracker";
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

  const userName = user?.profile?.full_name || "Ramesh Kumar";
  const userCity = user?.profile?.city || "New Delhi";
  const userPhone = user?.profile?.phone || "+91 98112 43210";
  const userEmergencyName =
    user?.details && "emergency_contact_name" in user.details && user.details.emergency_contact_name
      ? user.details.emergency_contact_name
      : "Sunita Kumar";
  const userEmergencyPhone =
    user?.details && "emergency_contact_phone" in user.details && user.details.emergency_contact_phone
      ? user.details.emergency_contact_phone
      : "+91 98112 43211";

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

  const userTempRequests = tempRequests.filter(
    (r) =>
      r.user_id === user?.id ||
      r.user_name === userName ||
      r.user_id === "usr-demo-01" ||
      r.user_name === "Ramesh Kumar"
  );

  // Use the primary active ticket or fallback
  const displayTicket = activeRequest || repairRequests[0];
  const ticketStatusConfig = displayTicket
    ? STATUS_CONFIG[displayTicket.status] || STATUS_CONFIG.request_submitted
    : STATUS_CONFIG.request_submitted;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="text-xs">
              Wheelchair User Portal
            </Badge>
            <span className="text-xs text-muted-foreground">• {userCity} Active Zone</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your assistive wheelchair records, track active repairs, and coordinate temporary loaners.
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
            <span>Loaner Availability</span>
          </Button>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {[
            { id: "overview", label: "Overview", icon: Wrench },
            { id: "requests", label: "My Requests", icon: Clock },
            { id: "wheelchair", label: "My Wheelchair", icon: Disc },
            { id: "temporary", label: "Temporary Support", icon: HeartHandshake },
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
          {/* Top Section: Registered Wheelchair + Temporary Continuity Status */}
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
                      Ottobock Zenit R (Active Manual Rigid)
                    </CardTitle>
                  </div>
                  <Badge variant="accent" className="font-bold text-xs py-0.5 px-2">
                    Warranty Active
                  </Badge>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 text-xs">
                    <div>
                      <p className="text-muted-foreground">Serial Number</p>
                      <p className="font-bold text-secondary">#OB-2024-8841</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seat Width / Depth</p>
                      <p className="font-bold text-secondary">40 cm / 42 cm</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Checkup</p>
                      <p className="font-bold text-secondary">14 Oct 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Health Condition</p>
                      <p className="font-bold text-emerald-700">Good (Tier A)</p>
                    </div>
                  </div>

                  {/* Active Repair Ticket Status Highlight */}
                  {displayTicket && (
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
                          variant={
                            displayTicket.status === "request_closed"
                              ? "success"
                              : "default"
                          }
                          className="text-[10px] font-bold self-start sm:self-auto"
                        >
                          {ticketStatusConfig.label}
                        </Badge>
                      </div>

                      {/* Visual Progress Steps */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-center text-[10px] font-bold">
                        <div
                          className={`p-1.5 rounded-lg ${
                            ticketStatusConfig.step >= 1
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-muted-foreground"
                          }`}
                        >
                          ✓ Submitted
                        </div>
                        <div
                          className={`p-1.5 rounded-lg ${
                            ticketStatusConfig.step >= 3
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-muted-foreground"
                          }`}
                        >
                          {ticketStatusConfig.step >= 3 ? "✓ Quoted" : "2. Quote"}
                        </div>
                        <div
                          className={`p-1.5 rounded-lg ${
                            ticketStatusConfig.step >= 5
                              ? "bg-primary text-white animate-pulse"
                              : "bg-slate-100 text-muted-foreground"
                          }`}
                        >
                          {ticketStatusConfig.step >= 5 ? "⚙ In Progress" : "3. In Progress"}
                        </div>
                        <div
                          className={`p-1.5 rounded-lg ${
                            ticketStatusConfig.step >= 6
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-muted-foreground"
                          }`}
                        >
                          4. Completed
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-primary/10">
                        <span className="text-muted-foreground">
                          Provider: <strong className="text-secondary">{displayTicket.provider_name}</strong>
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
                      Mobility Continuity Status
                    </span>
                    <Badge variant="accent" className="text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                      Active Loaner
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg">Temporary Loaner Wheelchair</CardTitle>
                  <CardDescription className="text-xs">
                    Provided by AIIMS Dept of Physical Medicine & Rehab
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs pt-3">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1.5 shadow-subtle">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Unit Tag:</span>
                      <span className="font-bold text-secondary">#AIIMS-LN-042</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Configuration:</span>
                      <span className="font-bold text-secondary">Folding Transit (40cm seat)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Authorized Period:</span>
                      <span className="font-bold text-emerald-700">10 Nov – 15 Nov 2024</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Zero mobility downtime guarantee: Return is scheduled automatically once your primary Ottobock chair completes technician sign-off.
                  </p>
                </CardContent>

                <div className="p-5 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("temporary")}
                    className="w-full text-xs font-bold text-emerald-900 border-emerald-200 hover:bg-emerald-50"
                  >
                    View Loan Agreement & Return Details
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Action Cards (Blinkit / Urban Company Style) */}
          <div>
            <h2 className="text-base font-bold text-secondary mb-3">
              Quick Mobility Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/book-repair">
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Book Repair Wizard</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      7-step diagnostic intake for model-matched repairer dispatch.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary mt-4 flex items-center gap-1">
                    <span>Start Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab("temporary")}
                className="text-left w-full"
              >
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Hospital Loaner Pool</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Access {liveAvailableLoaners} available loaner wheelchairs across{" "}
                      {loanInstitutions.length} partner hospitals.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
                    <span>Browse Equipment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wheelchair")}
                className="text-left w-full"
              >
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Digital Logbook</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maintenance history, warranty cards, and technician signatures.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-secondary mt-4 flex items-center gap-1">
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="text-left w-full"
              >
                <Card hoverEffect className="p-4 bg-white border-slate-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                      <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary">Emergency Contacts</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Roadside breakdown SOS and designated caregiver alerts.
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

          {/* Nearby Repair Providers Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-secondary">
                  Nearby Vetted Repair Providers
                </h2>
                <p className="text-xs text-muted-foreground">
                  Technicians operating in {userCity} with rapid doorstep response
                </p>
              </div>

              <Button variant="outline" size="sm" asChild className="text-xs font-bold">
                <Link href="/find-repairs">
                  <span>Explore Full Map (4 Nearby)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_PROVIDERS.slice(0, 2).map((prov) => (
                <Card key={prov.id} className="p-5 bg-white border-slate-200 shadow-subtle rounded-2xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-secondary">{prov.businessName}</h4>
                          {prov.isVerified && (
                            <Badge variant="accent" className="text-[9px] py-0 px-1 font-bold">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {prov.location.neighborhood} • {prov.distanceKm} km away
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{prov.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {prov.bio}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>ETA {prov.estimatedResponseTime}</span>
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-primary">Starts ₹{prov.startingPriceInr}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" asChild className="text-xs font-semibold p-0 h-auto text-secondary hover:text-primary">
                      <Link href={`/providers/${prov.id}`}>View Profile & Reviews →</Link>
                    </Button>
                    <Button size="sm" asChild className="text-xs font-bold bg-primary hover:bg-primary-600 text-white">
                      <Link href="/find-repairs">Request Service</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY REQUESTS (Live Synchronized List) */}
      {activeTab === "requests" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-secondary">My Service Requests & Invoices</h2>
              <p className="text-xs text-muted-foreground">Track live diagnostics, approved quotes, and repair history</p>
            </div>
            <Button size="sm" asChild className="font-bold bg-primary hover:bg-primary-600 text-white">
              <Link href="/book-repair">+ Book New Repair</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {repairRequests.map((req) => {
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
        </div>
      )}

      {/* TAB 3: MY WHEELCHAIR */}
      {activeTab === "wheelchair" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-secondary">My Assistive Wheelchair Profile</h2>
            <p className="text-xs text-muted-foreground">Technical specifications, custom dimensions, and digital logbook</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 p-6 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-secondary">Device Configuration</h3>
                <Badge variant="accent" className="text-xs font-bold">Manual Active</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Manufacturer / Brand:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">Ottobock</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Model Name:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">Zenit R</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Serial Identifier:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">#OB-2024-8841</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seat Width / Depth:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">40 cm x 42 cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Wheel Diameter:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">24-inch Pneumatic</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cushion Configuration:</span>
                  <p className="font-bold text-secondary text-sm mt-0.5">Roho Contour Gel</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-muted-foreground">Custom Notes & Adaptations:</span>
                <p className="text-xs text-secondary mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Equipped with carbon-fiber side guards, anti-tippers, and ergonomic quick-release axles.
                </p>
              </div>
            </Card>

            <Card className="lg:col-span-4 p-6 bg-white border-slate-200 shadow-subtle rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-secondary">Digital Warranty Card</h3>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frame Warranty:</span>
                  <span className="font-bold text-emerald-700">Valid until 2027</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coverage Tier:</span>
                  <span className="font-bold text-secondary">Full Structural</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                Download PDF Warranty Card
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
                Hospital and NGO equipment pools coordinated for zero mobility downtime during repairs
              </p>
            </div>
            <Link href="/temporary-support">
              <Button size="sm" className="font-bold text-xs shadow-xs">
                <HeartHandshake className="w-3.5 h-3.5 mr-1.5" />
                <span>Browse Available Loaners</span>
              </Button>
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-accent/40 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Institutional Policy Notice:</strong> Temporary loaner wheelchairs are provided under clinical oversight from partnered institutions (AIIMS PMR, ISIC, Mobility India). Final suitability is verified by the issuing center to prevent posture injury.
            </p>
          </div>

          {/* Active User Loan Requests */}
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
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-secondary">No Active Loan Requests</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                If your wheelchair is currently in the workshop or you need temporary assistance, browse the participating hospital pool.
              </p>
              <Link href="/temporary-support">
                <Button size="sm" className="font-bold text-xs">
                  Request Temporary Wheelchair
                </Button>
              </Link>
            </div>
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
            />
            <Input
              label="Contact Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <Input
              label="Operating City"
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name"
                value={editEmergencyName}
                onChange={(e) => setEditEmergencyName(e.target.value)}
              />
              <Input
                label="Emergency Contact Phone"
                value={editEmergencyPhone}
                onChange={(e) => setEditEmergencyPhone(e.target.value)}
                helperText="Alerted automatically during emergency breakdown assistance."
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
                  toast.success("Profile & emergency contact preferences saved.");
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
