"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Wrench,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Award,
  Zap,
  Building,
  HeartHandshake,
  Share2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MOCK_PROVIDERS, ProviderItem } from "@/lib/data/providers";
import { toast } from "sonner";

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = (params?.id as string) || "prov-01";

  const provider = MOCK_PROVIDERS.find((p) => p.id === providerId) || MOCK_PROVIDERS[0];

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [servicePreference, setServicePreference] = useState<"doorstep" | "workshop">("doorstep");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    const ticketId = `RL-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setBookingModalOpen(false);
      toast.success(
        `Service Ticket #${ticketId} dispatched to ${provider.businessName}!`,
        {
          description: `Technician assigned: ${provider.name}. Response SLA: ${provider.estimatedResponseTime}`,
        }
      );
      router.push("/dashboard/user");
    }, 800);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs font-semibold text-secondary hover:text-primary pl-0"
        >
          <Link href="/find-repairs" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Repair Discovery</span>
          </Link>
        </Button>
      </div>

      {/* Provider Hero Profile Header Card */}
      <Card className="border-slate-200 bg-white shadow-subtle p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
              <Wrench className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-secondary tracking-tight">
                  {provider.businessName}
                </h1>
                {provider.isVerified && (
                  <Badge variant="accent" className="text-xs font-bold py-0.5 px-2 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{provider.verificationBadge}</span>
                  </Badge>
                )}
              </div>

              <p className="text-sm font-medium text-primary">
                {provider.tagline}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{provider.address}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-secondary">
                  <span>{provider.distanceKm} km from your current hub</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge Column */}
          <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-sm font-extrabold text-amber-900">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{provider.rating} / 5.0</span>
              <span className="text-xs font-normal text-muted-foreground">({provider.reviewCount})</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">Starting Base Inspection</span>
              <p className="text-lg font-black text-primary">₹{provider.startingPriceInr}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details Left, Booking CTA Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Profile, Services, Devices, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* About / Bio */}
          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl">
            <h2 className="text-base font-bold text-secondary mb-3">
              About This Service Station
            </h2>
            <p className="text-sm text-secondary/85 leading-relaxed">
              {provider.bio}
            </p>

            {/* Certifications & Badges */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Verified Credentials & Affiliations:
              </span>
              <div className="space-y-1.5">
                {provider.certifications.map((cert, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2 text-xs text-secondary font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Services Offered Breakdown */}
          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl">
            <h2 className="text-base font-bold text-secondary mb-3">
              Supported Repair & Maintenance Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {provider.servicesOffered.map((service, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-secondary">{service}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white">
                    Available
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Supported Wheelchair Types */}
          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl">
            <h2 className="text-base font-bold text-secondary mb-3">
              Supported Assistive Wheelchair Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {provider.supportedWheelchairTypes.map((type, tIdx) => (
                <span
                  key={tIdx}
                  className="px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>{type}</span>
                </span>
              ))}
            </div>
          </Card>

          {/* Customer Reviews Section */}
          <Card className="p-6 bg-white border-slate-200 shadow-subtle rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-secondary">
                  Customer Ratings & Verified Feedback
                </h2>
                <p className="text-xs text-muted-foreground">
                  Backed by authenticated wheelchair user tickets
                </p>
              </div>
              <Badge variant="accent" className="font-bold text-xs">
                {provider.rating} ★ ({provider.reviewCount} Reviews)
              </Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {provider.reviews.length > 0 ? (
                provider.reviews.map((rev) => (
                  <div key={rev.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-secondary">{rev.userName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {rev.userRole}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        • {rev.wheelchairType} ({rev.serviceCategory})
                      </span>
                    </div>

                    <p className="text-xs text-secondary/85 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4">
                  New verified service provider. Early ratings pending review moderation.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right 4 Columns: Sticky Booking Action Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <Card className="border-slate-200 bg-white shadow-elevated p-6 rounded-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Direct Dispatch SLA
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {provider.estimatedResponseTime}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Starting Diagnostic Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-secondary">
                    ₹{provider.startingPriceInr}
                  </span>
                  <span className="text-xs text-muted-foreground">/ comprehensive checkup</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Service Zone:</span>
                  <strong className="text-secondary">{provider.location.neighborhood}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Operating Hours:</span>
                  <strong className="text-secondary">08:30 AM - 08:00 PM</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Emergency Hotline:</span>
                  <strong className="text-primary">{provider.phone}</strong>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Button
                  size="lg"
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full font-bold shadow-card bg-primary hover:bg-primary-600 text-white h-12 text-base"
                >
                  <span>Request Service Now</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Mobility Continuity Guarantee Notice */}
              <div className="p-3 rounded-xl bg-accent/40 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-snug">
                  <strong>Temporary Loaner Eligible:</strong> If your chair requires shop stay, you can request loaner support directly from AIIMS / ISIC.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Initiate Repair with {provider.businessName}</DialogTitle>
            <DialogDescription>
              Select your service preference to schedule technician dispatch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-bold text-secondary">{provider.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Response:</span>
                <span className="font-bold text-emerald-700">{provider.estimatedResponseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Fee:</span>
                <span className="font-bold text-secondary">₹{provider.startingPriceInr}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-secondary uppercase tracking-wider text-[11px]">
                Service Mode
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
                  <p className="text-[10px] text-muted-foreground mt-0.5">Technician visits home</p>
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
                  <p className="font-bold">Workshop Drop</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Deliver to station</p>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBookingModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmBooking}
              isLoading={isSubmitting}
              className="bg-primary hover:bg-primary-600 font-bold"
            >
              <span>Confirm Ticket Dispatch</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
