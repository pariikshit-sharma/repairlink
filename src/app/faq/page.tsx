"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  PhoneCall,
  Wrench,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SubtleEntrance } from "@/components/motion/motion-primitives";

interface FaqItem {
  id: string;
  category: "Repairs" | "Temporary Mobility" | "Pricing & Safety" | "Hospitals & Providers";
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    category: "Repairs",
    question: "How quickly can a verified technician reach me in an emergency wheelchair breakdown?",
    answer:
      "For urgent mobility breakdowns in covered zones (such as South & Central Delhi NCR), target triage assignment is under 45 minutes. Once matched via Find Repair Support, technicians can perform doorstep repairs for wheels, brakes, batteries, and joysticks or coordinate workshop pickup.",
  },
  {
    id: "faq-2",
    category: "Repairs",
    question: "Does REPAIRLINK service motorized / power wheelchairs as well as manual chairs?",
    answer:
      "Yes. You can filter repair specialists specifically by drive configuration and expertise—covering ultralight active rigid frames, folding transit chairs, Li-ion/SLA battery diagnostics, BMS faults, brushless hub motors, and joystick calibration.",
  },
  {
    id: "faq-3",
    category: "Pricing & Safety",
    question: "Will I see exact pricing before work starts on my wheelchair?",
    answer:
      "Always. Providers inspect your submitted description and diagnostic photos to generate an itemized digital quotation (parts + labor + inspection). Service only begins after you review and approve the quote inside your ticket tracker.",
  },
  {
    id: "faq-4",
    category: "Temporary Mobility",
    question: "How does Temporary Mobility Support keep me moving while my chair is in the shop?",
    answer:
      "If your repair takes extended time (e.g., motor rewinding, frame welding, or imported spoke sourcing), REPAIRLINK links your active repair ticket (#RL-XXXX) to verified partner hospitals, rehab centres, and NGOs to reserve a sanitized loaner wheelchair.",
  },
  {
    id: "faq-5",
    category: "Temporary Mobility",
    question: "Why does an institution review my seating width and posture notes before approving a loan?",
    answer:
      "Using a loaner wheelchair with improper seat width or missing postural support can cause pelvic tilt, instability, or pressure sores. Participating rehabilitation clinicians verify ±2 cm seat clearance before reserving the equipment for your safety.",
  },
  {
    id: "faq-6",
    category: "Pricing & Safety",
    question: "Is there a security deposit for temporary loaner wheelchairs?",
    answer:
      "Users holding an active verified REPAIRLINK workshop ticket qualify for zero-deposit priority lending at participating public institutes such as AIIMS PMR. Any institution-specific refundable deposit is displayed clearly on the equipment card prior to application.",
  },
  {
    id: "faq-7",
    category: "Hospitals & Providers",
    question: "How does REPAIRLINK verify independent repair technicians and hospitals?",
    answer:
      "New providers and institutions enter a Pending Verification queue audited by platform administrators via our Governance Command Center. Public verified badges are only granted after credential review, and accounts failing quality checks can be suspended.",
  },
  {
    id: "faq-8",
    category: "Hospitals & Providers",
    question: "How can our rehabilitation centre, hospital, or NGO list idle wheelchairs in the pool?",
    answer:
      "Register through the Institution onboarding flow, complete organization verification, and add units directly inside your Institution Dashboard Inventory Registry with serial tags, dimensions, condition ratings, and device photos.",
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["faq-1", "faq-4"]);

  const categories = ["All", "Repairs", "Temporary Mobility", "Pricing & Safety", "Hospitals & Providers"];

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.question.toLowerCase().includes(q) &&
          !item.answer.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SubtleEntrance className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="accent" className="text-xs font-bold uppercase tracking-wider">
          Support & Emergency Guide
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
          Frequently Asked Questions & Help Center
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Everything wheelchair users, caregivers, repair technicians, and rehabilitation partners
          need to know about rapid breakdown response and temporary mobility continuity.
        </p>
      </SubtleEntrance>

      {/* Emergency Mobility Triage Banner */}
      <Card className="p-6 bg-secondary text-white rounded-2xl border-0 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
              <AlertTriangle className="w-4 h-4" />
              <span>Stranded Outdoors or Urgent Breakdown?</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              24/7 Emergency Mobility Helpline: {APP_CONFIG.supportPhone}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              If your brake locks fail, powerchair battery dies mid-transit, or axle snaps away from
              home, use our rapid triage finder for nearest on-site technician dispatch or check
              participating hospital loaners immediately.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <Button size="sm" asChild className="font-bold">
              <Link href="/find-repairs">
                <Wrench className="w-4 h-4 mr-1.5" />
                Find Nearest Repair
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white font-bold"
            >
              <Link href="/temporary-support">
                <HeartHandshake className="w-4 h-4 mr-1.5 text-accent" />
                Request Loaner Chair
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Search & Category Controls */}
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles (e.g., quotation, powerchair, loaner deposit)..."
            aria-label="Search frequently asked questions"
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter FAQ by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-2 rounded-full text-xs font-bold transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-slate-200 text-secondary hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const panelId = `${faq.id}-panel`;
            const buttonId = `${faq.id}-button`;

            return (
              <Card key={faq.id} className="bg-white border-slate-200 overflow-hidden shadow-subtle">
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {faq.category}
                    </Badge>
                    <h3 className="text-sm sm:text-base font-bold text-secondary leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-primary shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                  >
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center bg-white border-slate-200 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-secondary">No matching questions found</p>
            <p className="text-xs text-muted-foreground">
              Try clearing your search keyword or contact our support desk at{" "}
              <span className="font-semibold text-primary">{APP_CONFIG.supportEmail}</span>.
            </p>
          </Card>
        )}
      </div>

      {/* Related Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <Link href="/accessibility" className="group">
          <Card className="p-4 h-full bg-white hover:border-primary/40 transition-colors flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary group-hover:text-primary">
                Accessibility Statement
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">WCAG 2.1 AA & keyboard guide</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          </Card>
        </Link>
        <Link href="/privacy" className="group">
          <Card className="p-4 h-full bg-white hover:border-primary/40 transition-colors flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary group-hover:text-primary">
                Privacy & Security
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Medical & location data rules</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          </Card>
        </Link>
        <Link href="/terms" className="group">
          <Card className="p-4 h-full bg-white hover:border-primary/40 transition-colors flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary group-hover:text-primary">
                Terms of Service
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Quotes & loaner guidelines</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
