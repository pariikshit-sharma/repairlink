"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wrench,
  Disc,
  OctagonAlert,
  Zap,
  BatteryCharging,
  Armchair,
  Hammer,
  ShieldCheck,
  HelpCircle,
  Camera,
  Upload,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  Home,
  Building,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PROBLEM_CATEGORIES, MOCK_PROVIDERS } from "@/lib/data/providers";
import { ServicePreference } from "@/lib/supabase/types";
import { useRepairs } from "@/context/repair-context";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

const USER_WHEELCHAIRS = [
  {
    id: "wc-1",
    type: "Manual Active",
    brand: "Ottobock",
    model: "Zenit R (Rigid Frame)",
    serial: "#OB-2024-8841",
    specs: "40cm seat width • 24-inch pneumatic wheels",
    isPrimary: true,
  },
  {
    id: "wc-2",
    type: "Motorized / Electric",
    brand: "Karma",
    model: "Ergo Stand 100",
    serial: "#KM-2023-4102",
    specs: "24V 20Ah Lithium • Joystick control",
    isPrimary: false,
  },
];

function BookRepairWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams?.get("category") || searchParams?.get("issue") || "";
  const preselectedProviderId = searchParams?.get("providerId") || "";

  const { createRepairRequest } = useRepairs();
  const { user } = useAuth();

  // Wizard Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Wheelchair Selection
  const [selectedWheelchairId, setSelectedWheelchairId] = useState(USER_WHEELCHAIRS[0].id);

  // Step 2: Issue Category
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || "Wheel damage");

  // Step 3: Malfunction Description
  const [description, setDescription] = useState("");
  const [symptomOnset, setSymptomOnset] = useState("Past 24 hours");

  // Step 4: Images
  const [images, setImages] = useState<string[]>([]);

  // Step 5: Provider Selection
  const [providerSelectionMode, setProviderSelectionMode] = useState<"auto" | "specific">(
    preselectedProviderId ? "specific" : "auto"
  );
  const [selectedProviderId, setSelectedProviderId] = useState(preselectedProviderId || MOCK_PROVIDERS[0].id);

  // Step 6: Service Preference
  const [servicePreference, setServicePreference] = useState<ServicePreference>("at_home");
  const [serviceAddress, setServiceAddress] = useState(
    user?.profile?.address || "B-42, South Extension Part 1, New Delhi 110049"
  );
  const [urgency, setUrgency] = useState<"standard" | "urgent" | "emergency">("urgent");

  const selectedWheelchair =
    USER_WHEELCHAIRS.find((w) => w.id === selectedWheelchairId) || USER_WHEELCHAIRS[0];

  const selectedProvider =
    providerSelectionMode === "specific"
      ? MOCK_PROVIDERS.find((p) => p.id === selectedProviderId) || MOCK_PROVIDERS[0]
      : null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setImages([...images, fileName]);
      toast.success(`Photo "${fileName}" attached.`);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Step Validation Check
  const canProceed = () => {
    if (currentStep === 1) return !!selectedWheelchairId;
    if (currentStep === 2) return !!selectedCategory;
    if (currentStep === 3) return description.trim().length >= 10;
    if (currentStep === 4) return true; // Optional images
    if (currentStep === 5) return true;
    if (currentStep === 6) return serviceAddress.trim().length >= 5;
    return true;
  };

  // Step 7: Final Submit
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      const ticketNumber = await createRepairRequest({
        wheelchair: {
          type: selectedWheelchair.type,
          brand: selectedWheelchair.brand,
          model: selectedWheelchair.model,
          serial: selectedWheelchair.serial,
        },
        issueCategory: selectedCategory,
        description: `${description} (Onset: ${symptomOnset})`,
        images,
        providerId: selectedProvider ? selectedProvider.id : null,
        providerName: selectedProvider ? selectedProvider.businessName : "Auto-Match (Apex Mobility Hub)",
        servicePreference,
        serviceAddress,
        urgency,
      });

      setIsSubmitting(false);
      router.push(`/repairs/${ticketNumber}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Booking submission failed. Please try again.");
    }
  };

  const stepTitles = [
    "Select Wheelchair",
    "Issue Category",
    "Describe Issue",
    "Attach Photos",
    "Select Provider",
    "Service Preference",
    "Review & Confirm",
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              7-Step Repair Lifecycle Wizard
            </Badge>
            <span className="text-xs text-muted-foreground">Step {currentStep} of 7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
            Book Wheelchair Service
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete diagnostics intake for rapid doorstep technician matching & repair management.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="text-xs font-semibold self-start sm:self-auto">
          <Link href="/dashboard/user">Cancel & Return to Dashboard</Link>
        </Button>
      </div>

      {/* 7-Step Visual Progress Tracker */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`w-full h-2 rounded-full transition-all ${
                    isCompleted
                      ? "bg-emerald-500"
                      : isCurrent
                      ? "bg-primary"
                      : "bg-slate-200"
                  }`}
                />
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold mt-1.5 hidden md:block text-center line-clamp-1 ${
                    isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {stepNum}. {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Card */}
      <Card className="border-slate-200 shadow-elevated bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Step {currentStep} of 7
              </span>
              <CardTitle className="text-xl sm:text-2xl mt-0.5">
                {stepTitles[currentStep - 1]}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-bold">
              {currentStep === 7 ? "Final Confirmation" : "Diagnostic Intake"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* STEP 1: SELECT REGISTERED WHEELCHAIR */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Choose the wheelchair requiring service from your registered devices:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {USER_WHEELCHAIRS.map((wc) => (
                  <button
                    key={wc.id}
                    type="button"
                    onClick={() => setSelectedWheelchairId(wc.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      selectedWheelchairId === wc.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Disc className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {wc.isPrimary && (
                          <Badge variant="accent" className="text-[9px] py-0 px-1 font-bold">
                            Primary
                          </Badge>
                        )}
                        {selectedWheelchairId === wc.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-secondary">{wc.brand} {wc.model}</h4>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {wc.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{wc.specs}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{wc.serial}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT ISSUE CATEGORY */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Select the primary component experiencing malfunction:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROBLEM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedCategory === cat.name
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-secondary hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{cat.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DESCRIBE MALFUNCTION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Describe what went wrong and specific symptoms *
                </label>
                <textarea
                  rows={4}
                  required
                  className="flex w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="e.g. While rolling down an access ramp, the left rear wheel made a grinding sound. When inspecting, 2 spokes appear loose and the rim rubs against the frame..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <span className="text-[11px] text-muted-foreground">
                  Minimum 10 characters ({description.trim().length}/10 required)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    When did this issue begin?
                  </label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={symptomOnset}
                    onChange={(e) => setSymptomOnset(e.target.value)}
                  >
                    <option value="Just now (Sudden breakdown)">Just now (Sudden breakdown)</option>
                    <option value="Past 24 hours">Past 24 hours</option>
                    <option value="1-3 days ago">1-3 days ago</option>
                    <option value="Over a week (Gradual wear)">Over a week (Gradual wear)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Urgency Level
                  </label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                  >
                    <option value="urgent">Urgent (&lt; 2-4 Hours Target)</option>
                    <option value="emergency">Roadside Emergency SOS</option>
                    <option value="standard">Standard (Next 24 Hours)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: UPLOAD SUPPORTING IMAGES */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Attaching clear photos of the damaged area allows technicians to bring exact replacement parts:
              </p>

              <div className="relative border-2 border-dashed border-slate-300 hover:border-primary/60 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-secondary">
                  Click or drag damage photos here
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  JPG, PNG, WebP up to 10MB per image
                </p>
              </div>

              {images.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-secondary">
                    Attached Files ({images.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-secondary font-medium"
                      >
                        <span>{img}</span>
                        <X
                          className="w-3.5 h-3.5 text-error cursor-pointer hover:text-red-700"
                          onClick={() => removeImage(idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No photos attached yet. You can proceed without photos if not available.
                </p>
              )}
            </div>
          )}

          {/* STEP 5: SELECT REPAIR PROVIDER */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProviderSelectionMode("auto")}
                  className={`flex-1 p-3.5 rounded-xl border text-left transition-all ${
                    providerSelectionMode === "auto"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                      : "border-slate-200 bg-white text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">Auto-Match Nearest Technician (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    System routes your ticket to the highest-rated available provider in your zone.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setProviderSelectionMode("specific")}
                  className={`flex-1 p-3.5 rounded-xl border text-left transition-all ${
                    providerSelectionMode === "specific"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                      : "border-slate-200 bg-white text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold">Choose Specific Provider</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Select a dedicated workshop based on past servicing or recommendations.
                  </p>
                </button>
              </div>

              {providerSelectionMode === "specific" && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Select Certified Service Partner
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MOCK_PROVIDERS.map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => setSelectedProviderId(prov.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                          selectedProviderId === prov.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-secondary">{prov.businessName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {prov.location.neighborhood} • {prov.distanceKm} km away
                          </p>
                          <span className="text-[10px] text-primary font-semibold">
                            ETA {prov.estimatedResponseTime} • Rating {prov.rating} ★
                          </span>
                        </div>
                        {selectedProviderId === prov.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: SELECT SERVICE PREFERENCE */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                Select Service Delivery Preference *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* At Home */}
                <button
                  type="button"
                  onClick={() => setServicePreference("at_home")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    servicePreference === "at_home"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                      : "border-slate-200 bg-white text-secondary"
                  }`}
                >
                  <Home className="w-5 h-5 mb-2 text-primary" />
                  <p className="text-xs font-bold">At-Home Service</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Technician visits your doorstep with toolkits & parts
                  </p>
                </button>

                {/* Workshop */}
                <button
                  type="button"
                  onClick={() => setServicePreference("workshop")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    servicePreference === "workshop"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                      : "border-slate-200 bg-white text-secondary"
                  }`}
                >
                  <Wrench className="w-5 h-5 mb-2 text-primary" />
                  <p className="text-xs font-bold">Workshop Service</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Deliver wheelchair to the provider station
                  </p>
                </button>

                {/* Institutional */}
                <button
                  type="button"
                  onClick={() => setServicePreference("institutional")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    servicePreference === "institutional"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                      : "border-slate-200 bg-white text-secondary"
                  }`}
                >
                  <Building className="w-5 h-5 mb-2 text-primary" />
                  <p className="text-xs font-bold">Institutional Service</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hospital or rehabilitation center service counter
                  </p>
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                <Input
                  label="Service Address / Landmark *"
                  required
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Street address, house number, area, postal code"
                  startIcon={<MapPin className="w-4 h-4 text-primary" />}
                />
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW AND SUBMIT */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Review your repair diagnostic summary before generating the service ticket:
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-muted-foreground">Wheelchair Device:</span>
                  <strong className="text-secondary">
                    {selectedWheelchair.brand} {selectedWheelchair.model} ({selectedWheelchair.type})
                  </strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-muted-foreground">Problem Category:</span>
                  <Badge variant="default" className="text-[10px]">
                    {selectedCategory}
                  </Badge>
                </div>

                <div className="pb-2 border-b border-slate-200">
                  <span className="text-muted-foreground block mb-1">Description:</span>
                  <p className="text-secondary bg-white p-2.5 rounded-lg border border-slate-200">
                    {description}
                  </p>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-muted-foreground">Attached Photos:</span>
                  <span className="font-semibold text-secondary">
                    {images.length > 0 ? `${images.length} files attached` : "None"}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-muted-foreground">Assigned Provider:</span>
                  <strong className="text-primary">
                    {selectedProvider ? selectedProvider.businessName : "Auto-Match (Apex Mobility Hub)"}
                  </strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-muted-foreground">Service Delivery:</span>
                  <span className="font-bold text-secondary uppercase">
                    {servicePreference.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Location:</span>
                  <span className="font-medium text-secondary text-right max-w-xs">{serviceAddress}</span>
                </div>
              </div>

              {/* Mobility Continuity Notice */}
              <div className="p-3.5 rounded-xl bg-accent/40 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Mobility Continuity Guarantee:</strong> Upon submission, a unique ticket ID will be generated. The technician will submit an itemized quote for your review. If extensive shop stay is required, a temporary loaner wheelchair will be coordinated immediately.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Wizard Footer Controls */}
        <CardFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Previous Step</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="font-bold bg-primary hover:bg-primary-600 text-white"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmitBooking}
              isLoading={isSubmitting}
              className="font-bold bg-primary hover:bg-primary-600 text-white shadow-card"
            >
              <span>Confirm & Generate Service Ticket</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function BookRepairWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <BookRepairWizardContent />
    </Suspense>
  );
}
