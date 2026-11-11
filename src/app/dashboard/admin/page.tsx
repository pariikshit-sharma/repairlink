"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Wrench,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Search,
  Ban,
  RotateCcw,
  Plus,
  Trash2,
  Power,
  Activity,
  HeartHandshake,
  ExternalLink,
  RefreshCw,
  Tag,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { usePlatform, PlatformAccount } from "@/context/platform-context";
import { useRepairs, STATUS_CONFIG } from "@/context/repair-context";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { UserRole } from "@/lib/supabase/types";
import { toast } from "sonner";

type AdminTab =
  | "verifications"
  | "users"
  | "repairs"
  | "temporary"
  | "categories"
  | "activity";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { switchDemoRole } = useAuth();
  const {
    accounts,
    categories,
    adminLogs,
    updateAccountStatus,
    addCategory,
    toggleCategory,
    deleteCategory,
    resetPlatformDefaults,
    logActivity,
  } = usePlatform();
  const { repairRequests, cancelRepairRequest } = useRepairs();
  const {
    inventory,
    requests: tempRequests,
    institutions,
    cancelRequest: cancelTempRequest,
  } = useTemporarySupport();

  // Tab State synced with ?tab=
  const [activeTab, setActiveTab] = useState<AdminTab>("verifications");

  useEffect(() => {
    const tabParam = searchParams.get("tab") as AdminTab | null;
    if (
      tabParam &&
      ["verifications", "users", "repairs", "temporary", "categories", "activity"].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Users Directory Filters
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Repair Monitor Filters
  const [repairSearch, setRepairSearch] = useState("");
  const [repairStageFilter, setRepairStageFilter] = useState<string>("all");

  // Temp Support Monitor Filters
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all");

  // Category Management State
  const [catKindFilter, setCatKindFilter] = useState<"all" | "repair_issue" | "wheelchair_type">(
    "all"
  );
  const [newCatName, setNewCatName] = useState("");
  const [newCatKind, setNewCatKind] = useState<"repair_issue" | "wheelchair_type">(
    "repair_issue"
  );
  const [newCatDesc, setNewCatDesc] = useState("");

  // Activity Log Filter
  const [activityFilter, setActivityFilter] = useState<
    "all" | "moderation" | "repair" | "loan"
  >("all");

  // Suspend Account Modal
  const [suspendTarget, setSuspendTarget] = useState<PlatformAccount | null>(null);
  const [suspendReason, setSuspendReason] = useState(
    "Suspended pending credential audit and SLA quality review."
  );

  // Admin Cancel Repair Modal
  const [cancelRepairId, setCancelRepairId] = useState<string | null>(null);
  const [cancelRepairReason, setCancelRepairReason] = useState(
    "Cancelled by Platform Moderator upon user/provider resolution request."
  );

  // Dynamic Real Metrics Computed from Live Records
  const registeredUsersCount = accounts.filter((a) => a.role === "user").length;
  const verifiedUsersCount = accounts.filter(
    (a) => a.role === "user" && a.verification_status === "verified"
  ).length;
  const providersCount = accounts.filter((a) => a.role === "provider").length;
  const verifiedProvidersCount = accounts.filter(
    (a) => a.role === "provider" && a.verification_status === "verified"
  ).length;
  const institutionAccountsCount = accounts.filter((a) => a.role === "institution").length;
  const verifiedInstitutionsCount = Math.max(
    institutions.length,
    accounts.filter((a) => a.role === "institution" && a.verification_status === "verified")
      .length
  );
  const pendingVerifications = accounts.filter(
    (a) => a.verification_status === "pending"
  );
  const suspendedCount = accounts.filter((a) => a.verification_status === "suspended").length;

  const activeRepairCount = repairRequests.filter(
    (r) =>
      r.status !== "repair_completed" &&
      r.status !== "request_closed" &&
      r.status !== "cancelled"
  ).length;
  const completedRepairCount = repairRequests.filter(
    (r) => r.status === "repair_completed" || r.status === "request_closed"
  ).length;

  const lentActiveCount = tempRequests.filter((r) => r.status === "lent_active").length;
  const availablePoolCount = inventory.filter(
    (w) => w.availability_status === "available"
  ).length;

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (roleFilter !== "all" && acc.role !== roleFilter) return false;
      if (statusFilter !== "all" && acc.verification_status !== statusFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const hay = `${acc.full_name} ${acc.organization_name || ""} ${acc.email} ${acc.city} ${
          acc.specialty_or_details
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [accounts, roleFilter, statusFilter, userSearch]);

  // Filtered Repair Requests
  const filteredRepairs = useMemo(() => {
    return repairRequests.filter((req) => {
      if (repairStageFilter === "active") {
        if (
          req.status === "repair_completed" ||
          req.status === "request_closed" ||
          req.status === "cancelled"
        ) {
          return false;
        }
      } else if (repairStageFilter === "completed") {
        if (req.status !== "repair_completed" && req.status !== "request_closed") return false;
      } else if (repairStageFilter !== "all" && req.status !== repairStageFilter) {
        return false;
      }

      if (repairSearch.trim()) {
        const q = repairSearch.toLowerCase();
        const hay = `${req.ticket_number} ${req.user_name} ${req.provider_name || ""} ${
          req.issue_category
        } ${req.wheelchair_summary.model}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [repairRequests, repairStageFilter, repairSearch]);

  // Filtered Temp Support Requests
  const filteredTempRequests = useMemo(() => {
    if (tempStatusFilter === "all") return tempRequests;
    return tempRequests.filter((r) => r.status === tempStatusFilter);
  }, [tempRequests, tempStatusFilter]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    if (catKindFilter === "all") return categories;
    return categories.filter((c) => c.kind === catKindFilter);
  }, [categories, catKindFilter]);

  // Unified Platform Activity Feed
  const unifiedActivities = useMemo(() => {
    const modItems = adminLogs.map((l) => ({
      id: l.id,
      type: l.category === "loan" ? ("loan" as const) : ("moderation" as const),
      title: l.action,
      target: l.target,
      actor: l.actor,
      details: l.details,
      timestamp: l.timestamp,
    }));

    const repairItems = repairRequests.flatMap((req) =>
      req.status_history.slice(-2).map((h) => ({
        id: `act-${req.id}-${h.id}`,
        type: "repair" as const,
        title: h.status_label,
        target: `#${req.ticket_number} (${req.user_name})`,
        actor: h.changed_by_name,
        details: h.notes || `${req.issue_category} on ${req.wheelchair_summary.model}`,
        timestamp: h.timestamp,
      }))
    );

    const loanItems = tempRequests.map((tr) => ({
      id: `loan-${tr.id}`,
      type: "loan" as const,
      title: `Temporary Mobility: ${tr.status.replace("_", " ").toUpperCase()}`,
      target: `#${tr.request_number} • ${tr.wheelchair?.serial_tag || "Loaner"}`,
      actor: tr.institution_name,
      details: `Patient: ${tr.user_name} (${tr.requested_start_date} to ${tr.requested_end_date})`,
      timestamp: tr.updated_at.slice(0, 10),
    }));

    const merged = [...modItems, ...repairItems, ...loanItems];
    if (activityFilter === "all") return merged;
    return merged.filter((m) => m.type === activityFilter);
  }, [adminLogs, repairRequests, tempRequests, activityFilter]);

  const handleConfirmSuspend = () => {
    if (!suspendTarget) return;
    if (!suspendReason.trim()) {
      toast.error("Please provide a moderation reason for suspension.");
      return;
    }
    updateAccountStatus(suspendTarget.id, "suspended", suspendReason.trim());
    setSuspendTarget(null);
  };

  const handleConfirmCancelRepair = () => {
    if (!cancelRepairId) return;
    cancelRepairRequest(cancelRepairId, cancelRepairReason.trim() || "Cancelled by Administrator");
    logActivity(
      "Admin Moderator",
      "Cancelled Repair Ticket",
      cancelRepairId,
      cancelRepairReason.trim() || "Administrative cancellation.",
      "repair"
    );
    setCancelRepairId(null);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    addCategory(newCatName.trim(), newCatKind, newCatDesc.trim());
    setNewCatName("");
    setNewCatDesc("");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs font-bold">
              Platform Governance & Operations
            </Badge>
            <Badge variant="outline" className="text-xs text-secondary font-semibold">
              Strict RLS & RBAC Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Admin Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review provider & institution applications, moderate accounts, govern taxonomy, and audit
            platform mobility activity.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetPlatformDefaults}
          className="text-xs text-muted-foreground self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reset Governance State
        </Button>
      </div>

      {/* Live Metrics Grid (Strictly Computed from Actual Context Records) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Registered Users</span>
          <div className="text-2xl font-black text-secondary mt-1">{registeredUsersCount}</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {verifiedUsersCount} active verified
          </p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Repair Providers</span>
          <div className="text-2xl font-black text-secondary mt-1">{providersCount}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {verifiedProvidersCount} verified workshops
          </p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Institutions</span>
          <div className="text-2xl font-black text-secondary mt-1">
            {verifiedInstitutionsCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {institutionAccountsCount} registered orgs
          </p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Repair Requests</span>
          <div className="text-2xl font-black text-primary mt-1">{repairRequests.length}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {activeRepairCount} active • {completedRepairCount} done
          </p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Temp Support</span>
          <div className="text-2xl font-black text-secondary mt-1">{tempRequests.length}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {lentActiveCount} lent • {availablePoolCount} ready
          </p>
        </Card>

        <Card
          className={`p-4 shadow-subtle ${
            pendingVerifications.length > 0
              ? "bg-amber-50/70 border-amber-200"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs font-semibold text-muted-foreground">Pending Review</span>
          <div
            className={`text-2xl font-black mt-1 ${
              pendingVerifications.length > 0 ? "text-amber-600" : "text-emerald-700"
            }`}
          >
            {pendingVerifications.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {suspendedCount > 0 ? `${suspendedCount} suspended` : "SLA verification queue"}
          </p>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-5 no-scrollbar">
        <button
          onClick={() => setActiveTab("verifications")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === "verifications"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Verification Queue</span>
          {pendingVerifications.length > 0 && (
            <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4">
              {pendingVerifications.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Users & Moderation ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("repairs")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "repairs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Repair Monitor ({repairRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("temporary")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "temporary"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Temporary Support ({tempRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Platform Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "activity"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Platform Activity</span>
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === "verifications" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-secondary">
                Provider & Institution Credential Review Queue
              </h2>
              <p className="text-xs text-muted-foreground">
                Verify technician certifications, rehab center registration, and NGO lending compliance
                before granting public directory status.
              </p>
            </div>
            <Badge variant={pendingVerifications.length > 0 ? "warning" : "success"} className="text-xs">
              {pendingVerifications.length} Pending Decisions
            </Badge>
          </div>

          {pendingVerifications.length > 0 ? (
            <div className="space-y-3">
              {pendingVerifications.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 bg-white border-slate-200 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={item.role === "provider" ? "default" : "accent"}
                        className="text-[11px] font-bold uppercase"
                      >
                        {item.role === "provider" ? "Repair Provider" : "Participating Institution"}
                      </Badge>
                      <Badge variant="warning" className="text-[11px]">
                        Pending Verification
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        Applied: {item.joined_at}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-secondary">
                      {item.organization_name || item.full_name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Contact: <strong>{item.full_name}</strong> ({item.email} • {item.phone}) —{" "}
                      {item.city}
                    </p>
                    <p className="text-xs text-muted-foreground bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      {item.specialty_or_details}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateAccountStatus(
                          item.id,
                          "rejected",
                          "Credentials could not be validated during verification audit."
                        )
                      }
                      className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateAccountStatus(
                          item.id,
                          "verified",
                          "Credentials audited and approved for public directory listing."
                        )
                      }
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve & Verify
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center bg-white border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-secondary">
                All Partner Applications Processed
              </h3>
              <p className="text-xs text-muted-foreground">
                Every pending repair workshop and medical institution has been audited. You can inspect
                all active accounts under Users & Moderation.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Users & Account Moderation */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <Card className="p-4 bg-white border-slate-200 shadow-subtle">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, workshop, hospital, email, or city..."
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
                  className="h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary"
                >
                  <option value="all">All Roles ({accounts.length})</option>
                  <option value="user">Wheelchair Users</option>
                  <option value="provider">Repair Providers</option>
                  <option value="institution">Institutions</option>
                  <option value="admin">Administrators</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Account / Organization</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Location & Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-secondary">
                          {acc.organization_name || acc.full_name}
                        </div>
                        {acc.organization_name && (
                          <div className="text-[11px] text-slate-600">{acc.full_name}</div>
                        )}
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {acc.specialty_or_details}
                        </div>
                        {acc.verification_status === "suspended" && acc.suspension_reason && (
                          <div className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded mt-1 inline-block">
                            Reason: {acc.suspension_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {acc.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-secondary">{acc.city}</div>
                        <div className="text-[11px] text-muted-foreground">{acc.email}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{acc.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            acc.verification_status === "verified"
                              ? "success"
                              : acc.verification_status === "pending"
                              ? "warning"
                              : "error"
                          }
                          className="text-[10px] capitalize"
                        >
                          {acc.verification_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {(acc.verification_status === "pending" ||
                            acc.verification_status === "rejected") && (
                            <Button
                              size="sm"
                              onClick={() => updateAccountStatus(acc.id, "verified")}
                              className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Verify
                            </Button>
                          )}

                          {acc.verification_status === "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAccountStatus(
                                  acc.id,
                                  "verified",
                                  "Reinstated after moderation review."
                                )
                              }
                              className="h-7 px-2.5 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Reactivate
                            </Button>
                          )}

                          {acc.role !== "admin" && acc.verification_status !== "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSuspendTarget(acc);
                                setSuspendReason(
                                  "Suspended due to repeated SLA breach or policy compliance review."
                                );
                              }}
                              className="h-7 px-2.5 text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50"
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No accounts match your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Repair Requests Monitor */}
      {activeTab === "repairs" && (
        <div className="space-y-4">
          <Card className="p-4 bg-white border-slate-200 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={repairSearch}
                  onChange={(e) => setRepairSearch(e.target.value)}
                  placeholder="Search by ticket #, customer, provider, wheelchair, or issue..."
                  className="pl-9 text-xs"
                />
              </div>

              <select
                value={repairStageFilter}
                onChange={(e) => setRepairStageFilter(e.target.value)}
                className="h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary"
              >
                <option value="all">All Tickets ({repairRequests.length})</option>
                <option value="active">Active In-Progress ({activeRepairCount})</option>
                <option value="completed">Completed ({completedRepairCount})</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {filteredRepairs.map((req) => {
              const cfg = STATUS_CONFIG[req.status];
              return (
                <Card
                  key={req.id}
                  className="p-4 bg-white border-slate-200 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        #{req.ticket_number}
                      </span>
                      <Badge variant={cfg.color === "primary" ? "default" : cfg.color} className="text-[10px]">
                        {cfg.label}
                      </Badge>
                      {req.urgency !== "standard" && (
                        <Badge variant="warning" className="text-[10px] uppercase">
                          {req.urgency}
                        </Badge>
                      )}
                      {req.quotation && (
                        <span className="text-[11px] font-bold text-secondary bg-slate-100 px-2 py-0.5 rounded">
                          Quote: Rs.{req.quotation.total_cost} ({req.quotation.status})
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-secondary">
                      {req.issue_category} — {req.wheelchair_summary.brand}{" "}
                      {req.wheelchair_summary.model}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      User: <strong>{req.user_name}</strong> ({req.user_phone}) • Provider:{" "}
                      <strong>{req.provider_name || "Unassigned / Broadcast"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/repairs/${req.ticket_number}`}>
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Inspect Ticket
                      </Button>
                    </Link>

                    {req.status !== "repair_completed" &&
                      req.status !== "request_closed" &&
                      req.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCancelRepairId(req.id)}
                          className="text-xs h-8 text-rose-700 border-rose-200 hover:bg-rose-50"
                        >
                          Cancel Ticket
                        </Button>
                      )}
                  </div>
                </Card>
              );
            })}
            {filteredRepairs.length === 0 && (
              <Card className="p-8 text-center bg-white border-slate-200 text-xs text-muted-foreground">
                No repair tickets match the current filter.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Temporary Support Monitor */}
      {activeTab === "temporary" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-secondary">
                Temporary Mobility & Institutional Loan Oversight
              </h2>
              <p className="text-xs text-muted-foreground">
                Live inventory availability across {institutions.length} verified institutions (
                {availablePoolCount} available / {inventory.length} total chairs).
              </p>
            </div>

            <select
              value={tempStatusFilter}
              onChange={(e) => setTempStatusFilter(e.target.value)}
              className="h-9 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary self-start sm:self-auto"
            >
              <option value="all">All Loan Requests ({tempRequests.length})</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved / Reserved</option>
              <option value="lent_active">Currently Lent</option>
              <option value="returned">Returned & Restocked</option>
              <option value="rejected">Declined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredTempRequests.map((tr) => (
              <Card
                key={tr.id}
                className="p-4 bg-white border-slate-200 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      #{tr.request_number}
                    </span>
                    <Badge
                      variant={
                        tr.status === "returned"
                          ? "success"
                          : tr.status === "pending"
                          ? "warning"
                          : tr.status === "rejected" || tr.status === "cancelled"
                          ? "error"
                          : "default"
                      }
                      className="text-[10px] uppercase"
                    >
                      {tr.status.replace("_", " ")}
                    </Badge>
                    {tr.repair_ticket_id && (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Linked {tr.repair_ticket_id}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-secondary">
                    {tr.wheelchair?.model_name || "Loaner Unit"} ({tr.wheelchair?.serial_tag})
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Patient: <strong>{tr.user_name}</strong> • Institution:{" "}
                    <strong>{tr.institution_name}</strong> • {tr.requested_start_date} to{" "}
                    {tr.requested_end_date}
                  </p>
                </div>

                {(tr.status === "pending" || tr.status === "approved") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      cancelTempRequest(tr.id);
                      logActivity(
                        "Admin Moderator",
                        "Cancelled Loan Request",
                        `#${tr.request_number}`,
                        `Admin released reservation on ${tr.wheelchair?.serial_tag || "loaner"}.`,
                        "loan"
                      );
                    }}
                    className="text-xs h-8 text-rose-700 border-rose-200 hover:bg-rose-50 shrink-0 self-start lg:self-auto"
                  >
                    Release / Cancel Loan
                  </Button>
                )}
              </Card>
            ))}
            {filteredTempRequests.length === 0 && (
              <Card className="p-8 text-center bg-white border-slate-200 text-xs text-muted-foreground">
                No temporary support requests match this status filter.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Platform Categories Governance */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 bg-white border-slate-200 shadow-subtle h-fit space-y-4">
            <div>
              <h3 className="text-base font-bold text-secondary flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Platform Category</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                New categories sync immediately to Repair Booking and Equipment forms.
              </p>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Kind</label>
                <select
                  value={newCatKind}
                  onChange={(e) =>
                    setNewCatKind(e.target.value as "repair_issue" | "wheelchair_type")
                  }
                  className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-secondary"
                >
                  <option value="repair_issue">Repair Issue Category</option>
                  <option value="wheelchair_type">Wheelchair Equipment Type</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Display Title *
                </label>
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Joystick PCB Waterproofing"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical / Technical Scope
                </label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Briefly describe supported parts or standards..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <Button type="submit" size="sm" className="w-full font-bold text-xs">
                <Tag className="w-3.5 h-3.5 mr-1.5" />
                Publish Category
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-secondary">
                Active Repair & Equipment Taxonomy
              </h3>
              <div className="flex items-center gap-1.5 text-xs">
                {(["all", "repair_issue", "wheelchair_type"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCatKindFilter(k)}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                      catKindFilter === k
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {k === "all"
                      ? "All"
                      : k === "repair_issue"
                      ? "Repair Issues"
                      : "Wheelchair Types"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredCategories.map((cat) => (
                <Card
                  key={cat.id}
                  className="p-4 bg-white border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-secondary">{cat.name}</span>
                      <Badge
                        variant={cat.kind === "repair_issue" ? "default" : "accent"}
                        className="text-[10px]"
                      >
                        {cat.kind === "repair_issue" ? "Repair Issue" : "Wheelchair Type"}
                      </Badge>
                      <Badge
                        variant={cat.is_active ? "success" : "outline"}
                        className="text-[10px]"
                      >
                        {cat.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCategory(cat.id)}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {cat.is_active ? "Disable" : "Enable"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Unified Platform Activity Log */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Unified Platform Activity & Governance Stream</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Consolidated feed combining moderation decisions, workshop status updates, and
                institutional loans.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {(["all", "moderation", "repair", "loan"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActivityFilter(f)}
                  className={`px-3 py-1 rounded-full font-semibold capitalize transition-colors ${
                    activityFilter === f
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {unifiedActivities.map((act) => (
              <Card key={act.id} className="p-4 bg-white border-slate-200 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        act.type === "moderation"
                          ? "secondary"
                          : act.type === "repair"
                          ? "default"
                          : "accent"
                      }
                      className="text-[10px] uppercase"
                    >
                      {act.type}
                    </Badge>
                    <span className="font-bold text-secondary">{act.title}</span>
                    <span className="text-primary font-semibold">{act.target}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 mt-1.5">
                  <strong>{act.actor}:</strong> {act.details}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suspend Account Reason Modal */}
      {suspendTarget && (
        <Dialog open={true} onOpenChange={() => setSuspendTarget(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Suspend Account</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Block sign-in and public listings for{" "}
                <strong>{suspendTarget.organization_name || suspendTarget.full_name}</strong> (
                {suspendTarget.email}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <label className="block font-semibold text-slate-700">
                Suspension Reason (logged to audit trail):
              </label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSuspendTarget(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmSuspend}
                className="font-bold text-xs"
              >
                Confirm Suspension
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Cancel Repair Ticket Modal */}
      {cancelRepairId && (
        <Dialog open={true} onOpenChange={() => setCancelRepairId(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-secondary">
                Administrative Ticket Cancellation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Provide a reason to close and cancel this repair ticket.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <label className="block font-semibold text-slate-700">
                Moderation Note / Resolution Summary:
              </label>
              <textarea
                rows={3}
                value={cancelRepairReason}
                onChange={(e) => setCancelRepairReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCancelRepairId(null)}>
                Keep Open
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmCancelRepair}
                className="font-bold text-xs"
              >
                Cancel Repair Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Evaluation Role Switcher Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-secondary">Evaluating for SBI Young Innovators Ideathon?</span>
          <p className="text-muted-foreground">
            Switch portals dynamically using RBAC session context:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => switchDemoRole("user")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            User Dashboard →
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => switchDemoRole("provider")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Provider Dashboard →
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => switchDemoRole("institution")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Institution Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground">
          Loading platform governance command center...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
