"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { useRepairs } from "@/context/repair-context";
import { useTemporarySupport } from "@/context/temporary-support-context";
import { usePlatform } from "@/context/platform-context";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  href: string;
  category: "repair" | "loan" | "moderation" | "info";
  priority: "urgent" | "normal";
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const STORAGE_READ_IDS = "repairlink_read_notifications_v1";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { repairRequests } = useRepairs();
  const { requests: loanRequests, inventory } = useTemporarySupport();
  const { accounts, adminLogs } = usePlatform();

  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_READ_IDS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setReadIds(parsed);
        }
      }
    } catch {
      // ignore storage fallback
    }
  }, []);

  const persistReadIds = useCallback((next: string[]) => {
    setReadIds(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_READ_IDS, JSON.stringify(next));
    }
  }, []);

  const rawNotifications = useMemo((): Omit<AppNotification, "isRead">[] => {
    const items: Omit<AppNotification, "isRead">[] = [];
    const role = user?.role;

    if (!role) {
      items.push(
        {
          id: "guest-find-repairs",
          title: "Smart Repair Discovery Available",
          description: "Locate vetted manual & motorized wheelchair technicians near your pin code.",
          href: "/find-repairs",
          category: "repair",
          priority: "normal",
          timestamp: "Platform Live",
        },
        {
          id: "guest-temp-support",
          title: "Zero-Downtime Loaner Program",
          description: "Browse hospital and NGO loaner wheelchairs while your chair is under repair.",
          href: "/temporary-support",
          category: "loan",
          priority: "normal",
          timestamp: "Continuity Network",
        }
      );
      return items;
    }

    if (role === "user") {
      const myRepairs = repairRequests.filter(
        (r) => r.user_id === user.id || r.user_id === "demo-user-001"
      );

      for (const req of myRepairs) {
        const latest = req.status_history[req.status_history.length - 1];
        if (
          req.status === "quotation_received" ||
          req.status === "awaiting_user_approval"
        ) {
          items.push({
            id: `user-quote-${req.id}-${req.quotation?.total_cost || 0}`,
            title: `Quotation Ready: #${req.ticket_number}`,
            description: `${req.provider_name || "Provider"} submitted an itemized quote of Rs.${req.quotation?.total_cost ?? 0}. Review to confirm dispatch.`,
            href: `/repairs/${req.ticket_number}`,
            category: "repair",
            priority: "urgent",
            timestamp: latest?.timestamp || "Action Required",
          });
        } else if (
          req.status === "repair_in_progress" ||
          req.status === "service_scheduled"
        ) {
          items.push({
            id: `user-active-${req.id}-${req.status}-${req.status_history.length}`,
            title: `${latest?.status_label || "Repair Update"}: #${req.ticket_number}`,
            description: latest?.notes || `${req.issue_category} servicing underway.`,
            href: `/repairs/${req.ticket_number}`,
            category: "repair",
            priority: "normal",
            timestamp: latest?.timestamp || "In Progress",
          });
        } else if (req.status === "repair_completed") {
          items.push({
            id: `user-done-${req.id}`,
            title: `Repair Completed: #${req.ticket_number}`,
            description: `${req.wheelchair_summary.model} service is finished and verified.`,
            href: `/repairs/${req.ticket_number}`,
            category: "repair",
            priority: "normal",
            timestamp: latest?.timestamp || "Completed",
          });
        }
      }

      const myLoans = loanRequests.filter(
        (l) => l.user_id === user.id || l.user_id === "demo-user-001"
      );
      for (const loan of myLoans) {
        if (loan.status === "approved" || loan.status === "lent_active") {
          items.push({
            id: `user-loan-${loan.id}-${loan.status}`,
            title:
              loan.status === "approved"
                ? `Loaner Approved: #${loan.request_number}`
                : `Active Loaner Check-In: #${loan.request_number}`,
            description:
              loan.pickup_instructions ||
              `${loan.wheelchair?.model_name || "Wheelchair"} via ${loan.institution_name}.`,
            href: "/temporary-support",
            category: "loan",
            priority: loan.status === "approved" ? "urgent" : "normal",
            timestamp: loan.expected_return_date || loan.requested_end_date,
          });
        }
      }
    }

    if (role === "provider") {
      const incoming = repairRequests.filter(
        (r) => r.status === "request_submitted" || r.status === "provider_reviewing"
      );
      for (const req of incoming) {
        items.push({
          id: `prov-in-${req.id}-${req.status}`,
          title: `Incoming Request: #${req.ticket_number}`,
          description: `${req.issue_category} (${req.urgency.toUpperCase()}) for ${req.user_name}`,
          href: "/dashboard/provider?tab=incoming",
          category: "repair",
          priority: req.urgency === "emergency" || req.urgency === "urgent" ? "urgent" : "normal",
          timestamp: req.status_history[req.status_history.length - 1]?.timestamp || "New",
        });
      }

      const scheduled = repairRequests.filter((r) => r.status === "service_scheduled");
      for (const req of scheduled) {
        items.push({
          id: `prov-sched-${req.id}`,
          title: `Quote Approved — Ready for Dispatch: #${req.ticket_number}`,
          description: `${req.user_name} approved Rs.${req.quotation?.total_cost ?? 0}. Begin service execution.`,
          href: "/dashboard/provider?tab=active",
          category: "repair",
          priority: "urgent",
          timestamp: "Dispatch Ready",
        });
      }
    }

    if (role === "institution") {
      const pendingLoans = loanRequests.filter((l) => l.status === "pending");
      for (const loan of pendingLoans) {
        items.push({
          id: `inst-pend-${loan.id}`,
          title: `New Loaner Application: #${loan.request_number}`,
          description: `${loan.user_name} requested ${loan.wheelchair?.model_name || "loaner unit"}. Requires clinical seating check.`,
          href: "/dashboard/institution?tab=requests",
          category: "loan",
          priority: "urgent",
          timestamp: loan.requested_start_date,
        });
      }

      const approvedLoans = loanRequests.filter((l) => l.status === "approved");
      for (const loan of approvedLoans) {
        items.push({
          id: `inst-handover-${loan.id}`,
          title: `Reserved Unit Awaiting Handover: #${loan.request_number}`,
          description: `Confirm dispatch when ${loan.user_name} collects ${loan.wheelchair?.serial_tag || "wheelchair"}.`,
          href: "/dashboard/institution?tab=active_loans",
          category: "loan",
          priority: "normal",
          timestamp: loan.requested_start_date,
        });
      }

      const maintCount = inventory.filter((w) => w.availability_status === "under_maintenance").length;
      if (maintCount > 0) {
        items.push({
          id: `inst-maint-${maintCount}`,
          title: `${maintCount} Chair${maintCount > 1 ? "s" : ""} Under Maintenance`,
          description: "Complete hygiene sanitization checks to return units to public pool availability.",
          href: "/dashboard/institution?tab=returns",
          category: "info",
          priority: "normal",
          timestamp: "Maintenance Bay",
        });
      }
    }

    if (role === "admin") {
      const pendingAccounts = accounts.filter((a) => a.verification_status === "pending");
      for (const acc of pendingAccounts) {
        items.push({
          id: `admin-ver-${acc.id}`,
          title: `Verification Needed: ${acc.organization_name || acc.full_name}`,
          description: `${acc.role.toUpperCase()} applicant from ${acc.city} awaits credential approval.`,
          href: "/dashboard/admin?tab=verifications",
          category: "moderation",
          priority: "urgent",
          timestamp: acc.joined_at,
        });
      }

      const urgentRepairs = repairRequests.filter(
        (r) =>
          (r.urgency === "emergency" || r.urgency === "urgent") &&
          r.status !== "repair_completed" &&
          r.status !== "request_closed" &&
          r.status !== "cancelled"
      );
      for (const req of urgentRepairs.slice(0, 2)) {
        items.push({
          id: `admin-urg-${req.id}-${req.status}`,
          title: `${req.urgency.toUpperCase()} Repair Monitor: #${req.ticket_number}`,
          description: `${req.issue_category} for ${req.user_name} — ${req.provider_name || "Awaiting match"}`,
          href: "/dashboard/admin?tab=repairs",
          category: "repair",
          priority: "urgent",
          timestamp: "Live SLA",
        });
      }

      if (adminLogs[0]) {
        items.push({
          id: `admin-log-${adminLogs[0].id}`,
          title: `${adminLogs[0].action}: ${adminLogs[0].target}`,
          description: adminLogs[0].details,
          href: "/dashboard/admin?tab=activity",
          category: "moderation",
          priority: "normal",
          timestamp: adminLogs[0].timestamp,
        });
      }
    }

    return items;
  }, [user, repairRequests, loanRequests, inventory, accounts, adminLogs]);

  const notifications = useMemo(
    () =>
      rawNotifications.map((item) => ({
        ...item,
        isRead: readIds.includes(item.id),
      })),
    [rawNotifications, readIds]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      if (!readIds.includes(id)) {
        persistReadIds([...readIds, id]);
      }
    },
    [readIds, persistReadIds]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]));
    persistReadIds(allIds);
  }, [readIds, notifications, persistReadIds]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
