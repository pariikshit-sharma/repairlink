"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wrench,
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
  Camera,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Disc,
  OctagonAlert,
  Zap,
  BatteryCharging,
  Armchair,
  Hammer,
  ShieldCheck,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MOCK_PROVIDERS,
  PROBLEM_CATEGORIES,
  WHEELCHAIR_TYPES,
  ProviderItem,
} from "@/lib/data/providers";
import { ProviderCard } from "@/components/discovery/provider-card";
import { ProviderMap } from "@/components/discovery/provider-map";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

function FindRepairsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") || searchParams?.get("issue") || "";

  const { user } = useAuth();

  // Intake State (Steps 1-5)
  const [selectedWheelchairType, setSelectedWheelchairType] = useState<string>(
    user?.details && "wheelchair_type" in user.details
      ? user.details.wheelchair_type
      : "Manual Active"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "Wheel damage");
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<string>("South Extension, New Delhi");
  const [intakeCollapsed, setIntakeCollapsed] = useState<boolean>(false);

  // Search, Filter, View State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState<"distance" | "rating" | "eta" | "price">("distance");
  const [viewMode, setViewMode] = useState<"split" | "list">("split");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>("prov-01");

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<ProviderItem | null>(null);
  const [servicePreference, setServicePreference] = useState<"doorstep" | "workshop">("doorstep");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Filter providers based on search, category, and device type
  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter((provider) => {
      // Search text match
      const matchesSearch =
        provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Wheelchair type match (if selected)
      const matchesType =
        !selectedWheelchairType ||
        provider.supportedWheelchairTypes.includes(selectedWheelchairType);

      // Category match
      const matchesCategory =
        !selectedCategory ||
        provider.servicesOffered.some(
          (s) => s.toLowerCase() === selectedCategory.toLowerCase()
        );

      return matchesSearch && matchesType && matchesCategory;
    }).sort((a, b) => {
      if (selectedSort === "distance") return a.distanceKm - b.distanceKm;
      if (selectedSort === "rating") return b.rating - a.rating;
      if (selectedSort === "price") return a.startingPriceInr - b.startingPriceInr;
      return a.distanceKm - b.distanceKm;
    });
  }, [searchQuery, selectedWheelchairType, selectedCategory, selectedSort]);

  // Photo upload handler simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setUploadedPhotos([...uploadedPhotos, fileName]);
      toast.success(`Photo "${fileName}" attached to diagnostics.`);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleOpenBooking = (provider: ProviderItem) => {
    setSelectedProviderForBooking(provider);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    setIsSubmittingBooking(true);
    const ticketId = `RL-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setIsSubmittingBooking(false);
      setBookingModalOpen(false);
      toast.success(
        `Service Ticket #${ticketId} dispatched to ${selectedProviderForBooking?.businessName}!`,
        {
          description: "Technician reviewing diagnostic request. ETA < 45 mins.",
        }
      );
      router.push("/dashboard/user");
    }, 900);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="text-xs">
              Smart Repair Discovery
            </Badge>
            <span className="text-xs text-muted-foreground">• Urban Company + Blinkit Model</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Find Wheelchair Repair Providers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Describe your device issue, verify your location, and match with verified technicians with transparent pricing.
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "split"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-secondary"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map & List</span>
            <span className="sm:hidden">Map</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "list"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-secondary"
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>List Only</span>
          </button>
        </div>
      </div>

      {/* 5-Step Diagnostic Intake Bar (Blinkit / Urban Company Style) */}
      <Card className="border-slate-200/90 shadow-subtle bg-white overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-secondary">
                Wheelchair Diagnostic Intake
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Matches your wheelchair model and malfunction to the right technician kit
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIntakeCollapsed(!intakeCollapsed)}
            className="text-xs font-semibold text-primary"
          >
            {intakeCollapsed ? "Expand Details +" : "Collapse -"}
          </Button>
        </div>

        {!intakeCollapsed && (
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Step 1: Select Wheelchair Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                1. Select Wheelchair Configuration
              </label>
              <div className="flex flex-wrap gap-2">
                {WHEELCHAIR_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedWheelchairType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedWheelchairType === type
                        ? "bg-primary text-white shadow-sm font-bold"
                        : "bg-slate-100 text-secondary hover:bg-slate-200"
                    }`}
                  >
                    {selectedWheelchairType === type && "✓ "} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Problem Category Selection (All 8 categories) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                2. Problem Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {PROBLEM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedCategory === cat.name
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                        : "border-slate-200 bg-white text-secondary hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">
                      {cat.shortName}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {cat.estimatedTriage}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Steps 3, 4, 5 in responsive row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Step 3: Describe Malfunction */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                  3. Describe Malfunction
                </label>
                <textarea
                  rows={2}
                  className="flex w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="e.g. Left rear wheel wobbling when moving, brake slipping on slopes..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              {/* Step 4: Upload Photographs (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                  4. Attach Damage Photos (Optional)
                </label>
                <div className="relative border border-dashed border-slate-300 rounded-lg p-3 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[64px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>Click to attach photo</span>
                  </div>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {uploadedPhotos.map((photo, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-secondary px-2 py-0.5 rounded-md"
                      >
                        <span>{photo}</span>
                        <X
                          className="w-3 h-3 text-error cursor-pointer hover:text-red-700"
                          onClick={() => removePhoto(pIdx)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 5: Location Confirmation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                  5. Service Location
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="Enter locality / landmark"
                    startIcon={<MapPin className="w-4 h-4 text-primary" />}
                    className="text-xs h-10"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Shows technicians serving within your radius.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search, Filter & Sorter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name, locality, or keyword..."
            startIcon={<Search className="w-4 h-4" />}
            className="h-10 text-xs"
          />
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <span className="text-xs font-bold text-secondary">
            {filteredProviders.length} Providers Found
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-secondary font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="distance">Nearest Distance</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Starting Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Discovery Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (if split view) */}
        {viewMode === "split" && (
          <div className="lg:col-span-6 lg:sticky lg:top-24 order-2 lg:order-1">
            <ProviderMap
              providers={filteredProviders}
              selectedProviderId={selectedProviderId}
              onSelectProvider={(id) => setSelectedProviderId(id)}
              onRequestService={handleOpenBooking}
              userCity={userLocation}
            />
          </div>
        )}

        {/* Right Column: Provider Cards List */}
        <div
          className={`${
            viewMode === "split" ? "lg:col-span-6 order-1 lg:order-2" : "lg:col-span-12"
          } space-y-4`}
        >
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={provider.id === selectedProviderId}
                onSelect={() => setSelectedProviderId(provider.id)}
                onRequestService={handleOpenBooking}
              />
            ))
          ) : (
            <Card className="p-8 text-center bg-white border-slate-200">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-base font-bold text-secondary">No Providers Matching Filter</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try widening your wheelchair category or selecting a different problem category above.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                className="mt-4 text-xs font-semibold"
              >
                Reset Diagnostic Filters
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Request Service Multi-Step Modal */}
      {selectedProviderForBooking && (
        <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Service from {selectedProviderForBooking.businessName}</DialogTitle>
              <DialogDescription>
                Review diagnostic details and choose your preferred service mode.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Summary of Diagnostic Ticket */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wheelchair Type:</span>
                  <span className="font-bold text-secondary">{selectedWheelchairType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reported Problem:</span>
                  <span className="font-bold text-primary">{selectedCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Response:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedProviderForBooking.estimatedResponseTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Diagnostic Fee:</span>
                  <span className="font-bold text-secondary">
                    ₹{selectedProviderForBooking.startingPriceInr}
                  </span>
                </div>
              </div>

              {/* Service Mode Selector */}
              <div className="space-y-2">
                <label className="font-bold text-secondary uppercase tracking-wider text-[11px]">
                  Service Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServicePreference("doorstep")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      servicePreference === "doorstep"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-slate-200 bg-white text-secondary"
                    }`}
                  >
                    <p className="font-bold">Doorstep Visit</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Technician visits your location with mobile spare parts kit
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServicePreference("workshop")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      servicePreference === "workshop"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-slate-200 bg-white text-secondary"
                    }`}
                  >
                    <p className="font-bold">Workshop Service</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Deliver your wheelchair to provider&apos;s station
                    </p>
                  </button>
                </div>
              </div>

              {/* Temporary Loaner continuity check */}
              <div className="p-3 rounded-xl bg-accent/40 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Mobility Continuity Guarantee:</strong> If this repair requires overnight shop stay, you can instantly claim a temporary loaner wheelchair from AIIMS / ISIC hospital pool.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingModalOpen(false)}
                disabled={isSubmittingBooking}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmBooking}
                isLoading={isSubmittingBooking}
                className="bg-primary hover:bg-primary-600 font-bold"
              >
                <span>Confirm Service Request</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function FindRepairsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <FindRepairsContent />
    </Suspense>
  );
}
