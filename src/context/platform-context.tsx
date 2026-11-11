"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserRole, VerificationStatus } from "@/lib/supabase/types";
import { toast } from "sonner";

export interface PlatformAccount {
  id: string;
  full_name: string;
  organization_name?: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  verification_status: VerificationStatus;
  specialty_or_details: string;
  suspension_reason?: string;
  joined_at: string;
  last_active: string;
}

export interface PlatformCategory {
  id: string;
  name: string;
  kind: "repair_issue" | "wheelchair_type";
  description: string;
  is_active: boolean;
}

export interface AdminActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  category: "moderation" | "repair" | "loan" | "system";
  timestamp: string;
}

const INITIAL_ACCOUNTS: PlatformAccount[] = [
  {
    id: "demo-user-001",
    full_name: "Ramesh Kumar",
    email: "user@demo.repairlink.org",
    phone: "+91 98112 43210",
    city: "New Delhi",
    role: "user",
    verification_status: "verified",
    specialty_or_details: "Ottobock Zenit R (Manual Active) • South Extension Part 1",
    joined_at: "2024-09-12",
    last_active: "2024-11-11",
  },
  {
    id: "usr-demo-02",
    full_name: "Pooja Sharma",
    email: "pooja.sharma@example.com",
    phone: "+91 98711 54321",
    city: "New Delhi",
    role: "user",
    verification_status: "verified",
    specialty_or_details: "Invacare Powerchair • Greater Kailash I",
    joined_at: "2024-10-03",
    last_active: "2024-11-10",
  },
  {
    id: "usr-demo-03",
    full_name: "Amitabh Verma",
    email: "amitabh.v@example.com",
    phone: "+91 99580 98765",
    city: "New Delhi",
    role: "user",
    verification_status: "verified",
    specialty_or_details: "Karma Ergo Electric • Saket",
    joined_at: "2024-10-18",
    last_active: "2024-11-09",
  },
  {
    id: "demo-provider-002",
    full_name: "Vikram Sharma",
    organization_name: "Apex Mobility Diagnostics & Servicing",
    email: "technician@apexrepairs.org",
    phone: "+91 98223 54321",
    city: "New Delhi",
    role: "provider",
    verification_status: "verified",
    specialty_or_details: "Brake Repairs, Motor & Battery Diagnostics, Spoke Welding (5+ yrs exp)",
    joined_at: "2024-08-20",
    last_active: "2024-11-11",
  },
  {
    id: "prov-03",
    full_name: "Sanjeev Kapoor",
    organization_name: "CareMotion Electronics Hub",
    email: "caremotion@example.org",
    phone: "+91 98104 77812",
    city: "New Delhi",
    role: "provider",
    verification_status: "verified",
    specialty_or_details: "Motorized Wheelchair PCB, Li-Ion BMS & Joystick Calibration (8 yrs exp)",
    joined_at: "2024-09-01",
    last_active: "2024-11-10",
  },
  {
    id: "v-001",
    full_name: "Harish Gowda",
    organization_name: "VeloCare Rehabilitation Works",
    email: "velocare.tech@example.org",
    phone: "+91 99001 45210",
    city: "Bengaluru",
    role: "provider",
    verification_status: "pending",
    specialty_or_details: "Motorized Wheelchair Battery & PCB repairs (5 yrs exp). ITI Certificate attached.",
    joined_at: "2024-11-08",
    last_active: "2024-11-10",
  },
  {
    id: "v-002",
    full_name: "Nitin Malhotra",
    organization_name: "MobilityAid Rapid Mechanics",
    email: "mobilityaid.ncr@example.org",
    phone: "+91 98182 31190",
    city: "New Delhi",
    role: "provider",
    verification_status: "pending",
    specialty_or_details: "Manual folding, spoke welding & hydraulic transit repairs (7 yrs exp).",
    joined_at: "2024-11-09",
    last_active: "2024-11-10",
  },
  {
    id: "demo-institution-003",
    full_name: "Dr. Sanjay Wadhwa",
    organization_name: "AIIMS Dept. of Physical Medicine & Rehabilitation",
    email: "rehab@aiims.gov.in",
    phone: "+91 11 2658 8500",
    city: "New Delhi",
    role: "institution",
    verification_status: "verified",
    specialty_or_details: "Apex Govt Medical Institute • Certified clinical mobility loan pool",
    joined_at: "2024-08-15",
    last_active: "2024-11-11",
  },
  {
    id: "inst-isic-vasant-kunj",
    full_name: "Priya Sundaram",
    organization_name: "Indian Spinal Injuries Centre (ISIC)",
    email: "rehab.tech@isiconline.org",
    phone: "+91 11 4225 5225",
    city: "New Delhi",
    role: "institution",
    verification_status: "verified",
    specialty_or_details: "Spinal & Neuro Rehab Specialty • Active Rigid & Powerchair loaners",
    joined_at: "2024-09-05",
    last_active: "2024-11-10",
  },
  {
    id: "v-003",
    full_name: "Sister Mary Joseph",
    organization_name: "St. Stephen's Hospital Community Rehab",
    email: "rehab@ststephenshospital.org",
    phone: "+91 11 2396 6021",
    city: "New Delhi",
    role: "institution",
    verification_status: "pending",
    specialty_or_details: "Offering manual transit loaners for North Delhi community temporary support pool.",
    joined_at: "2024-11-07",
    last_active: "2024-11-10",
  },
  {
    id: "v-004",
    full_name: "Dipendra Manocha",
    organization_name: "Samarthyam Accessibility Trust (NGO)",
    email: "trust@samarthyam.org",
    phone: "+91 11 4164 2211",
    city: "New Delhi",
    role: "institution",
    verification_status: "pending",
    specialty_or_details: "Offering rough-terrain & adaptive chairs for loan pool. Reg #DL-2018-842.",
    joined_at: "2024-11-09",
    last_active: "2024-11-10",
  },
  {
    id: "demo-admin-004",
    full_name: "Ananya Deshmukh",
    organization_name: "RepairLink Platform Operations",
    email: "admin@repairlink.org",
    phone: "+91 800 419 7372",
    city: "New Delhi",
    role: "admin",
    verification_status: "verified",
    specialty_or_details: "Super Admin • Verification & SLA Governance",
    joined_at: "2024-08-01",
    last_active: "2024-11-11",
  },
];

const INITIAL_CATEGORIES: PlatformCategory[] = [
  {
    id: "cat-wheel",
    name: "Wheel & Caster Damage",
    kind: "repair_issue",
    description: "Puncture, rim wobble, broken spokes, bearing grinding, front caster fork alignment.",
    is_active: true,
  },
  {
    id: "cat-brake",
    name: "Brake & Lock Failure",
    kind: "repair_issue",
    description: "Scissor locks, push-to-lock calipers, drum brake cables, electromagnetic brake faults.",
    is_active: true,
  },
  {
    id: "cat-motor",
    name: "Motor & Joystick Electrical",
    kind: "repair_issue",
    description: "Brushless motor noise, carbon brush wear, joystick drift, power harness shorts.",
    is_active: true,
  },
  {
    id: "cat-battery",
    name: "Battery & Charger Diagnostics",
    kind: "repair_issue",
    description: "Rapid voltage drop, BMS fault, Li-ion/SLA cell replacement, charger port pins.",
    is_active: true,
  },
  {
    id: "cat-cushion",
    name: "Seat & Cushion Refurbishment",
    kind: "repair_issue",
    description: "Upholstery tear, backrest sling sag, pressure-relief gel/air valve sealing.",
    is_active: true,
  },
  {
    id: "cat-frame",
    name: "Frame & Cross-Brace Welding",
    kind: "repair_issue",
    description: "Aluminum/steel chassis hairline crack, folding cross-brace stiffness, axle plate adjustment.",
    is_active: true,
  },
  {
    id: "cat-tuneup",
    name: "General Preventive Tune-Up",
    kind: "repair_issue",
    description: "24-point bolt torque safety check, lubrication, camber alignment, hygiene wipe.",
    is_active: true,
  },
  {
    id: "type-manual-active",
    name: "Manual Active Rigid",
    kind: "wheelchair_type",
    description: "Ultralight monocoque daily independence chairs (Ottobock, Panthera, Quickie).",
    is_active: true,
  },
  {
    id: "type-folding-transit",
    name: "Standard Folding Transit",
    kind: "wheelchair_type",
    description: "Foldable cross-brace manual chairs with attendant or self-propel rear wheels.",
    is_active: true,
  },
  {
    id: "type-powered",
    name: "Motorized / Electric Powerchair",
    kind: "wheelchair_type",
    description: "Joystick-operated indoor/outdoor battery-powered wheelchairs & tilt units.",
    is_active: true,
  },
  {
    id: "type-pediatric",
    name: "Pediatric & Tilt-in-Space",
    kind: "wheelchair_type",
    description: "Adaptive posture seating systems for children and pressure-redistribution rehab.",
    is_active: true,
  },
];

const INITIAL_ADMIN_LOGS: AdminActivityItem[] = [
  {
    id: "log-seed-1",
    actor: "Ananya Deshmukh (Admin)",
    action: "Verified Institution",
    target: "Indian Spinal Injuries Centre (ISIC)",
    details: "Approved spinal rehab equipment loan pool and safety SOPs.",
    category: "moderation",
    timestamp: "10 Nov 2024, 04:15 PM",
  },
  {
    id: "log-seed-2",
    actor: "System RLS Monitor",
    action: "Policy Check Passed",
    target: "Supabase Auth + Row Level Security",
    details: "Role isolation enforced across User, Provider, Institution, and Admin portals.",
    category: "system",
    timestamp: "11 Nov 2024, 09:00 AM",
  },
];

interface PlatformContextType {
  accounts: PlatformAccount[];
  categories: PlatformCategory[];
  adminLogs: AdminActivityItem[];
  updateAccountStatus: (
    accountId: string,
    status: VerificationStatus,
    notes?: string
  ) => void;
  upsertRegisteredAccount: (account: Omit<PlatformAccount, "joined_at" | "last_active">) => void;
  addCategory: (name: string, kind: "repair_issue" | "wheelchair_type", description: string) => void;
  toggleCategory: (categoryId: string) => void;
  deleteCategory: (categoryId: string) => void;
  logActivity: (
    actor: string,
    action: string,
    target: string,
    details: string,
    category?: "moderation" | "repair" | "loan" | "system"
  ) => void;
  resetPlatformDefaults: () => void;
}

const STORAGE_ACCOUNTS = "repairlink_platform_accounts_v1";
const STORAGE_CATEGORIES = "repairlink_platform_categories_v1";
const STORAGE_LOGS = "repairlink_platform_logs_v1";

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>(INITIAL_ACCOUNTS);
  const [categories, setCategories] = useState<PlatformCategory[]>(INITIAL_CATEGORIES);
  const [adminLogs, setAdminLogs] = useState<AdminActivityItem[]>(INITIAL_ADMIN_LOGS);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const sAcc = localStorage.getItem(STORAGE_ACCOUNTS);
        const sCat = localStorage.getItem(STORAGE_CATEGORIES);
        const sLog = localStorage.getItem(STORAGE_LOGS);
        if (sAcc) setAccounts(JSON.parse(sAcc));
        if (sCat) setCategories(JSON.parse(sCat));
        if (sLog) setAdminLogs(JSON.parse(sLog));
      }
    } catch {
      // ignore parse fallback
    }
  }, []);

  const saveAccounts = useCallback((next: PlatformAccount[]) => {
    setAccounts(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(next));
    }
  }, []);

  const saveCategories = useCallback((next: PlatformCategory[]) => {
    setCategories(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(next));
    }
  }, []);

  const saveLogs = useCallback((next: AdminActivityItem[]) => {
    setAdminLogs(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_LOGS, JSON.stringify(next));
    }
  }, []);

  const logActivity = useCallback(
    (
      actor: string,
      action: string,
      target: string,
      details: string,
      category: "moderation" | "repair" | "loan" | "system" = "moderation"
    ) => {
      const entry: AdminActivityItem = {
        id: `log-${Date.now()}`,
        actor,
        action,
        target,
        details,
        category,
        timestamp: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setAdminLogs((prev) => {
        const next = [entry, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_LOGS, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  const updateAccountStatus = useCallback(
    (accountId: string, status: VerificationStatus, notes?: string) => {
      let targetName = accountId;
      const updated = accounts.map((acc) => {
        if (acc.id === accountId) {
          targetName = acc.organization_name || acc.full_name;
          return {
            ...acc,
            verification_status: status,
            suspension_reason: status === "suspended" ? notes || "Suspended by platform moderator." : undefined,
            last_active: new Date().toISOString().split("T")[0],
          };
        }
        return acc;
      });
      saveAccounts(updated);

      const actionLabel =
        status === "verified"
          ? "Verified Account"
          : status === "suspended"
          ? "Suspended Account"
          : status === "rejected"
          ? "Rejected Application"
          : "Updated Status";

      logActivity(
        "Admin Moderator",
        actionLabel,
        targetName,
        notes || `Account status transitioned to ${status.toUpperCase()}.`,
        "moderation"
      );

      if (status === "suspended") {
        toast.warning(`${targetName} Suspended`, { description: notes });
      } else if (status === "verified") {
        toast.success(`${targetName} Approved & Verified`);
      } else {
        toast.info(`${targetName} marked as ${status}`);
      }
    },
    [accounts, saveAccounts, logActivity]
  );

  const upsertRegisteredAccount = useCallback(
    (acc: Omit<PlatformAccount, "joined_at" | "last_active">) => {
      const today = new Date().toISOString().split("T")[0];
      const exists = accounts.some((a) => a.id === acc.id || a.email === acc.email);
      const next = exists
        ? accounts.map((a) =>
            a.id === acc.id || a.email === acc.email ? { ...a, ...acc, last_active: today } : a
          )
        : [{ ...acc, joined_at: today, last_active: today }, ...accounts];
      saveAccounts(next);
    },
    [accounts, saveAccounts]
  );

  const addCategory = useCallback(
    (name: string, kind: "repair_issue" | "wheelchair_type", description: string) => {
      const newCat: PlatformCategory = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        kind,
        description: description.trim() || "Configured by platform administration.",
        is_active: true,
      };
      saveCategories([newCat, ...categories]);
      logActivity("Admin Moderator", "Added Category", newCat.name, `${kind} category enabled.`, "system");
      toast.success(`Added category "${newCat.name}"`);
    },
    [categories, saveCategories, logActivity]
  );

  const toggleCategory = useCallback(
    (categoryId: string) => {
      const updated = categories.map((c) =>
        c.id === categoryId ? { ...c, is_active: !c.is_active } : c
      );
      saveCategories(updated);
      const target = updated.find((c) => c.id === categoryId);
      if (target) {
        logActivity(
          "Admin Moderator",
          target.is_active ? "Enabled Category" : "Disabled Category",
          target.name,
          `Platform category availability toggled.`,
          "system"
        );
      }
      toast.info("Category availability updated");
    },
    [categories, saveCategories, logActivity]
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      const target = categories.find((c) => c.id === categoryId);
      saveCategories(categories.filter((c) => c.id !== categoryId));
      if (target) {
        logActivity("Admin Moderator", "Deleted Category", target.name, "Removed from active taxonomy.", "system");
      }
      toast.info("Category removed");
    },
    [categories, saveCategories, logActivity]
  );

  const resetPlatformDefaults = useCallback(() => {
    saveAccounts(INITIAL_ACCOUNTS);
    saveCategories(INITIAL_CATEGORIES);
    saveLogs(INITIAL_ADMIN_LOGS);
    toast.success("Platform registry and categories reset to defaults");
  }, [saveAccounts, saveCategories, saveLogs]);

  return (
    <PlatformContext.Provider
      value={{
        accounts,
        categories,
        adminLogs,
        updateAccountStatus,
        upsertRegisteredAccount,
        addCategory,
        toggleCategory,
        deleteCategory,
        logActivity,
        resetPlatformDefaults,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return ctx;
}
