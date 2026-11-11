"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Plus,
  CheckCircle2,
  Search,
  Trash2,
  Edit2,
  Phone,
  Truck,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  MapPin,
  Upload,
  RotateCcw,
  Wrench,
  Save,
  Clock,
  FileCheck2,
  Calendar,
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
import { useTemporarySupport } from "@/context/temporary-support-context";
import { useAuth } from "@/context/auth-context";
import { usePlatform } from "@/context/platform-context";
import {
  InventoryWheelchair,
  TemporarySupportRequest,
  WheelchairLoanStatus,
  WheelchairConditionRating,
} from "@/lib/supabase/types";
import { toast } from "sonner";

type InstitutionTab = "requests" | "active_loans" | "returns" | "inventory" | "profile";

const DEFAULT_WHEELCHAIR_TYPES = [
  "Standard Folding Transit",
  "Active Rigid Ergonomic",
  "Powered Electric Wheelchair",
  "Tilt-in-Space & Postural Support",
  "Pediatric Active Support",
  "Hygiene & Transit Hybrid",
];

function InstitutionDashboardContent() {
  const searchParams = useSearchParams();
  const { user, switchDemoRole, updateCurrentUserProfile } = useAuth();
  const { categories } = usePlatform();
  const {
    inventory,
    requests,
    institutions,
    approveRequest,
    rejectRequest,
    markAsLent,
    markAsReturned,
    addWheelchair,
    updateWheelchair,
    updateWheelchairStatus,
    deleteWheelchair,
    updateInstitutionProfile,
    resetToDefaults,
  } = useTemporarySupport();

  // Resolve current institution profile
  const currentInstitution = useMemo(() => {
    const details = user?.details;
    const orgName =
      details && "institution_name" in details ? details.institution_name : undefined;
    if (orgName) {
      const matched = institutions.find(
        (i) => i.name.toLowerCase() === orgName.toLowerCase()
      );
      if (matched) return matched;
    }
    return institutions[0];
  }, [institutions, user?.details]);

  // Available wheelchair type options merged with platform categories
  const wheelchairTypeOptions = useMemo(() => {
    const adminTypes = categories
      .filter((c) => c.kind === "wheelchair_type" && c.is_active)
      .map((c) => c.name);
    return Array.from(new Set([...DEFAULT_WHEELCHAIR_TYPES, ...adminTypes]));
  }, [categories]);

  // Tab State synced with ?tab=
  const [activeTab, setActiveTab] = useState<InstitutionTab>("requests");

  useEffect(() => {
    const tabParam = searchParams.get("tab") as InstitutionTab | null;
    if (
      tabParam &&
      ["requests", "active_loans", "returns", "inventory", "profile"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Search & Filter in Inventory
  const [invSearch, setInvSearch] = useState("");
  const [invStatusFilter, setInvStatusFilter] = useState<string>("all");

  // Approval Modal State
  const [selectedReqForApproval, setSelectedReqForApproval] =
    useState<TemporarySupportRequest | null>(null);
  const [pickupInstructions, setPickupInstructions] = useState(
    "Approved. Collect at Room 104, PMR Ground Floor, AIIMS Ansari Nagar. Bring Govt Photo ID & Repair Ticket."
  );
  const [rehabNotes, setRehabNotes] = useState(
    "Clinical seating profile verified. Dimensions match patient requirements."
  );

  // Decline Modal State
  const [selectedReqForDecline, setSelectedReqForDecline] =
    useState<TemporarySupportRequest | null>(null);
  const [declineReason, setDeclineReason] = useState(
    "Seating width incompatible with patient medical profile; risk of posture tilt."
  );

  // Return Modal State
  const [selectedReqForReturn, setSelectedReqForReturn] =
    useState<TemporarySupportRequest | null>(null);
  const [returnCondition, setReturnCondition] = useState(
    "Returned clean. Tires inspected, antimicrobial wipe completed."
  );

  // Add Wheelchair Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newModel, setNewModel] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newType, setNewType] = useState("Standard Folding Transit");
  const [newDrive, setNewDrive] = useState<"manual" | "powered">("manual");
  const [newSeatWidth, setNewSeatWidth] = useState("42");
  const [newWeightCap, setNewWeightCap] = useState("120");
  const [newCondition, setNewCondition] = useState<WheelchairConditionRating>("tier_a_mint");
  const [newAvailability, setNewAvailability] = useState<WheelchairLoanStatus>("available");
  const [newDeposit, setNewDeposit] = useState("0");
  const [newFeatures, setNewFeatures] = useState(
    "Puncture-proof PU rear tires, Adjustable footrests, Pressure-relief cushion"
  );
  const [newConditions, setNewConditions] = useState(
    "Free temporary loan for verified active repair ticket holders (max 14 days)."
  );
  const [newImageUrl, setNewImageUrl] = useState(
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
  );

  // Edit Wheelchair Modal State
  const [editingWheelchair, setEditingWheelchair] = useState<InventoryWheelchair | null>(null);
  const [editModel, setEditModel] = useState("");
  const [editSerial, setEditSerial] = useState("");
  const [editType, setEditType] = useState("Standard Folding Transit");
  const [editDrive, setEditDrive] = useState<"manual" | "powered">("manual");
  const [editSeatWidth, setEditSeatWidth] = useState("42");
  const [editWeightCap, setEditWeightCap] = useState("120");
  const [editCondition, setEditCondition] = useState<WheelchairConditionRating>("tier_a_mint");
  const [editAvailability, setEditAvailability] = useState<WheelchairLoanStatus>("available");
  const [editDeposit, setEditDeposit] = useState("0");
  const [editFeatures, setEditFeatures] = useState("");
  const [editConditions, setEditConditions] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Institution Profile Edit Form State
  const [instName, setInstName] = useState(currentInstitution?.name || "");
  const [instCategory, setInstCategory] = useState<"hospital" | "rehabilitation_centre" | "ngo">(
    currentInstitution?.category || "hospital"
  );
  const [instArea, setInstArea] = useState(currentInstitution?.area || "");
  const [instAddress, setInstAddress] = useState(currentInstitution?.address || "");
  const [instPhone, setInstPhone] = useState(currentInstitution?.phone || "");
  const [instEmail, setInstEmail] = useState(currentInstitution?.email || "");
  const [instHours, setInstHours] = useState(currentInstitution?.counterHours || "");
  const [instCoordinator, setInstCoordinator] = useState(
    currentInstitution?.leadCoordinator || ""
  );
  const [instGuidelines, setInstGuidelines] = useState(
    currentInstitution?.guidelinesSummary || ""
  );

  useEffect(() => {
    if (currentInstitution) {
      setInstName(currentInstitution.name);
      setInstCategory(currentInstitution.category);
      setInstArea(currentInstitution.area);
      setInstAddress(currentInstitution.address);
      setInstPhone(currentInstitution.phone);
      setInstEmail(currentInstitution.email);
      setInstHours(currentInstitution.counterHours);
      setInstCoordinator(currentInstitution.leadCoordinator);
      setInstGuidelines(currentInstitution.guidelinesSummary);
    }
  }, [currentInstitution]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setter(reader.result);
        toast.success("Device photo attached");
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Modal populated with item data
  const openEditModal = (wc: InventoryWheelchair) => {
    setEditingWheelchair(wc);
    setEditModel(wc.model_name);
    setEditSerial(wc.serial_tag);
    setEditType(wc.wheelchair_type);
    setEditDrive(wc.manual_or_powered);
    setEditSeatWidth(String(wc.seat_width_cm));
    setEditWeightCap(String(wc.weight_capacity_kg));
    setEditCondition(wc.condition_rating);
    setEditAvailability(wc.availability_status);
    setEditDeposit(String(wc.deposit_amount));
    setEditFeatures(wc.features.join(", "));
    setEditConditions(wc.lending_conditions);
    setEditImageUrl(wc.image_url);
  };

  // Dynamic Metrics computed strictly from live inventory & lending records
  const totalCount = inventory.length;
  const availableCount = inventory.filter((w) => w.availability_status === "available").length;
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reservedReadyLoans = requests.filter((r) => r.status === "approved");
  const currentlyLentLoans = requests.filter((r) => r.status === "lent_active");
  const activeLoans = requests.filter(
    (r) => r.status === "approved" || r.status === "lent_active"
  );
  const returnedLoans = requests.filter((r) => r.status === "returned");
  const currentlyLentCount = inventory.filter(
    (w) => w.availability_status === "currently_lent"
  ).length;
  const maintenanceUnits = inventory.filter(
    (w) => w.availability_status === "under_maintenance"
  );
  const inMaintenanceCount = maintenanceUnits.length;

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((w) => {
      if (invSearch.trim()) {
        const q = invSearch.toLowerCase();
        const matchesName = w.model_name.toLowerCase().includes(q);
        const matchesTag = w.serial_tag.toLowerCase().includes(q);
        const matchesType = w.wheelchair_type.toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesType) return false;
      }
      if (invStatusFilter !== "all" && w.availability_status !== invStatusFilter) {
        return false;
      }
      return true;
    });
  }, [inventory, invSearch, invStatusFilter]);

  const handleApproveSubmit = () => {
    if (!selectedReqForApproval) return;
    approveRequest(selectedReqForApproval.id, pickupInstructions, rehabNotes);
    setSelectedReqForApproval(null);
  };

  const handleDeclineSubmit = () => {
    if (!selectedReqForDecline) return;
    rejectRequest(selectedReqForDecline.id, declineReason);
    setSelectedReqForDecline(null);
  };

  const handleReturnSubmit = () => {
    if (!selectedReqForReturn) return;
    markAsReturned(selectedReqForReturn.id, returnCondition);
    setSelectedReqForReturn(null);
  };

  const handleAddWheelchairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim() || !newSerial.trim()) {
      toast.error("Please provide Model Name and Serial Tag");
      return;
    }

    addWheelchair({
      institution_id: currentInstitution.id,
      institution_name: currentInstitution.name,
      institution_location: currentInstitution.area,
      institution_phone: currentInstitution.phone,
      serial_tag: newSerial.trim().toUpperCase(),
      model_name: newModel.trim(),
      wheelchair_type: newType,
      manual_or_powered: newDrive,
      seat_width_cm: parseFloat(newSeatWidth) || 40,
      weight_capacity_kg: parseFloat(newWeightCap) || 120,
      condition_rating: newCondition,
      availability_status: newAvailability,
      lending_conditions: newConditions,
      deposit_amount: parseFloat(newDeposit) || 0,
      image_url: newImageUrl,
      features: newFeatures
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setAddModalOpen(false);
    setNewModel("");
    setNewSerial("");
  };

  const handleEditWheelchairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWheelchair) return;
    if (!editModel.trim() || !editSerial.trim()) {
      toast.error("Model Name and Serial Tag are required");
      return;
    }

    updateWheelchair(editingWheelchair.id, {
      model_name: editModel.trim(),
      serial_tag: editSerial.trim().toUpperCase(),
      wheelchair_type: editType,
      manual_or_powered: editDrive,
      seat_width_cm: parseFloat(editSeatWidth) || 40,
      weight_capacity_kg: parseFloat(editWeightCap) || 120,
      condition_rating: editCondition,
      availability_status: editAvailability,
      deposit_amount: parseFloat(editDeposit) || 0,
      features: editFeatures
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      lending_conditions: editConditions,
      image_url: editImageUrl,
    });

    setEditingWheelchair(null);
  };

  const handleSaveInstitutionProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInstitution) return;
    if (!instName.trim() || !instAddress.trim()) {
      toast.error("Institution name and physical depot address are required.");
      return;
    }

    updateInstitutionProfile(currentInstitution.id, {
      name: instName.trim(),
      category: instCategory,
      area: instArea.trim(),
      address: instAddress.trim(),
      phone: instPhone.trim(),
      email: instEmail.trim(),
      counterHours: instHours.trim(),
      leadCoordinator: instCoordinator.trim(),
      guidelinesSummary: instGuidelines.trim(),
    });

    updateCurrentUserProfile(
      {
        phone: instPhone.trim(),
        city: instArea.trim(),
        address: instAddress.trim(),
      },
      {
        institution_name: instName.trim(),
        institution_category: instCategory,
        contact_person: instCoordinator.trim(),
        lending_guidelines: instGuidelines.trim(),
      }
    );

    toast.success("Institution Profile & Lending Guidelines Saved");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="accent" className="text-xs bg-emerald-100 text-emerald-800 font-bold">
              Institution Mobility Portal
            </Badge>
            <Badge variant="outline" className="text-xs text-secondary font-semibold">
              {currentInstitution?.name}
            </Badge>
            {user?.profile?.verification_status === "verified" && (
              <Badge variant="success" className="text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Partner
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Assistive Device Inventory & Lending Pool
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage loaner wheelchairs, approve temporary mobility requests, and oversee return hygiene.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs text-muted-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Reset Demo Pool</span>
          </Button>

          <Button
            size="default"
            onClick={() => setAddModalOpen(true)}
            className="font-bold shadow-sm text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Equipment to Pool</span>
          </Button>
        </div>
      </div>

      {/* Dynamic Metrics Row (Strictly calculated from live state) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Total Wheelchairs</span>
          <div className="text-2xl font-black text-secondary mt-1">{totalCount}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Registered in pool</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Available Now</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{availableCount}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Ready for dispatch</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Pending Requests</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingRequests.length}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting clinical clearance</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-muted-foreground">Currently Lent Out</span>
          <div className="text-2xl font-black text-primary mt-1">{currentlyLentCount}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active patient loans</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-subtle col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-muted-foreground">Requiring Maintenance</span>
          <div className="text-2xl font-black text-slate-600 mt-1">{inMaintenanceCount}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sanitization & servicing</p>
        </Card>
      </div>

      {/* Main Tab Navigation (Mobile horizontal scroll safe) */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-5 no-scrollbar">
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Lending Requests</span>
          {pendingRequests.length > 0 && (
            <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4">
              {pendingRequests.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("active_loans")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === "active_loans"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Active Lending</span>
          {activeLoans.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-secondary text-white">
              {activeLoans.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === "returns"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Return Management</span>
          {(currentlyLentLoans.length > 0 || inMaintenanceCount > 0) && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {currentlyLentLoans.length + inMaintenanceCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "inventory"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary"
          }`}
        >
          <span>Institution Profile</span>
        </button>
      </div>

      {/* Tab 1: Incoming Loan Requests */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-secondary">
                Patient Loan Applications Awaiting Clinical Clearance
              </h2>
              <p className="text-xs text-muted-foreground">
                Verify seating dimensions against patient profile to approve or decline reservation.
              </p>
            </div>
            <Badge variant="warning" className="text-xs self-start sm:self-auto">
              {pendingRequests.length} Applications Pending
            </Badge>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="p-5 bg-white border-slate-200 shadow-subtle space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{req.request_number}
                        </span>
                        {req.repair_ticket_id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium text-emerald-800 bg-emerald-50"
                          >
                            Verified Workshop Ticket #{req.repair_ticket_id}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-secondary mt-1">
                        Patient: {req.user_name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {req.user_phone}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{req.user_address}</span>
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReqForDecline(req)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedReqForApproval(req)}
                        className="text-xs font-bold bg-primary hover:bg-primary-hover text-white"
                      >
                        Approve & Reserve
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Requested Device
                      </span>
                      <p className="font-bold text-secondary mt-0.5">
                        {req.wheelchair?.model_name || "Standard Loaner"}
                      </p>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Tag: {req.wheelchair?.serial_tag} (Seat {req.wheelchair?.seat_width_cm}cm)
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Duration & Handover
                      </span>
                      <p className="font-bold text-secondary mt-0.5">
                        {req.requested_start_date} → {req.requested_end_date}
                      </p>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        Preference: {req.delivery_mode === "pickup" ? "Depot Self-Pickup" : "Home Delivery"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block">
                        Patient Posture / Clinical Note
                      </span>
                      <p className="text-[11px] text-amber-950 mt-0.5 line-clamp-2">
                        {req.patient_medical_notes || "Standard loan requested for work & clinic commute."}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-secondary">No Pending Loan Requests</h3>
              <p className="text-xs text-muted-foreground">
                All incoming temporary wheelchair support requests have been processed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Lending */}
      {activeTab === "active_loans" && (
        <div className="space-y-6">
          {/* Approved & Reserved Awaiting Handover */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-secondary">
                  Reserved Units Awaiting Handover
                </h2>
                <p className="text-xs text-muted-foreground">
                  Confirm physical handover or hospital dispatch once the patient collects the loaner.
                </p>
              </div>
              <Badge variant="accent" className="text-xs">
                {reservedReadyLoans.length} Ready
              </Badge>
            </div>

            {reservedReadyLoans.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {reservedReadyLoans.map((loan) => (
                  <Card key={loan.id} className="p-5 bg-white border-slate-200 shadow-subtle space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            #{loan.request_number}
                          </span>
                          <Badge variant="accent" className="text-[10px] font-bold">
                            Reserved at Depot
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-secondary mt-1">
                          {loan.wheelchair?.model_name || "Loaner Unit"} ({loan.wheelchair?.serial_tag})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Patient: <strong>{loan.user_name}</strong> • Phone: {loan.user_phone}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => markAsLent(loan.id)}
                        className="text-xs font-bold bg-primary hover:bg-primary-hover text-white shrink-0"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        <span>Confirm Handover / Dispatch</span>
                      </Button>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <strong>Instructions sent:</strong>{" "}
                      {loan.pickup_instructions || "Standard depot counter collection."}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-muted-foreground">
                No reserved wheelchairs currently awaiting patient pickup.
              </div>
            )}
          </div>

          {/* Currently In Patient Use */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-secondary">
                  Currently Lent Out to Patients
                </h2>
                <p className="text-xs text-muted-foreground">
                  Active temporary mobility deployments safeguarding user independence.
                </p>
              </div>
              <Badge variant="default" className="text-xs bg-secondary text-white">
                {currentlyLentLoans.length} Active
              </Badge>
            </div>

            {currentlyLentLoans.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {currentlyLentLoans.map((loan) => (
                  <Card key={loan.id} className="p-5 bg-white border-slate-200 shadow-subtle space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            #{loan.request_number}
                          </span>
                          <Badge variant="default" className="text-[10px] font-bold">
                            Currently in Patient Use
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-secondary mt-1">
                          {loan.wheelchair?.model_name || "Loaner Unit"} ({loan.wheelchair?.serial_tag})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Patient: <strong>{loan.user_name}</strong> • Phone: {loan.user_phone}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setSelectedReqForReturn(loan)}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        <span>Process Return & Restock</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Expected Return:</span>
                        <span className="font-bold text-secondary">
                          {loan.expected_return_date || loan.requested_end_date}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Handover Mode:</span>
                        <span className="font-bold text-secondary capitalize">
                          {loan.delivery_mode === "pickup" ? "Depot Self-Pickup" : "Hospital Home Delivery"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Linked Ticket:</span>
                        <span className="font-mono font-semibold text-primary">
                          {loan.repair_ticket_id || "Clinical Loan"}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Sparkles className="w-8 h-8 text-primary mx-auto" />
                <h3 className="text-sm font-bold text-secondary">No Active Outgoing Loans</h3>
                <p className="text-xs text-muted-foreground">
                  All handed-over equipment has been inspected and returned.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Return Management & Maintenance Turnaround */}
      {activeTab === "returns" && (
        <div className="space-y-6">
          {/* Active Loans Due for Return */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-secondary">
                  Scheduled Return Tracking & Intake Sign-Off
                </h2>
                <p className="text-xs text-muted-foreground">
                  Check in returned loaner units, log antimicrobial sanitization, and return them to pool stock.
                </p>
              </div>
              <Badge variant="default" className="text-xs self-start sm:self-auto">
                {currentlyLentLoans.length} Awaiting Return
              </Badge>
            </div>

            {currentlyLentLoans.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {currentlyLentLoans.map((loan) => (
                  <Card key={loan.id} className="p-5 bg-white border-slate-200 shadow-subtle space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            #{loan.request_number}
                          </span>
                          <Badge variant="warning" className="text-[10px]">
                            Due {loan.expected_return_date || loan.requested_end_date}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-secondary mt-1">
                          {loan.wheelchair?.model_name || "Loaner Unit"} • Tag{" "}
                          {loan.wheelchair?.serial_tag}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Borrower: <strong>{loan.user_name}</strong> ({loan.user_phone})
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setSelectedReqForReturn(loan)}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        <span>Mark Returned & Restocked</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-white border-slate-200 text-xs text-muted-foreground">
                No loaner wheelchairs are currently pending return check-in.
              </Card>
            )}
          </div>

          {/* Units Under Maintenance / Sanitization */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Units Requiring Maintenance & Sanitization</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Verify tire pressure, brake locks, and antimicrobial cleaning before making units bookable.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {maintenanceUnits.length} In Bay
              </Badge>
            </div>

            {maintenanceUnits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {maintenanceUnits.map((wc) => (
                  <Card key={wc.id} className="p-4 bg-white border-slate-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {wc.serial_tag}
                      </span>
                      <h4 className="font-bold text-sm text-secondary truncate">{wc.model_name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {wc.wheelchair_type} • Seat {wc.seat_width_cm}cm
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateWheelchairStatus(wc.id, "available")}
                      className="text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark Available
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-slate-50 border-slate-200 text-xs text-muted-foreground">
                Zero units currently flagged under maintenance. All depot chairs are sanitized.
              </Card>
            )}
          </div>

          {/* Returned & Inspected History */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Completed Return Audit Log ({returnedLoans.length})</span>
              </h2>
            </div>

            {returnedLoans.length > 0 ? (
              <div className="space-y-2.5">
                {returnedLoans.map((loan) => (
                  <Card key={loan.id} className="p-4 bg-slate-50/70 border-slate-200 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-primary">#{loan.request_number}</span>
                        <Badge variant="success" className="text-[10px]">
                          Returned & Restocked
                        </Badge>
                        <span className="font-semibold text-secondary">
                          {loan.wheelchair?.model_name || "Loaner"} ({loan.wheelchair?.serial_tag})
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Checked in: {loan.returned_at || loan.updated_at}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1.5">
                      Borrower: <strong>{loan.user_name}</strong> • Condition Note:{" "}
                      {loan.institution_notes || "Inspected and sanitized."}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-white border-slate-200 text-xs text-muted-foreground">
                No completed returns recorded yet in this session.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Inventory Registry */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <Card className="p-4 bg-white border-slate-200 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  placeholder="Filter inventory by tag, model, or type..."
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={invStatusFilter}
                  onChange={(e) => setInvStatusFilter(e.target.value)}
                  className="h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Statuses ({inventory.length})</option>
                  <option value="available">Available Now</option>
                  <option value="request_pending">Request Pending</option>
                  <option value="reserved">Reserved</option>
                  <option value="currently_lent">Currently Lent</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>

                <Button
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                  className="font-bold text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Unit</span>
                </Button>
              </div>
            </div>
          </Card>

          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Serial Tag & Model</th>
                    <th className="py-3 px-4">Type / Drive</th>
                    <th className="py-3 px-4">Seat / Load</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((wc) => (
                    <tr key={wc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 hidden sm:block">
                            <Image
                              src={wc.image_url}
                              alt={wc.model_name}
                              fill
                              unoptimized={wc.image_url.startsWith("data:")}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-primary">{wc.serial_tag}</div>
                            <div className="font-semibold text-secondary">{wc.model_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-secondary font-medium block">{wc.wheelchair_type}</span>
                        <span className="text-muted-foreground capitalize text-[11px]">
                          {wc.manual_or_powered}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-secondary">{wc.seat_width_cm} cm</span>
                        <span className="text-muted-foreground block text-[11px]">
                          Max {wc.weight_capacity_kg} kg
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                          {wc.condition_rating === "tier_a_mint"
                            ? "Tier A Mint"
                            : wc.condition_rating === "tier_b_good"
                            ? "Tier B Good"
                            : "Tier C Functional"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={wc.availability_status}
                          onChange={(e) =>
                            updateWheelchairStatus(wc.id, e.target.value as WheelchairLoanStatus)
                          }
                          className="h-8 px-2 py-1 text-[11px] font-semibold rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="available">Available</option>
                          <option value="request_pending">Request Pending</option>
                          <option value="reserved">Reserved</option>
                          <option value="currently_lent">Currently Lent</option>
                          <option value="under_maintenance">Under Maintenance</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(wc)}
                            className="text-slate-500 hover:text-primary transition-colors p-1.5 rounded hover:bg-slate-100"
                            title="Edit Wheelchair Specifications"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWheelchair(wc.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                            title="Remove Wheelchair"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No wheelchairs match your current search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Editable Institution Profile & Guidelines */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-white border-slate-200 shadow-subtle">
            <h3 className="text-base font-bold text-secondary flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Edit Institution & Depot Profile</span>
            </h3>

            <form onSubmit={handleSaveInstitutionProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institution / Hospital Name *
                  </label>
                  <Input
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institution Category
                  </label>
                  <select
                    value={instCategory}
                    onChange={(e) =>
                      setInstCategory(e.target.value as "hospital" | "rehabilitation_centre" | "ngo")
                    }
                    className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-secondary"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="rehabilitation_centre">Rehabilitation Centre</option>
                    <option value="ngo">NGO / Accessibility Trust</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City Zone / Locality
                  </label>
                  <Input value={instArea} onChange={(e) => setInstArea(e.target.value)} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Coordinator / Physio
                  </label>
                  <Input
                    value={instCoordinator}
                    onChange={(e) => setInstCoordinator(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Depot Counter Address *
                </label>
                <Input
                  value={instAddress}
                  onChange={(e) => setInstAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Direct Helpline Phone
                  </label>
                  <Input value={instPhone} onChange={(e) => setInstPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Contact Email
                  </label>
                  <Input value={instEmail} onChange={(e) => setInstEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Counter Operating Hours
                  </label>
                  <Input value={instHours} onChange={(e) => setInstHours(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Public Lending Guidelines Summary
                </label>
                <textarea
                  rows={3}
                  value={instGuidelines}
                  onChange={(e) => setInstGuidelines(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button type="submit" size="sm" className="font-bold text-xs">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Institution Profile
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-secondary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Hospital Lending Protocol</span>
            </h3>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 space-y-3 leading-relaxed">
              <p>
                <strong>1. Patient Eligibility:</strong> Patients with an ongoing active repair ticket
                (#RL-XXXX) receive priority reservation and 100% waiver of security deposits.
              </p>
              <p>
                <strong>2. Clinical Matching:</strong> Seat width within +/- 2cm of patient hip
                clearance is mandatory to avoid pelvic torsion and decubitus pressure ulcers.
              </p>
              <p>
                <strong>3. Return Inspection:</strong> Upon return, wheel bearings, footplates, and
                cushions undergo autoclave/antimicrobial sanitization before restocking to Available
                status.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-muted-foreground flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Profile updates sync immediately to the public Temporary Support catalog so patients
                always see accurate depot hours and contact numbers.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Approve Request Modal */}
      {selectedReqForApproval && (
        <Dialog open={true} onOpenChange={() => setSelectedReqForApproval(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-secondary">
                Approve Temporary Mobility Request
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Confirm loan for <strong>{selectedReqForApproval.user_name}</strong> (
                {selectedReqForApproval.request_number})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Collection / Handover Instructions for Patient:
                </label>
                <textarea
                  rows={3}
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Clinical Seating Clearance Note:
                </label>
                <textarea
                  rows={2}
                  value={rehabNotes}
                  onChange={(e) => setRehabNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedReqForApproval(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApproveSubmit}
                className="font-bold bg-primary hover:bg-primary-hover text-white text-xs"
              >
                Confirm Approval & Reserve
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Decline Request Modal */}
      {selectedReqForDecline && (
        <Dialog open={true} onOpenChange={() => setSelectedReqForDecline(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-secondary">
                Decline Temporary Mobility Request
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Decline application for {selectedReqForDecline.user_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <label className="block text-[11px] font-semibold text-slate-700">
                Reason for Clinical Ineligibility:
              </label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedReqForDecline(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeclineSubmit}
                className="font-bold text-xs"
              >
                Decline Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Return & Restock Modal */}
      {selectedReqForReturn && (
        <Dialog open={true} onOpenChange={() => setSelectedReqForReturn(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-secondary">
                Confirm Return & Restock Unit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Restock {selectedReqForReturn.wheelchair?.model_name} (
                {selectedReqForReturn.wheelchair?.serial_tag})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <label className="block text-[11px] font-semibold text-slate-700">
                Inspection & Sanitization Sign-off:
              </label>
              <textarea
                rows={3}
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedReqForReturn(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReturnSubmit}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                Complete Return & Mark Available
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Wheelchair Modal */}
      {addModalOpen && (
        <Dialog open={true} onOpenChange={() => setAddModalOpen(false)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-secondary">
                Register Wheelchair in Loan Pool
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add hospital equipment to the community mobility continuity network.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddWheelchairSubmit} className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Name *</label>
                  <Input
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Ottobock Motus Active"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Serial Tag / Inventory ID *
                  </label>
                  <Input
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="e.g. AIIMS-LN-055"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wheelchair Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    {wheelchairTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Configuration</label>
                  <select
                    value={newDrive}
                    onChange={(e) => setNewDrive(e.target.value as "manual" | "powered")}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    <option value="manual">Manual Push / Hand-rim</option>
                    <option value="powered">Powered / Joystick Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seat Width (cm)</label>
                  <Input
                    type="number"
                    value={newSeatWidth}
                    onChange={(e) => setNewSeatWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Weight (kg)</label>
                  <Input
                    type="number"
                    value={newWeightCap}
                    onChange={(e) => setNewWeightCap(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition Tier</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as WheelchairConditionRating)}
                    className="w-full h-10 px-2 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    <option value="tier_a_mint">Tier A (Mint)</option>
                    <option value="tier_b_good">Tier B (Inspected)</option>
                    <option value="tier_c_functional">Tier C (Functional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Availability Status
                  </label>
                  <select
                    value={newAvailability}
                    onChange={(e) => setNewAvailability(e.target.value as WheelchairLoanStatus)}
                    className="w-full h-10 px-2 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    <option value="available">Available for Loan</option>
                    <option value="reserved">Reserved</option>
                    <option value="under_maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Refundable Deposit (Rs.)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    placeholder="0 for zero deposit"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Features & Highlights (comma-separated)
                </label>
                <Input
                  value={newFeatures}
                  onChange={(e) => setNewFeatures(e.target.value)}
                  placeholder="Pneumatic rear wheels, Swing-away footrests, Cushion"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lending Guidelines & Restrictions
                </label>
                <Input
                  value={newConditions}
                  onChange={(e) => setNewConditions(e.target.value)}
                  placeholder="e.g. Free loan for 14 days with active ticket."
                />
              </div>

              {/* Equipment Photo Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">
                  Device Photo (Upload Image or URL)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                    <Image
                      src={newImageUrl}
                      alt="Wheelchair preview"
                      fill
                      unoptimized={newImageUrl.startsWith("data:")}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer font-semibold text-secondary text-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Upload Photo from Computer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setNewImageUrl)}
                        className="hidden"
                      />
                    </label>
                    <Input
                      value={newImageUrl.startsWith("data:") ? "Uploaded image file attached" : newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Or paste HTTPS image URL..."
                      className="text-[11px] h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold text-xs">
                  Register in Loan Pool
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Wheelchair Modal */}
      {editingWheelchair && (
        <Dialog open={true} onOpenChange={() => setEditingWheelchair(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-secondary">
                Edit Wheelchair Record
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update technical specs, condition tier, or photo for {editingWheelchair.serial_tag}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditWheelchairSubmit} className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Name *</label>
                  <Input
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Tag *</label>
                  <Input
                    value={editSerial}
                    onChange={(e) => setEditSerial(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wheelchair Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    {wheelchairTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Configuration</label>
                  <select
                    value={editDrive}
                    onChange={(e) => setEditDrive(e.target.value as "manual" | "powered")}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    <option value="manual">Manual Push / Hand-rim</option>
                    <option value="powered">Powered / Joystick Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seat Width (cm)</label>
                  <Input
                    type="number"
                    value={editSeatWidth}
                    onChange={(e) => setEditSeatWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Weight (kg)</label>
                  <Input
                    type="number"
                    value={editWeightCap}
                    onChange={(e) => setEditWeightCap(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition Tier</label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value as WheelchairConditionRating)}
                    className="w-full h-10 px-2 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    <option value="tier_a_mint">Tier A (Mint)</option>
                    <option value="tier_b_good">Tier B (Inspected)</option>
                    <option value="tier_c_functional">Tier C (Functional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value as WheelchairLoanStatus)}
                    className="w-full h-10 px-2 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium text-secondary"
                  >
                    <option value="available">Available</option>
                    <option value="request_pending">Request Pending</option>
                    <option value="reserved">Reserved</option>
                    <option value="currently_lent">Currently Lent</option>
                    <option value="under_maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Refundable Deposit (Rs.)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editDeposit}
                    onChange={(e) => setEditDeposit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Features (comma-separated)
                </label>
                <Input value={editFeatures} onChange={(e) => setEditFeatures(e.target.value)} />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lending Conditions
                </label>
                <Input
                  value={editConditions}
                  onChange={(e) => setEditConditions(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Device Photo</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                    <Image
                      src={editImageUrl}
                      alt="Wheelchair preview"
                      fill
                      unoptimized={editImageUrl.startsWith("data:")}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer font-semibold text-secondary text-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Upload Replacement Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setEditImageUrl)}
                        className="hidden"
                      />
                    </label>
                    <Input
                      value={editImageUrl.startsWith("data:") ? "Uploaded image file attached" : editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="text-[11px] h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingWheelchair(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold text-xs">
                  Save Equipment Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Evaluation Role Switcher Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-secondary">Evaluating for SBI Young Innovators Ideathon?</span>
          <p className="text-muted-foreground">Switch to other stakeholder portals with RBAC session update:</p>
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
          <Link href="/temporary-support" className="text-primary font-bold hover:underline">
            Temporary Support Catalog →
          </Link>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => switchDemoRole("admin")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Admin Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstitutionDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground">
          Loading institution lending pool & inventory...
        </div>
      }
    >
      <InstitutionDashboardContent />
    </Suspense>
  );
}
