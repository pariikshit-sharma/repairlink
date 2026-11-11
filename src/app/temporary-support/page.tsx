"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HeartHandshake,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InventoryWheelchairCard } from "@/components/temporary-support/wheelchair-card";
import { RequestTemporarySupportModal } from "@/components/temporary-support/request-modal";
import { TemporaryRequestTracker } from "@/components/temporary-support/request-tracker";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { useAuth } from "@/context/auth-context";
import { InventoryWheelchair, TemporarySupportRequest } from "@/lib/supabase/types";

export default function TemporarySupportPage() {
  const { inventory, requests, institutions, cancelRequest, resetToDefaults } = useTemporarySupport();
  const { user } = useAuth();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDrive, setSelectedDrive] = useState<string>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "my_requests" | "institutions">("catalog");

  // Modal State
  const [selectedWheelchairForLoan, setSelectedWheelchairForLoan] =
    useState<InventoryWheelchair | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [specsModalWheelchair, setSpecsModalWheelchair] =
    useState<InventoryWheelchair | null>(null);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((wc) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = wc.model_name.toLowerCase().includes(q);
        const matchesTag = wc.serial_tag.toLowerCase().includes(q);
        const matchesInst = wc.institution_name.toLowerCase().includes(q);
        const matchesType = wc.wheelchair_type.toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesInst && !matchesType) return false;
      }

      // Drive mode (manual vs powered)
      if (selectedDrive !== "all" && wc.manual_or_powered !== selectedDrive) {
        return false;
      }

      // Wheelchair Type
      if (selectedType !== "all" && wc.wheelchair_type !== selectedType) {
        return false;
      }

      // Institution
      if (selectedInstitution !== "all" && wc.institution_id !== selectedInstitution) {
        return false;
      }

      // Availability status
      if (onlyAvailable && wc.availability_status !== "available") {
        return false;
      }

      return true;
    });
  }, [inventory, searchQuery, selectedDrive, selectedType, selectedInstitution, onlyAvailable]);

  // Unique categories for filters
  const wheelchairTypes = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach((i) => set.add(i.wheelchair_type));
    return Array.from(set);
  }, [inventory]);

  // User's temporary requests
  const userRequests = useMemo(() => {
    if (!user) {
      return requests.filter(
        (r) =>
          r.user_id === "usr-demo-01" ||
          r.user_id === "demo-user-001" ||
          r.user_name === "Ramesh Kumar"
      );
    }
    return requests.filter(
      (r) =>
        r.user_id === user.id ||
        r.user_name === user.profile.full_name ||
        (user.id === "demo-user-001" && r.user_id === "usr-demo-01")
    );
  }, [requests, user]);

  const handleRequestClick = (wc: InventoryWheelchair) => {
    setSelectedWheelchairForLoan(wc);
    setModalOpen(true);
  };

  const handleViewDetailsClick = (wc: InventoryWheelchair) => {
    setSpecsModalWheelchair(wc);
  };

  const availableCount = inventory.filter((w) => w.availability_status === "available").length;
  const lentCount = inventory.filter((w) => w.availability_status === "currently_lent").length;

  return (
    <div className="bg-[#F7F9FA] min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-white relative overflow-hidden py-12 md:py-16 border-b border-slate-800">
        <div className="absolute inset-0 bg-radial-at-t from-primary/20 via-transparent to-transparent opacity-40 pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="text-xs bg-emerald-500/20 text-accent border border-accent/30 font-bold">
                <HeartHandshake className="w-3.5 h-3.5 mr-1" /> Mobility-Continuity Guarantee
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-300 border-slate-700">
                SBI Young Innovators Network
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              When Mobility Stops, <br className="hidden sm:inline" />
              <span className="text-primary-light text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-300 to-teal-300">
                Support Shouldn&apos;t.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Access sterile, clinically verified loaner wheelchairs from partner rehabilitation centres,
              hospitals, and NGOs across Delhi NCR while your primary device is in the workshop.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-xs text-slate-400 block">Active Loan Pool</span>
                <span className="text-2xl font-black text-white">{inventory.length} Units</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xs">
                <span className="text-xs text-emerald-400 block font-semibold">Ready for Dispatch</span>
                <span className="text-2xl font-black text-accent">{availableCount} Units</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-xs text-slate-400 block">Continuity In-Use</span>
                <span className="text-2xl font-black text-white">{lentCount} Users</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-xs text-slate-400 block">Medical Partners</span>
                <span className="text-2xl font-black text-white">{institutions.length} Centres</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Explainer (4-Step Continuity Flow) */}
      <section className="bg-white border-b border-slate-200/80 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Assurance Process
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-secondary">
                How Temporary Wheelchair Support Operates
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="text-xs text-muted-foreground"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reset Demo Stock
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-secondary mb-1">Verify Need or Repair</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your active RepairLink repair ticket to waive deposits and confirm ongoing
                maintenance.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-secondary mb-1">Select Matching Device</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter by seat width (33–50cm), drive mode (manual/powered), weight limit, and hospital
                depot location.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-secondary mb-1">Clinical Clearance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hospital rehab officers review seating dimensions to guarantee postural safety and prevent
                pressure sores.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="text-sm font-bold text-secondary mb-1">Handover & Restock</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pick up at hospital depot or request home delivery. Return seamlessly once your primary chair
                is repaired.
              </p>
            </div>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="mt-6 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Institutional Clinical Suitability Policy:</strong> Temporary wheelchair availability
              is derived from live institutional inventory. Final approval and device configuration are
              determined by the medical specialists at participating institutions to ensure proper lumbar,
              pelvic, and pressure relief compatibility.
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "catalog"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-secondary"
            }`}
          >
            Available Loaner Inventory ({filteredInventory.length})
          </button>

          <button
            onClick={() => setActiveTab("my_requests")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "my_requests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-secondary"
            }`}
          >
            <span>My Loan Requests</span>
            {userRequests.length > 0 && (
              <Badge variant="accent" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-800">
                {userRequests.length}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab("institutions")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "institutions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-secondary"
            }`}
          >
            Participating Hospitals & NGOs ({institutions.length})
          </button>
        </div>

        {/* Tab 1: Equipment Catalog */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-subtle">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Bar */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by model, serial tag, or specifications..."
                    className="pl-9 text-xs"
                  />
                </div>

                {/* Drive Mode Filter */}
                <div className="md:col-span-2">
                  <select
                    value={selectedDrive}
                    onChange={(e) => setSelectedDrive(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Drive Modes</option>
                    <option value="manual">Manual Wheelchairs</option>
                    <option value="powered">Powered / Electric</option>
                  </select>
                </div>

                {/* Wheelchair Type Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Wheelchair Types</option>
                    {wheelchairTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Only Toggle */}
                <div className="md:col-span-2 flex items-center justify-end">
                  <label className="flex items-center gap-2 text-xs font-semibold text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Available Now Only</span>
                  </label>
                </div>
              </div>

              {/* Institution Quick Filter Pills */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px]">Partner Facility:</span>
                <button
                  type="button"
                  onClick={() => setSelectedInstitution("all")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    selectedInstitution === "all"
                      ? "bg-secondary text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Facilities
                </button>
                {institutions.map((inst) => {
                  const liveAvail = inventory.filter(
                    (w) => w.institution_id === inst.id && w.availability_status === "available"
                  ).length;
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => setSelectedInstitution(inst.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        selectedInstitution === inst.id
                          ? "bg-primary text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {inst.name.split(" ")[0]} ({liveAvail} avail)
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Inventory Grid */}
            {filteredInventory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.map((wheelchair) => (
                  <InventoryWheelchairCard
                    key={wheelchair.id}
                    wheelchair={wheelchair}
                    onRequestLoan={handleRequestClick}
                    onViewDetails={handleViewDetailsClick}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-secondary">No Matching Wheelchairs Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search criteria, drive mode filter, or disable the &quot;Available Now
                  Only&quot; filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedDrive("all");
                    setSelectedInstitution("all");
                    setOnlyAvailable(false);
                  }}
                  className="text-xs font-bold"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Loan Requests */}
        {activeTab === "my_requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-secondary">Active & Recent Loan Applications</h2>
                <p className="text-xs text-muted-foreground">
                  Track clinical review, hospital counter reservation, and scheduled return dates.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setActiveTab("catalog")}
                className="text-xs font-bold"
              >
                Request Another Loaner
              </Button>
            </div>

            {userRequests.length > 0 ? (
              <div className="space-y-4">
                {userRequests.map((req) => (
                  <TemporaryRequestTracker
                    key={req.id}
                    request={req}
                    onCancel={cancelRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-secondary">No Active Loan Requests</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  If your wheelchair is currently under repair or you have an emergency breakdown, browse the
                  participating hospital inventory.
                </p>
                <Button
                  onClick={() => setActiveTab("catalog")}
                  className="font-bold text-xs"
                >
                  Browse Available Equipment
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Participating Institutions Showcase */}
        {activeTab === "institutions" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-secondary">
                Verified Assistive Technology Centers & Hospital Depots
              </h2>
              <p className="text-xs text-muted-foreground">
                Institutions partnering with RepairLink to maintain community loaner equipment pools in Delhi
                NCR.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institutions.map((inst) => {
                const instUnits = inventory.filter((w) => w.institution_id === inst.id);
                const instAvail = instUnits.filter((w) => w.availability_status === "available").length;
                return (
                  <Card key={inst.id} className="p-6 bg-white border-slate-200 shadow-subtle space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="accent" className="text-[10px] mb-1 font-bold">
                          {inst.badgeText}
                        </Badge>
                        <h3 className="text-base font-bold text-secondary">{inst.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{inst.area}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-emerald-700">
                          {instAvail} / {instUnits.length}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">Units Available</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-secondary">{inst.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-secondary">{inst.counterHours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-secondary font-mono font-medium">{inst.phone}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                      <strong className="text-emerald-950">Lending Guidelines: </strong>
                      {inst.guidelinesSummary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs text-muted-foreground">
                        Coordinator: <strong>{inst.leadCoordinator}</strong>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInstitution(inst.id);
                          setOnlyAvailable(false);
                          setActiveTab("catalog");
                        }}
                        className="text-xs font-bold"
                      >
                        <span>View Stock</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Specifications & Suitability Modal */}
      {specsModalWheelchair && (
        <Dialog open={true} onOpenChange={() => setSpecsModalWheelchair(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {specsModalWheelchair.serial_tag}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {specsModalWheelchair.wheelchair_type}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-secondary">
                {specsModalWheelchair.model_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {specsModalWheelchair.institution_name} • {specsModalWheelchair.institution_location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-muted-foreground block">Drive Mode</span>
                  <strong className="text-secondary capitalize">
                    {specsModalWheelchair.manual_or_powered}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-muted-foreground block">Seat Width</span>
                  <strong className="text-secondary">{specsModalWheelchair.seat_width_cm} cm</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-muted-foreground block">Max Capacity</span>
                  <strong className="text-secondary">{specsModalWheelchair.weight_capacity_kg} kg</strong>
                </div>
              </div>

              {specsModalWheelchair.features && specsModalWheelchair.features.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Accessibility & Equipment Features:
                  </span>
                  <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {specsModalWheelchair.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-1">
                <strong className="block text-[11px]">Lending & Suitability Conditions:</strong>
                <p className="text-[11px] leading-relaxed">{specsModalWheelchair.lending_conditions}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-secondary">
                  Security Deposit:{" "}
                  {specsModalWheelchair.deposit_amount === 0
                    ? "Zero (Waived with Repair Ticket)"
                    : `₹${specsModalWheelchair.deposit_amount}`}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpecsModalWheelchair(null)}
                  >
                    Close
                  </Button>
                  {specsModalWheelchair.availability_status === "available" ? (
                    <Button
                      size="sm"
                      className="font-bold"
                      onClick={() => {
                        const target = specsModalWheelchair;
                        setSpecsModalWheelchair(null);
                        handleRequestClick(target);
                      }}
                    >
                      Request This Loaner
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs text-slate-500 py-1.5 px-3">
                      Currently {specsModalWheelchair.availability_status.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Request Modal */}
      <RequestTemporarySupportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        wheelchair={selectedWheelchairForLoan}
        onSuccess={() => {
          setActiveTab("my_requests");
        }}
      />
    </div>
  );
}
