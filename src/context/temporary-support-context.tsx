"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import {
  InventoryWheelchair,
  TemporarySupportRequest,
  WheelchairLoanStatus,
  LoanRequestStatus,
} from "@/lib/supabase/types";
import {
  INITIAL_INVENTORY_WHEELCHAIRS,
  INITIAL_TEMPORARY_REQUESTS,
  PARTICIPATING_INSTITUTIONS,
  ParticipatingInstitution,
} from "@/lib/data/inventory";
import { toast } from "sonner";

interface TemporarySupportContextType {
  inventory: InventoryWheelchair[];
  requests: TemporarySupportRequest[];
  institutions: ParticipatingInstitution[];
  isLoading: boolean;
  submitRequest: (
    data: Omit<
      TemporarySupportRequest,
      "id" | "request_number" | "status" | "created_at" | "updated_at" | "wheelchair"
    >
  ) => TemporarySupportRequest;
  approveRequest: (
    requestId: string,
    pickupInstructions?: string,
    institutionNotes?: string
  ) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  markAsLent: (requestId: string) => void;
  markAsReturned: (requestId: string, conditionNotes?: string) => void;
  cancelRequest: (requestId: string) => void;
  addWheelchair: (
    wheelchair: Omit<InventoryWheelchair, "id" | "created_at" | "updated_at">
  ) => InventoryWheelchair;
  updateWheelchairStatus: (wheelchairId: string, status: WheelchairLoanStatus) => void;
  updateWheelchair: (wheelchairId: string, updates: Partial<InventoryWheelchair>) => void;
  deleteWheelchair: (wheelchairId: string) => void;
  getRequestsByUser: (userId: string) => TemporarySupportRequest[];
  getRequestsByInstitution: (institutionId: string) => TemporarySupportRequest[];
  getWheelchairById: (id: string) => InventoryWheelchair | undefined;
  updateInstitutionProfile: (
    institutionId: string,
    updates: Partial<ParticipatingInstitution>
  ) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY_INVENTORY = "repairlink_inventory_v1";
const STORAGE_KEY_REQUESTS = "repairlink_temp_requests_v1";
const STORAGE_KEY_INSTITUTIONS = "repairlink_institutions_v1";

const TemporarySupportContext = createContext<TemporarySupportContextType | undefined>(undefined);

export function TemporarySupportProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryWheelchair[]>(INITIAL_INVENTORY_WHEELCHAIRS);
  const [requests, setRequests] = useState<TemporarySupportRequest[]>(INITIAL_TEMPORARY_REQUESTS);
  const [institutions, setInstitutions] = useState<ParticipatingInstitution[]>(PARTICIPATING_INSTITUTIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data on client mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedInventory = localStorage.getItem(STORAGE_KEY_INVENTORY);
        const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);
        const storedInstitutions = localStorage.getItem(STORAGE_KEY_INSTITUTIONS);

        if (storedInventory) {
          const parsed = JSON.parse(storedInventory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInventory(parsed);
          }
        }

        if (storedRequests) {
          const parsed = JSON.parse(storedRequests);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequests(parsed);
          }
        }

        if (storedInstitutions) {
          const parsed = JSON.parse(storedInstitutions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInstitutions(parsed);
          }
        }
      }
    } catch (err) {
      console.warn("Could not read temporary support from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to localStorage
  const saveInventory = useCallback((items: InventoryWheelchair[]) => {
    setInventory(items);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
      }
    } catch (e) {
      console.error("Failed to save inventory to localStorage", e);
    }
  }, []);

  const saveRequests = useCallback((items: TemporarySupportRequest[]) => {
    setRequests(items);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(items));
      }
    } catch (e) {
      console.error("Failed to save temporary requests to localStorage", e);
    }
  }, []);

  // Submit loan application
  const submitRequest = useCallback(
    (
      data: Omit<
        TemporarySupportRequest,
        "id" | "request_number" | "status" | "created_at" | "updated_at" | "wheelchair"
      >
    ): TemporarySupportRequest => {
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const requestNumber = `TMP-2024-${randomSeq}`;
      const newId = `req-tmp-${Date.now()}`;
      const now = new Date().toISOString();

      const matchedWheelchair = inventory.find((w) => w.id === data.wheelchair_id);

      const newRequest: TemporarySupportRequest = {
        ...data,
        id: newId,
        request_number: requestNumber,
        status: "pending",
        wheelchair: matchedWheelchair,
        institution_notes: "Awaiting clinical suitability review by institution seating officer.",
        expected_return_date: data.requested_end_date,
        created_at: now,
        updated_at: now,
      };

      const updatedRequests = [newRequest, ...requests];
      saveRequests(updatedRequests);

      // Update wheelchair availability status to request_pending
      if (data.wheelchair_id) {
        const updatedInventory = inventory.map((wc) =>
          wc.id === data.wheelchair_id ? { ...wc, availability_status: "request_pending" as WheelchairLoanStatus } : wc
        );
        saveInventory(updatedInventory);
      }

      toast.success("Temporary Support Request Submitted", {
        description: `Request ${requestNumber} dispatched to ${data.institution_name}.`,
      });

      return newRequest;
    },
    [inventory, requests, saveInventory, saveRequests]
  );

  // Approve loan
  const approveRequest = useCallback(
    (requestId: string, pickupInstructions?: string, institutionNotes?: string) => {
      let targetWheelchairId: string | undefined;

      const updatedRequests = requests.map((req) => {
        if (req.id === requestId) {
          targetWheelchairId = req.wheelchair_id;
          return {
            ...req,
            status: "approved" as LoanRequestStatus,
            pickup_instructions:
              pickupInstructions ||
              "Approved. Please present your Govt Photo ID and RepairLink Ticket Number at the institution mobility counter.",
            institution_notes:
              institutionNotes ||
              "Loan approved by clinical mobility staff. Equipment sanitized and reserved.",
            updated_at: new Date().toISOString(),
          };
        }
        return req;
      });

      saveRequests(updatedRequests);

      // Mark chair as reserved
      if (targetWheelchairId) {
        const updatedInventory = inventory.map((wc) =>
          wc.id === targetWheelchairId ? { ...wc, availability_status: "reserved" as WheelchairLoanStatus } : wc
        );
        saveInventory(updatedInventory);
      }

      toast.success("Request Approved", {
        description: "The wheelchair has been reserved for the patient.",
      });
    },
    [inventory, requests, saveInventory, saveRequests]
  );

  // Reject loan
  const rejectRequest = useCallback(
    (requestId: string, reason: string) => {
      let targetWheelchairId: string | undefined;

      const updatedRequests = requests.map((req) => {
        if (req.id === requestId) {
          targetWheelchairId = req.wheelchair_id;
          return {
            ...req,
            status: "rejected" as LoanRequestStatus,
            institution_notes: `Application declined: ${reason}`,
            updated_at: new Date().toISOString(),
          };
        }
        return req;
      });

      saveRequests(updatedRequests);

      // Re-release wheelchair to available if it was tied to this
      if (targetWheelchairId) {
        const updatedInventory = inventory.map((wc) =>
          wc.id === targetWheelchairId ? { ...wc, availability_status: "available" as WheelchairLoanStatus } : wc
        );
        saveInventory(updatedInventory);
      }

      toast.info("Request Declined", {
        description: "Patient notified with clinical reason.",
      });
    },
    [inventory, requests, saveInventory, saveRequests]
  );

  // Mark equipment as lent out (patient picked up or delivery confirmed)
  const markAsLent = useCallback(
    (requestId: string) => {
      let targetWheelchairId: string | undefined;
      const now = new Date().toISOString();

      const updatedRequests = requests.map((req) => {
        if (req.id === requestId) {
          targetWheelchairId = req.wheelchair_id;
          return {
            ...req,
            status: "lent_active" as LoanRequestStatus,
            lent_at: now,
            updated_at: now,
          };
        }
        return req;
      });

      saveRequests(updatedRequests);

      // Mark chair as currently_lent
      if (targetWheelchairId) {
        const updatedInventory = inventory.map((wc) =>
          wc.id === targetWheelchairId ? { ...wc, availability_status: "currently_lent" as WheelchairLoanStatus } : wc
        );
        saveInventory(updatedInventory);
      }

      toast.success("Equipment Dispatched / Handed Over", {
        description: "Mobility continuity active. Return tracking initiated.",
      });
    },
    [inventory, requests, saveInventory, saveRequests]
  );

  // Mark equipment as returned & inspected
  const markAsReturned = useCallback(
    (requestId: string, conditionNotes?: string) => {
      let targetWheelchairId: string | undefined;
      const now = new Date().toISOString();

      const updatedRequests = requests.map((req) => {
        if (req.id === requestId) {
          targetWheelchairId = req.wheelchair_id;
          return {
            ...req,
            status: "returned" as LoanRequestStatus,
            returned_at: now,
            institution_notes: conditionNotes
              ? `Returned in good condition: ${conditionNotes}`
              : "Returned on schedule. Sanitized and safety-checked.",
            updated_at: now,
          };
        }
        return req;
      });

      saveRequests(updatedRequests);

      // Return chair to available
      if (targetWheelchairId) {
        const updatedInventory = inventory.map((wc) =>
          wc.id === targetWheelchairId ? { ...wc, availability_status: "available" as WheelchairLoanStatus } : wc
        );
        saveInventory(updatedInventory);
      }

      toast.success("Equipment Returned & Restocked", {
        description: "Wheelchair inspected and restored to Available status.",
      });
    },
    [inventory, requests, saveInventory, saveRequests]
  );

  // Cancel request (user-initiated while pending or reserved)
  const cancelRequest = useCallback(
    (requestId: string) => {
      let targetWheelchairId: string | undefined;
      const now = new Date().toISOString();

      const updatedRequests = requests.map((req) => {
        if (req.id === requestId) {
          targetWheelchairId = req.wheelchair_id;
          return {
            ...req,
            status: "cancelled" as LoanRequestStatus,
            institution_notes: "Cancelled by wheelchair user prior to dispatch.",
            updated_at: now,
          };
        }
        return req;
      });

      saveRequests(updatedRequests);

      if (targetWheelchairId) {
        const updatedInventory = inventory.map((wc) =>
          wc.id === targetWheelchairId &&
          (wc.availability_status === "request_pending" || wc.availability_status === "reserved")
            ? { ...wc, availability_status: "available" as WheelchairLoanStatus }
            : wc
        );
        saveInventory(updatedInventory);
      }

      toast.info("Loan Request Cancelled", {
        description: "Equipment returned to institution availability pool.",
      });
    },
    [inventory, requests, saveInventory, saveRequests]
  );

  // Add wheelchair
  const addWheelchair = useCallback(
    (wheelchairData: Omit<InventoryWheelchair, "id" | "created_at" | "updated_at">): InventoryWheelchair => {
      const newId = `wc-inv-${Date.now()}`;
      const now = new Date().toISOString();

      const newWheelchair: InventoryWheelchair = {
        ...wheelchairData,
        id: newId,
        created_at: now,
        updated_at: now,
      };

      const updated = [newWheelchair, ...inventory];
      saveInventory(updated);

      toast.success("Wheelchair Added to Loan Pool", {
        description: `${newWheelchair.model_name} (${newWheelchair.serial_tag}) is registered.`,
      });

      return newWheelchair;
    },
    [inventory, saveInventory]
  );

  // Update status directly
  const updateWheelchairStatus = useCallback(
    (wheelchairId: string, status: WheelchairLoanStatus) => {
      const updated = inventory.map((wc) =>
        wc.id === wheelchairId ? { ...wc, availability_status: status, updated_at: new Date().toISOString() } : wc
      );
      saveInventory(updated);
      toast.info("Inventory Status Updated", {
        description: `Device status changed to ${status.replace("_", " ")}.`,
      });
    },
    [inventory, saveInventory]
  );

  // Update wheelchair details
  const updateWheelchair = useCallback(
    (wheelchairId: string, updates: Partial<InventoryWheelchair>) => {
      const updated = inventory.map((wc) =>
        wc.id === wheelchairId ? { ...wc, ...updates, updated_at: new Date().toISOString() } : wc
      );
      saveInventory(updated);
      toast.success("Wheelchair specifications updated");
    },
    [inventory, saveInventory]
  );

  // Delete wheelchair
  const deleteWheelchair = useCallback(
    (wheelchairId: string) => {
      const updated = inventory.filter((wc) => wc.id !== wheelchairId);
      saveInventory(updated);
      toast.info("Wheelchair removed from inventory pool");
    },
    [inventory, saveInventory]
  );

  // Hydrate wheelchair object onto requests dynamically so UI always sees accurate specs
  const hydratedRequests = useMemo(() => {
    return requests.map((req) => ({
      ...req,
      wheelchair: req.wheelchair || inventory.find((w) => w.id === req.wheelchair_id),
    }));
  }, [requests, inventory]);

  // Helper selectors
  const getRequestsByUser = useCallback(
    (userId: string) => {
      return hydratedRequests.filter((r) => r.user_id === userId);
    },
    [hydratedRequests]
  );

  const getRequestsByInstitution = useCallback(
    (institutionId: string) => {
      return hydratedRequests.filter((r) => r.institution_id === institutionId);
    },
    [hydratedRequests]
  );

  const getWheelchairById = useCallback(
    (id: string) => {
      return inventory.find((w) => w.id === id);
    },
    [inventory]
  );

  const updateInstitutionProfile = useCallback(
    (institutionId: string, updates: Partial<ParticipatingInstitution>) => {
      const next = institutions.map((inst) =>
        inst.id === institutionId ? { ...inst, ...updates } : inst
      );
      setInstitutions(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_INSTITUTIONS, JSON.stringify(next));
      }
      toast.success("Institution profile & depot details updated");
    },
    [institutions]
  );

  const resetToDefaults = useCallback(() => {
    saveInventory(INITIAL_INVENTORY_WHEELCHAIRS);
    saveRequests(INITIAL_TEMPORARY_REQUESTS);
    setInstitutions(PARTICIPATING_INSTITUTIONS);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_INSTITUTIONS, JSON.stringify(PARTICIPATING_INSTITUTIONS));
    }
    toast.success("Reset Demo Equipment & Requests", {
      description: "Default Delhi hospital pool and loan requests restored.",
    });
  }, [saveInventory, saveRequests]);

  return (
    <TemporarySupportContext.Provider
      value={{
        inventory,
        requests: hydratedRequests,
        institutions,
        isLoading,
        submitRequest,
        approveRequest,
        rejectRequest,
        markAsLent,
        markAsReturned,
        cancelRequest,
        addWheelchair,
        updateWheelchairStatus,
        updateWheelchair,
        deleteWheelchair,
        getRequestsByUser,
        getRequestsByInstitution,
        getWheelchairById,
        updateInstitutionProfile,
        resetToDefaults,
      }}
    >
      {children}
    </TemporarySupportContext.Provider>
  );
}

export function useTemporarySupport() {
  const context = useContext(TemporarySupportContext);
  if (!context) {
    throw new Error("useTemporarySupport must be used within a TemporarySupportProvider");
  }
  return context;
}
