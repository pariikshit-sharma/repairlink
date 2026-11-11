"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ArrowRight,
  Maximize2,
  Weight,
  Cpu,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryWheelchair, WheelchairLoanStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface InventoryWheelchairCardProps {
  wheelchair: InventoryWheelchair;
  onRequestLoan: (wheelchair: InventoryWheelchair) => void;
  onViewDetails?: (wheelchair: InventoryWheelchair) => void;
}

export function InventoryWheelchairCard({
  wheelchair,
  onRequestLoan,
  onViewDetails,
}: InventoryWheelchairCardProps) {
  const [imgError, setImgError] = useState(false);
  const getStatusBadge = (status: WheelchairLoanStatus) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="success" className="font-semibold shadow-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Available Now
          </Badge>
        );
      case "request_pending":
        return (
          <Badge variant="warning" className="font-semibold shadow-xs">
            <Clock className="w-3 h-3 mr-1" />
            Request Pending
          </Badge>
        );
      case "reserved":
        return (
          <Badge variant="default" className="bg-sky-600 text-white font-semibold shadow-xs">
            <Calendar className="w-3 h-3 mr-1" />
            Reserved
          </Badge>
        );
      case "currently_lent":
        return (
          <Badge variant="outline" className="text-primary border-primary bg-primary/5 font-semibold">
            <Sparkles className="w-3 h-3 mr-1 text-primary" />
            Currently Lent Out
          </Badge>
        );
      case "under_maintenance":
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50 font-semibold">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
            Under Maintenance
          </Badge>
        );
    }
  };

  const getConditionBadge = (rating: string) => {
    if (rating === "tier_a_mint") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Tier A — Clinical Mint
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
        Tier B — Inspected Good
      </span>
    );
  };

  const isAvailable = wheelchair.availability_status === "available";

  return (
    <Card className="flex flex-col h-full overflow-hidden border-slate-200/90 shadow-subtle hover:shadow-card transition-all duration-200 group bg-white">
      {/* Visual Header / Photo */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {wheelchair.image_url && !imgError ? (
          <Image
            src={wheelchair.image_url}
            alt={wheelchair.model_name}
            fill
            unoptimized={wheelchair.image_url.startsWith("data:")}
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <ShieldCheck className="w-10 h-10 mb-1.5 text-primary/40" />
            <span className="text-[11px] font-semibold text-slate-500">Clinical Equipment Unit</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Status Badge top right */}
        <div className="absolute top-3 right-3">{getStatusBadge(wheelchair.availability_status)}</div>

        {/* Serial Tag top left */}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-xs font-bold bg-white/95 text-secondary px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs">
            {wheelchair.serial_tag}
          </span>
        </div>

        {/* Institution bottom bar */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-semibold truncate drop-shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{wheelchair.institution_name}</span>
          </span>
          <span className="font-bold text-accent shrink-0 ml-2">
            {wheelchair.deposit_amount === 0 ? "Zero Deposit" : `₹${wheelchair.deposit_amount} Dep.`}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-[11px] font-semibold text-secondary">
              {wheelchair.wheelchair_type}
            </Badge>
            {getConditionBadge(wheelchair.condition_rating)}
          </div>

          <h3 className="text-base font-bold text-secondary group-hover:text-primary transition-colors leading-snug">
            {wheelchair.model_name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{wheelchair.institution_location}</span>
          </div>

          {/* Quick Specs Pill Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span className="text-muted-foreground block text-[10px] font-medium">Drive Mode</span>
              <span className="font-bold text-secondary capitalize">{wheelchair.manual_or_powered}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span className="text-muted-foreground block text-[10px] font-medium">Seat Width</span>
              <span className="font-bold text-secondary">{wheelchair.seat_width_cm} cm</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span className="text-muted-foreground block text-[10px] font-medium">Max User Load</span>
              <span className="font-bold text-secondary">{wheelchair.weight_capacity_kg} kg</span>
            </div>
          </div>

          {/* Features Snippet */}
          {wheelchair.features && wheelchair.features.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Clinical Highlights:
              </span>
              <div className="flex flex-wrap gap-1">
                {wheelchair.features.slice(0, 2).map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded text-left truncate max-w-full"
                  >
                    • {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lending conditions note */}
        <p className="text-[11px] text-muted-foreground bg-amber-50/70 border border-amber-200/60 p-2 rounded-md leading-relaxed">
          <strong className="text-amber-900 font-semibold">Hospital Note: </strong>
          {wheelchair.lending_conditions}
        </p>
      </CardContent>

      {/* Card Actions */}
      <CardFooter className="p-5 pt-0 border-t border-slate-100 flex items-center gap-2">
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(wheelchair)}
            className="flex-1 text-xs"
          >
            Specs
          </Button>
        )}
        <Button
          size="sm"
          disabled={!isAvailable}
          onClick={() => onRequestLoan(wheelchair)}
          className={cn(
            "flex-1 text-xs font-bold transition-all shadow-xs",
            isAvailable
              ? "bg-primary hover:bg-primary-hover text-white"
              : "bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200"
          )}
        >
          {isAvailable ? (
            <>
              <span>Request Loan</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </>
          ) : (
            <span>Not Available</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
