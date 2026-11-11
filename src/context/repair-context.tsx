"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  RepairRequest,
  Quotation,
  StatusHistoryEntry,
  RepairLifecycleStatus,
  ServicePreference,
  ItemizedCostItem,
} from "@/lib/supabase/types";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

// Human-readable labels for the 8 repair lifecycle statuses
export const STATUS_CONFIG: Record<
  RepairLifecycleStatus,
  { label: string; step: number; color: "primary" | "warning" | "success" | "error" | "default" }
> = {
  request_submitted: { label: "Request Submitted", step: 1, color: "default" },
  provider_reviewing: { label: "Provider Reviewing", step: 2, color: "warning" },
  quotation_received: { label: "Quotation Received", step: 3, color: "warning" },
  awaiting_user_approval: { label: "Awaiting User Approval", step: 3, color: "warning" },
  service_scheduled: { label: "Service Scheduled", step: 4, color: "primary" },
  repair_in_progress: { label: "Repair In Progress", step: 5, color: "primary" },
  repair_completed: { label: "Repair Completed", step: 6, color: "success" },
  request_closed: { label: "Request Closed", step: 7, color: "success" },
  cancelled: { label: "Request Cancelled", step: 0, color: "error" },
};

// Seeded initial demonstration repair tickets
const INITIAL_REPAIR_REQUESTS: RepairRequest[] = [
  {
    id: "req-8941",
    ticket_number: "RL-2024-8941",
    user_id: "demo-user-001",
    user_name: "Ramesh Kumar",
    user_phone: "+91 98112 43210",
    provider_id: "demo-provider-002",
    provider_name: "Apex Mobility (Vikram Sharma)",
    wheelchair_summary: {
      type: "Manual Active",
      brand: "Ottobock",
      model: "Zenit R (Rigid Frame)",
      serial: "#OB-2024-8841",
    },
    issue_category: "Wheel damage",
    description: "Left rear 24-inch pneumatic wheel developed wobble during transit. High spoke slackness and slight bearing grinding.",
    images: ["wheel_hub_damage.jpg", "spoke_closeup.jpg"],
    service_preference: "at_home",
    service_address: "B-42, South Extension Part 1, New Delhi 110049",
    status: "repair_in_progress",
    urgency: "urgent",
    quotation: {
      id: "quote-8941",
      repair_request_id: "req-8941",
      provider_id: "demo-provider-002",
      provider_name: "Apex Mobility Diagnostics",
      parts_cost: 450,
      labor_cost: 400,
      total_cost: 850,
      estimated_completion: "Tomorrow, 04:00 PM",
      notes: "Replacement of 4 high-tensile stainless steel spokes + hub bearing repacking with marine-grade waterproof grease.",
      itemized_items: [
        { id: "item-1", title: "Stainless Steel High-Tensile Spokes (x4)", category: "parts", cost: 250 },
        { id: "item-2", title: "Precision Sealed Caster Bearing 608RS", category: "parts", cost: 200 },
        { id: "item-3", title: "Wheel Truing, Alignment & Doorstep Labor", category: "labor", cost: 400 },
      ],
      status: "accepted",
      created_at: "2024-11-09T10:30:00Z",
      updated_at: "2024-11-09T11:15:00Z",
    },
    status_history: [
      {
        id: "hist-1",
        repair_request_id: "req-8941",
        status: "request_submitted",
        status_label: "Request Submitted",
        changed_by_name: "Ramesh Kumar (User)",
        notes: "Diagnostic request logged with 2 attached photos.",
        timestamp: "09 Nov 2024, 09:15 AM",
      },
      {
        id: "hist-2",
        repair_request_id: "req-8941",
        status: "provider_reviewing",
        status_label: "Provider Reviewing",
        changed_by_name: "Vikram Sharma (Apex Mobility)",
        notes: "Technician evaluated wheel wobble photos. Part availability verified.",
        timestamp: "09 Nov 2024, 10:00 AM",
      },
      {
        id: "hist-3",
        repair_request_id: "req-8941",
        status: "quotation_received",
        status_label: "Quotation Generated (₹850)",
        changed_by_name: "Vikram Sharma (Apex Mobility)",
        notes: "Detailed quotation submitted for 4 spokes and sealed bearing.",
        timestamp: "09 Nov 2024, 10:30 AM",
      },
      {
        id: "hist-4",
        repair_request_id: "req-8941",
        status: "service_scheduled",
        status_label: "Quotation Approved & Scheduled",
        changed_by_name: "Ramesh Kumar (User)",
        notes: "User approved quotation ₹850. Scheduled for doorstep technician visit.",
        timestamp: "09 Nov 2024, 11:15 AM",
      },
      {
        id: "hist-5",
        repair_request_id: "req-8941",
        status: "repair_in_progress",
        status_label: "Repair In Progress",
        changed_by_name: "Vikram Sharma (Technician)",
        notes: "Technician on site at South Extension. Replacing spokes and truing rim.",
        timestamp: "10 Nov 2024, 02:00 PM",
      },
    ],
    created_at: "2024-11-09T09:15:00Z",
    updated_at: "2024-11-10T14:00:00Z",
  },
  {
    id: "req-8892",
    ticket_number: "RL-2024-8892",
    user_id: "demo-user-001",
    user_name: "Ramesh Kumar",
    user_phone: "+91 98112 43210",
    provider_id: "prov-03",
    provider_name: "CareMotion Electronics",
    wheelchair_summary: {
      type: "Motorized / Electric",
      brand: "Karma",
      model: "Ergo Stand 100",
      serial: "#KM-2023-4102",
    },
    issue_category: "Battery issue",
    description: "Battery discharges after 25 minutes of continuous drive. Charger shows green light prematurely.",
    images: ["battery_led_error.jpg"],
    service_preference: "workshop",
    service_address: "B-42, South Extension Part 1, New Delhi",
    status: "provider_reviewing",
    urgency: "standard",
    quotation: null,
    status_history: [
      {
        id: "hist-201",
        repair_request_id: "req-8892",
        status: "request_submitted",
        status_label: "Request Submitted",
        changed_by_name: "Ramesh Kumar",
        notes: "Logged diagnostic request for Karma power chair battery testing.",
        timestamp: "10 Nov 2024, 11:00 AM",
      },
      {
        id: "hist-202",
        repair_request_id: "req-8892",
        status: "provider_reviewing",
        status_label: "Provider Reviewing",
        changed_by_name: "CareMotion Electronics",
        notes: "Evaluating battery BMS diagnostics.",
        timestamp: "10 Nov 2024, 11:45 AM",
      },
    ],
    created_at: "2024-11-10T11:00:00Z",
    updated_at: "2024-11-10T11:45:00Z",
  },
  {
    id: "req-8740",
    ticket_number: "RL-2024-8740",
    user_id: "demo-user-001",
    user_name: "Ramesh Kumar",
    user_phone: "+91 98112 43210",
    provider_id: "demo-provider-002",
    provider_name: "Apex Mobility",
    wheelchair_summary: {
      type: "Manual Active",
      brand: "Ottobock",
      model: "Zenit R",
    },
    issue_category: "General servicing",
    description: "Annual preventive maintenance safety tune-up and brake re-tensioning.",
    images: [],
    service_preference: "at_home",
    service_address: "South Extension, New Delhi",
    status: "request_closed",
    urgency: "standard",
    quotation: {
      id: "quote-8740",
      repair_request_id: "req-8740",
      provider_id: "demo-provider-002",
      provider_name: "Apex Mobility",
      parts_cost: 0,
      labor_cost: 499,
      total_cost: 499,
      estimated_completion: "14 Oct 2024",
      notes: "Full safety tuneup, silicone lubrication, and brake cable calibration completed.",
      itemized_items: [
        { id: "tune-1", title: "Comprehensive 24-point Safety Tuneup", category: "labor", cost: 499 },
      ],
      status: "accepted",
      created_at: "2024-10-14T09:00:00Z",
      updated_at: "2024-10-14T12:00:00Z",
    },
    status_history: [
      {
        id: "hist-301",
        repair_request_id: "req-8740",
        status: "request_closed",
        status_label: "Service Completed & Closed",
        changed_by_name: "Ramesh Kumar",
        notes: "Full safety sign-off. Rating: 5/5 stars.",
        timestamp: "14 Oct 2024, 01:30 PM",
      },
    ],
    rating: 5,
    review_comment: "Punctual and very thorough wheelchair servicing. Checked all bolts and aligned the brakes perfectly.",
    created_at: "2024-10-14T08:00:00Z",
    updated_at: "2024-10-14T13:30:00Z",
  },
];

interface CreateBookingPayload {
  wheelchair: {
    type: string;
    brand: string;
    model: string;
    serial?: string;
  };
  issueCategory: string;
  description: string;
  images: string[];
  providerId: string | null;
  providerName: string | null;
  servicePreference: ServicePreference;
  serviceAddress: string;
  urgency?: "standard" | "urgent" | "emergency";
}

interface RepairContextType {
  repairRequests: RepairRequest[];
  activeRequest: RepairRequest | null;
  getRepairById: (id: string) => RepairRequest | undefined;
  createRepairRequest: (payload: CreateBookingPayload) => Promise<string>;
  providerAcceptRequest: (requestId: string) => void;
  providerDeclineRequest: (requestId: string, reason: string) => void;
  submitQuotation: (
    requestId: string,
    quotation: {
      partsCost: number;
      laborCost: number;
      estimatedCompletion: string;
      notes: string;
      items: ItemizedCostItem[];
    }
  ) => void;
  userAcceptQuotation: (requestId: string) => void;
  userDeclineQuotation: (requestId: string, reason: string) => void;
  updateRepairStatus: (
    requestId: string,
    nextStatus: RepairLifecycleStatus,
    notes?: string
  ) => void;
  addServiceNote: (requestId: string, note: string) => void;
  cancelRepairRequest: (requestId: string, reason: string) => void;
  submitReview: (requestId: string, rating: number, comment: string) => void;
}

const RepairContext = createContext<RepairContextType | undefined>(undefined);

export function RepairProvider({ children }: { children: React.ReactNode }) {
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(INITIAL_REPAIR_REQUESTS);

  // Initialize from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("repairlink_tickets");
      if (saved) {
        try {
          setRepairRequests(JSON.parse(saved));
        } catch {
          // fallback to initial
        }
      }
    }
  }, []);

  // Save to localStorage whenever tickets change
  const syncStorage = (updated: RepairRequest[]) => {
    setRepairRequests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("repairlink_tickets", JSON.stringify(updated));
    }
  };

  const getRepairById = (id: string): RepairRequest | undefined => {
    return repairRequests.find((r) => r.id === id || r.ticket_number === id);
  };

  // 1. Create Repair Request (Step 7 submission)
  const createRepairRequest = async (payload: CreateBookingPayload): Promise<string> => {
    const randomTicketNum = `RL-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `req-${Date.now()}`;

    const newRequest: RepairRequest = {
      id: newId,
      ticket_number: randomTicketNum,
      user_id: "demo-user-001",
      user_name: "Ramesh Kumar",
      user_phone: "+91 98112 43210",
      provider_id: payload.providerId,
      provider_name: payload.providerName || "Pending Auto-Match",
      wheelchair_summary: payload.wheelchair,
      issue_category: payload.issueCategory,
      description: payload.description,
      images: payload.images,
      service_preference: payload.servicePreference,
      service_address: payload.serviceAddress,
      status: "request_submitted",
      urgency: payload.urgency || "standard",
      quotation: null,
      status_history: [
        {
          id: `hist-${Date.now()}`,
          repair_request_id: newId,
          status: "request_submitted",
          status_label: "Request Submitted",
          changed_by_name: "Ramesh Kumar (User)",
          notes: `Repair ticket generated for ${payload.wheelchair.model}. Issue: ${payload.issueCategory}.`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedList = [newRequest, ...repairRequests];
    syncStorage(updatedList);
    toast.success(`Ticket #${randomTicketNum} created successfully!`);
    return randomTicketNum;
  };

  // 2. Provider Accepts Request
  const providerAcceptRequest = (requestId: string) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: "provider_reviewing",
          status_label: "Provider Reviewing",
          changed_by_name: req.provider_name || "Apex Mobility",
          notes: "Technician accepted job ticket and is evaluating diagnostic photos.",
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return {
          ...req,
          status: "provider_reviewing" as RepairLifecycleStatus,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.success("Job request accepted. You can now build an itemized quotation.");
  };

  // 3. Provider Declines Request
  const providerDeclineRequest = (requestId: string, reason: string) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: "cancelled" as RepairLifecycleStatus,
          status_label: "Provider Declined",
          changed_by_name: req.provider_name || "Provider",
          notes: `Declined: ${reason}`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return {
          ...req,
          status: "cancelled" as RepairLifecycleStatus,
          cancellation_reason: reason,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.info("Request declined.");
  };

  // 4. Provider Submits Quotation
  const submitQuotation = (
    requestId: string,
    quotationData: {
      partsCost: number;
      laborCost: number;
      estimatedCompletion: string;
      notes: string;
      items: ItemizedCostItem[];
    }
  ) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const total = quotationData.partsCost + quotationData.laborCost;
        const newQuote: Quotation = {
          id: `quote-${Date.now()}`,
          repair_request_id: req.id,
          provider_id: req.provider_id || "demo-provider-002",
          provider_name: req.provider_name || "Apex Mobility Diagnostics",
          parts_cost: quotationData.partsCost,
          labor_cost: quotationData.laborCost,
          total_cost: total,
          estimated_completion: quotationData.estimatedCompletion,
          notes: quotationData.notes,
          itemized_items: quotationData.items,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: "quotation_received",
          status_label: `Quotation Received (₹${total})`,
          changed_by_name: req.provider_name || "Provider",
          notes: `Itemized quotation generated. Est completion: ${quotationData.estimatedCompletion}.`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...req,
          status: "quotation_received" as RepairLifecycleStatus,
          quotation: newQuote,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.success("Itemized quotation submitted to customer for approval!");
  };

  // 5. User Accepts Quotation
  const userAcceptQuotation = (requestId: string) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: "service_scheduled",
          status_label: "Quotation Approved & Service Scheduled",
          changed_by_name: req.user_name,
          notes: `User accepted quotation ₹${req.quotation?.total_cost || 0}. Doorstep technician dispatch scheduled.`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...req,
          status: "service_scheduled" as RepairLifecycleStatus,
          quotation: req.quotation ? { ...req.quotation, status: "accepted" as const } : null,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.success("Quotation approved! Technician service has been scheduled.");
  };

  // 6. User Declines Quotation
  const userDeclineQuotation = (requestId: string, reason: string) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: "cancelled" as RepairLifecycleStatus,
          status_label: "Quotation Declined by User",
          changed_by_name: req.user_name,
          notes: `Quotation rejected. Reason: ${reason}`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...req,
          status: "cancelled" as RepairLifecycleStatus,
          cancellation_reason: reason,
          quotation: req.quotation ? { ...req.quotation, status: "declined" as const } : null,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.info("Quotation declined.");
  };

  // 7. Update Repair Status Milestone
  const updateRepairStatus = (
    requestId: string,
    nextStatus: RepairLifecycleStatus,
    notes?: string
  ) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const config = STATUS_CONFIG[nextStatus];
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: nextStatus,
          status_label: config.label,
          changed_by_name: req.provider_name || "Technician",
          notes: notes || `Milestone reached: ${config.label}`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...req,
          status: nextStatus,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.success(`Milestone updated to "${STATUS_CONFIG[nextStatus].label}"`);
  };

  // 7b. Add Provider Diagnostic / Service Note without altering lifecycle stage
  const addServiceNote = (requestId: string, note: string) => {
    if (!note.trim()) return;
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const config = STATUS_CONFIG[req.status];
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: req.status,
          status_label: `Technician Note (${config.label})`,
          changed_by_name: req.provider_name || "Technician",
          notes: note.trim(),
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...req,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.success("Service progress note recorded");
  };

  // 8. Cancel Request (Where permitted)
  const cancelRepairRequest = (requestId: string, reason: string) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        const newHist: StatusHistoryEntry = {
          id: `hist-${Date.now()}`,
          repair_request_id: req.id,
          status: "cancelled" as RepairLifecycleStatus,
          status_label: "Request Cancelled",
          changed_by_name: "Customer",
          notes: `Cancelled by user. Reason: ${reason}`,
          timestamp: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...req,
          status: "cancelled" as RepairLifecycleStatus,
          cancellation_reason: reason,
          status_history: [...req.status_history, newHist],
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.info("Repair request has been cancelled.");
  };

  // 9. Submit Review for Completed Repair
  const submitReview = (requestId: string, rating: number, comment: string) => {
    const updated = repairRequests.map((req) => {
      if (req.id === requestId || req.ticket_number === requestId) {
        return {
          ...req,
          rating,
          review_comment: comment,
          status: "request_closed" as RepairLifecycleStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return req;
    });

    syncStorage(updated);
    toast.success("Thank you for reviewing the completed service!");
  };

  const activeRequest =
    repairRequests.find((r) => r.status !== "request_closed" && r.status !== "cancelled") || null;

  return (
    <RepairContext.Provider
      value={{
        repairRequests,
        activeRequest,
        getRepairById,
        createRepairRequest,
        providerAcceptRequest,
        providerDeclineRequest,
        submitQuotation,
        userAcceptQuotation,
        userDeclineQuotation,
        updateRepairStatus,
        addServiceNote,
        cancelRepairRequest,
        submitReview,
      }}
    >
      {children}
    </RepairContext.Provider>
  );
}

export function useRepairs() {
  const context = useContext(RepairContext);
  if (!context) {
    throw new Error("useRepairs must be used within a RepairProvider");
  }
  return context;
}
