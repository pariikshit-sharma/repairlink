import React from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderItem } from "@/lib/data/providers";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: ProviderItem;
  isSelected?: boolean;
  onSelect?: () => void;
  onRequestService?: (provider: ProviderItem) => void;
}

export function ProviderCard({
  provider,
  isSelected = false,
  onSelect,
  onRequestService,
}: ProviderCardProps) {
  return (
    <Card
      hoverEffect
      onClick={onSelect}
      className={cn(
        "p-5 rounded-2xl border transition-all duration-200 bg-white cursor-pointer relative",
        isSelected
          ? "border-primary ring-2 ring-primary/30 shadow-card bg-primary/[0.02]"
          : "border-slate-200/90 shadow-subtle hover:border-slate-300"
      )}
    >
      {/* Top Banner Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {/* Avatar / Business Icon */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-secondary leading-tight">
                {provider.businessName}
              </h3>
              {provider.isVerified && (
                <Badge variant="accent" className="text-[10px] py-0 px-1.5 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              Lead Technician: <strong className="text-secondary font-medium">{provider.name}</strong> • {provider.experienceYears}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{provider.location.neighborhood}</span>
                <span className="font-bold text-secondary">({provider.distanceKm} km away)</span>
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">ETA {provider.estimatedResponseTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Rating Block */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{provider.rating}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {provider.reviewCount} verified ratings
          </p>
        </div>
      </div>

      {/* Services Offered Tags */}
      <div className="space-y-1.5 py-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-muted-foreground">Supported Repairs:</span>
          <span className="text-primary font-bold">Starts ₹{provider.startingPriceInr}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {provider.servicesOffered.map((service, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-secondary px-2 py-0.5 rounded-md font-medium transition-colors"
            >
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Supported Wheelchair Types Tags */}
      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
        <span className="font-semibold text-secondary">Wheelchair Types:</span>
        {provider.supportedWheelchairTypes.map((type, tIdx) => (
          <span
            key={tIdx}
            className="text-[10px] border border-primary/20 text-primary px-1.5 py-0.2 rounded bg-primary/5 font-semibold"
          >
            {type}
          </span>
        ))}
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs font-bold text-secondary hover:bg-slate-50"
        >
          <Link href={`/providers/${provider.id}`}>
            <span>View Details & Reviews</span>
          </Link>
        </Button>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRequestService && onRequestService(provider);
          }}
          className="text-xs font-bold bg-primary hover:bg-primary-600 text-white shadow-sm flex items-center gap-1.5"
        >
          <span>Request Service</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
