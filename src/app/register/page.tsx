"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Wrench,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/context/auth-context";
import { UserRole, InstitutionCategory } from "@/lib/supabase/types";
import { validatePassword, validateEmail, validatePhone } from "@/lib/auth/validation";

type OnboardingRole = "user" | "provider" | "institution";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams?.get("role") as OnboardingRole) || "user";

  const { signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Common user fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Wheelchair user onboarding fields
  const [wheelchairType, setWheelchairType] = useState("Manual Active");
  const [wheelchairBrand, setWheelchairBrand] = useState("");
  const [wheelchairModel, setWheelchairModel] = useState("");
  const [deviceDescription, setDeviceDescription] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Repair provider onboarding fields
  const [businessName, setBusinessName] = useState("");
  const [experienceYears, setExperienceYears] = useState("3-5 years");
  const [serviceCategories, setServiceCategories] = useState<string[]>([
    "Wheel & Tire Damage",
    "Brake Malfunction",
    "General Servicing",
  ]);
  const [supportedTypes, setSupportedTypes] = useState<string[]>([
    "Manual Active",
    "Motorized / Electric",
  ]);
  const [certificationDetails, setCertificationDetails] = useState("");

  // Institution onboarding fields
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCategory, setInstitutionCategory] = useState<InstitutionCategory>("hospital");
  const [availableLoaners, setAvailableLoaners] = useState(10);
  const [contactPerson, setContactPerson] = useState("");

  const passwordValidation = validatePassword(password);

  const toggleCategory = (cat: string) => {
    if (serviceCategories.includes(cat)) {
      setServiceCategories(serviceCategories.filter((c) => c !== cat));
    } else {
      setServiceCategories([...serviceCategories, cat]);
    }
  };

  const toggleSupportedType = (t: string) => {
    if (supportedTypes.includes(t)) {
      setSupportedTypes(supportedTypes.filter((x) => x !== t));
    } else {
      setSupportedTypes([...supportedTypes, t]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMessage("Password does not meet security requirements.");
      return;
    }

    setIsLoading(true);

    const success = await signUp({
      email,
      password,
      fullName: selectedRole === "institution" ? (institutionName || fullName) : fullName,
      phone,
      city,
      role: selectedRole as UserRole,
      // Wheelchair User specifics
      wheelchairType,
      wheelchairBrand,
      wheelchairModel,
      deviceDescription,
      emergencyContactName,
      emergencyContactPhone,
      // Provider specifics
      businessName: businessName || fullName,
      experienceYears,
      serviceCategories,
      supportedWheelchairTypes: supportedTypes,
      // Institution specifics
      institutionName: institutionName || fullName,
      institutionCategory,
      availableLoanerUnits: availableLoaners,
    });

    setIsLoading(false);

    if (success) {
      router.push(`/dashboard/${selectedRole}`);
    } else {
      setErrorMessage("Registration failed. Please check form data.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Header with Official Logo */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Logo size="lg" showTagline={true} taglineVariant="possibilities" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">
          Register on RepairLink
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Step-by-step role onboarding with Supabase authentication & verified records
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
            Step 1: Select Your Stakeholder Role
          </label>
          <span className="text-xs text-primary font-semibold">Active: {selectedRole.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* User */}
          <button
            type="button"
            onClick={() => setSelectedRole("user")}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === "user"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${selectedRole === "user" ? "bg-primary text-white" : "bg-slate-100 text-secondary"}`}>
                <User className="w-5 h-5" />
              </div>
              {selectedRole === "user" && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-bold text-secondary">Wheelchair User</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Book diagnostics & request loaners
              </p>
            </div>
          </button>

          {/* Provider */}
          <button
            type="button"
            onClick={() => setSelectedRole("provider")}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === "provider"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${selectedRole === "provider" ? "bg-primary text-white" : "bg-slate-100 text-secondary"}`}>
                <Wrench className="w-5 h-5" />
              </div>
              {selectedRole === "provider" && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-bold text-secondary">Repair Provider</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dispatch repairers & send quotes
              </p>
            </div>
          </button>

          {/* Institution */}
          <button
            type="button"
            onClick={() => setSelectedRole("institution")}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === "institution"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${selectedRole === "institution" ? "bg-primary text-white" : "bg-slate-100 text-secondary"}`}>
                <Building2 className="w-5 h-5" />
              </div>
              {selectedRole === "institution" && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-bold text-secondary">Hospital / NGO</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Manage temporary loaner fleet
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Role-Specific Onboarding Form Card */}
      <Card className="border-slate-200 shadow-elevated bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle>
            {selectedRole === "user" && "Wheelchair User Onboarding"}
            {selectedRole === "provider" && "Repair Provider / Technician Onboarding"}
            {selectedRole === "institution" && "Hospital / Rehab Centre / NGO Registration"}
          </CardTitle>
          <CardDescription>
            {selectedRole === "user" && "Register your primary wheelchair profile to ensure fast technician matching."}
            {selectedRole === "provider" && "Submit your technical qualifications and service categories for verification."}
            {selectedRole === "institution" && "Register your healthcare or charitable organization to coordinate loaner equipment."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {errorMessage && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section A: Contact & Login Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <span>1. Contact & Security Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={selectedRole === "institution" ? "Contact Person Name" : "Full Name"}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  startIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  startIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="user@example.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  startIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Operating City"
                  required
                  placeholder="New Delhi, NCR"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  startIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              {/* Password with Strength Indicators */}
              <div className="space-y-2">
                <Input
                  label="Create Account Password"
                  type="password"
                  required
                  placeholder="At least 8 characters (A-Z, 0-9, special character)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  startIcon={<Lock className="w-4 h-4" />}
                />

                {/* Password validation score indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-secondary">Password Security Rating:</span>
                      <span className="font-bold text-primary">
                        {passwordValidation.score === 4
                          ? "Strong ✓"
                          : passwordValidation.score >= 2
                          ? "Moderate"
                          : "Weak"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      <div className={`rounded-full ${passwordValidation.score >= 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
                      <div className={`rounded-full ${passwordValidation.score >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
                      <div className={`rounded-full ${passwordValidation.score >= 3 ? "bg-emerald-500" : "bg-slate-200"}`} />
                      <div className={`rounded-full ${passwordValidation.score >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} />
                    </div>

                    {passwordValidation.errors.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Requirements: {passwordValidation.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section B: Role-Specific Details */}
            {selectedRole === "user" && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <span>2. Wheelchair Specifications</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                      Wheelchair Category *
                    </label>
                    <select
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={wheelchairType}
                      onChange={(e) => setWheelchairType(e.target.value)}
                    >
                      <option value="Manual Active">Manual Active (Rigid / Folding)</option>
                      <option value="Motorized / Electric">Motorized / Electric Power Wheelchair</option>
                      <option value="Tilt-in-Space Pediatric">Tilt-in-Space / Pediatric High-Back</option>
                      <option value="Standard Hospital Transport">Standard Hospital Transit Chair</option>
                      <option value="Rough Terrain Sports">Rough Terrain / Sports Active</option>
                    </select>
                  </div>

                  <Input
                    label="Brand (Optional)"
                    placeholder="e.g. Ottobock, Karma, Sunrise"
                    value={wheelchairBrand}
                    onChange={(e) => setWheelchairBrand(e.target.value)}
                  />

                  <Input
                    label="Model / Serial (Optional)"
                    placeholder="e.g. Zenit R / #OB-9481"
                    value={wheelchairModel}
                    onChange={(e) => setWheelchairModel(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Wheelchair Description & Custom Features
                  </label>
                  <textarea
                    rows={2}
                    className="flex w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Mention custom cushion type, anti-tippers, or hand-rim coating..."
                    value={deviceDescription}
                    onChange={(e) => setDeviceDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Emergency Contact Name"
                    placeholder="e.g. Sunita Kumar (Spouse)"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                  />
                  <Input
                    label="Emergency Contact Phone"
                    type="tel"
                    placeholder="+91 98112 43211"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedRole === "provider" && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <span>2. Business & Service Capabilities</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business / Workshop Name *"
                    required
                    placeholder="e.g. Apex Mobility Diagnostics"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                      Experience in Assistive Devices *
                    </label>
                    <select
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    >
                      <option value="1-2 years">1-2 Years (Basic mechanical repairs)</option>
                      <option value="3-5 years">3-5 Years (Manual & Electric wheelchair servicing)</option>
                      <option value="5+ years">5+ Years (Certified rehabilitation technologist)</option>
                    </select>
                  </div>
                </div>

                {/* Service Categories Multi-select */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Service Categories Offered *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Wheel & Tire Damage",
                      "Brake Malfunction",
                      "Motor & Battery Diagnostics",
                      "Seat & Cushion Refurbishment",
                      "Frame & Welding Alignment",
                      "General Servicing",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          serviceCategories.includes(cat)
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-slate-200 bg-white text-secondary hover:border-slate-300"
                        }`}
                      >
                        {serviceCategories.includes(cat) ? "✓ " : "+ "} {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Input
                    label="Trade Certification Details (Optional)"
                    placeholder="e.g. ITI Mechanical / ISPO Rehabilitation Technician / RCI Registered"
                    value={certificationDetails}
                    onChange={(e) => setCertificationDetails(e.target.value)}
                    helperText="Proof documents will be reviewed by the admin moderation desk."
                  />
                </div>
              </div>
            )}

            {selectedRole === "institution" && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <span>2. Institutional Loaner Pool</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Institution / NGO Name *"
                    required
                    placeholder="e.g. AIIMS PMR Department"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                      Institution Category *
                    </label>
                    <select
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={institutionCategory}
                      onChange={(e) => setInstitutionCategory(e.target.value as InstitutionCategory)}
                    >
                      <option value="hospital">Government / Apex Hospital</option>
                      <option value="rehabilitation_centre">Specialized Rehabilitation Centre</option>
                      <option value="ngo">Assistive Technology NGO / Foundation</option>
                      <option value="other">Other Community Health Body</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Available Wheelchairs for Loan Pool *"
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={availableLoaners.toString()}
                    onChange={(e) => setAvailableLoaners(parseInt(e.target.value) || 0)}
                  />

                  <Input
                    label="Department / Section"
                    placeholder="e.g. Physical Medicine & Rehabilitation"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-accent/40 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Institutional Moderation:</strong> All institution accounts require 1-time verification by the admin console before wheelchairs are visible to users.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-card bg-primary hover:bg-primary-600 h-12 text-base"
              >
                <span>Register & Open {selectedRole.toUpperCase()} Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-0 flex justify-center border-t border-slate-100 mt-2 text-xs text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in with existing credentials
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-surface to-background">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading onboarding form...</p>
          </div>
        }
      >
        <RegisterContent />
      </Suspense>
    </div>
  );
}
