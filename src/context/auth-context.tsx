"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { usePlatform } from "@/context/platform-context";
import {
  UserRole,
  Profile,
  WheelchairUserDetails,
  ProviderDetails,
  InstitutionDetails,
  AuthSessionUser,
} from "@/lib/supabase/types";

// Clean stakeholder accounts for testing and demonstrations
export const DEMO_ACCOUNTS: Record<UserRole, AuthSessionUser> = {
  user: {
    id: "user-default-01",
    email: "user@repairlink.org",
    role: "user",
    profile: {
      id: "user-default-01",
      role: "user",
      full_name: "Priya Sharma",
      email: "user@repairlink.org",
      phone: "+91 98112 00101",
      city: "New Delhi",
      address: "South Extension, New Delhi",
      avatar_url: null,
      verification_status: "verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    details: {
      id: "wc-001",
      user_id: "user-default-01",
      wheelchair_type: "Manual Active",
      wheelchair_brand: "Active Care",
      wheelchair_model: "Apex Pro",
      device_description: "Active lightweight rigid frame wheelchair with quick-release 24-inch pneumatic wheels.",
      seat_width_cm: 40,
      emergency_contact_name: "Designated Emergency Contact",
      emergency_contact_phone: "+91 98112 00102",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as WheelchairUserDetails,
  },
  provider: {
    id: "provider-default-02",
    email: "provider@repairlink.org",
    role: "provider",
    profile: {
      id: "provider-default-02",
      role: "provider",
      full_name: "Rapid Mobility Solutions",
      email: "provider@repairlink.org",
      phone: "+91 98223 00201",
      city: "New Delhi",
      address: "Okhla Industrial Area, New Delhi",
      avatar_url: null,
      verification_status: "verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    details: {
      id: "pr-001",
      user_id: "provider-default-02",
      business_name: "Rapid Mobility Solutions",
      service_categories: ["Brake Repairs", "Motor & Battery Diagnostics", "Spoke Alignment", "Seating Ergonomics"],
      supported_wheelchair_types: ["Manual Active", "Motorized / Electric", "Pediatric Support"],
      experience_years: "5+ years",
      certification_details: "Certified Assistive Technology Repair Specialist",
      service_radius_km: 30,
      is_available: true,
      rating: 4.9,
      total_jobs_completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ProviderDetails,
  },
  institution: {
    id: "inst-default-03",
    email: "institution@repairlink.org",
    role: "institution",
    profile: {
      id: "inst-default-03",
      role: "institution",
      full_name: "National Rehabilitation Center",
      email: "institution@repairlink.org",
      phone: "+91 11 2658 0001",
      city: "New Delhi",
      address: "Medical Enclave, New Delhi",
      avatar_url: null,
      verification_status: "verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    details: {
      id: "inst-001",
      user_id: "inst-default-03",
      institution_name: "National Rehabilitation Center",
      institution_category: "hospital",
      contact_person: "Rehabilitation Coordinator",
      available_loaner_units: 12,
      lending_guidelines: "Temporary loaners dispatched upon verified workshop repair request.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as InstitutionDetails,
  },
  admin: {
    id: "admin-default-04",
    email: "admin@repairlink.org",
    role: "admin",
    profile: {
      id: "admin-default-04",
      role: "admin",
      full_name: "Platform Administrator",
      email: "admin@repairlink.org",
      phone: "+91 800 419 7372",
      city: "New Delhi",
      address: "Central Operations Hub",
      avatar_url: null,
      verification_status: "verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    details: null,
  },
};

interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  role: UserRole;
  // Role specific details
  wheelchairType?: string;
  wheelchairBrand?: string;
  wheelchairModel?: string;
  deviceDescription?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  businessName?: string;
  serviceCategories?: string[];
  supportedWheelchairTypes?: string[];
  experienceYears?: string;
  institutionName?: string;
  institutionCategory?: "hospital" | "rehabilitation_centre" | "ngo" | "other";
  availableLoanerUnits?: number;
}

interface AuthContextType {
  user: AuthSessionUser | null;
  role: UserRole | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, desiredRole?: UserRole) => Promise<boolean>;
  signUp: (payload: SignUpPayload) => Promise<boolean>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateVerificationStatus: (
    userId: string,
    status: "verified" | "rejected" | "suspended" | "pending"
  ) => void;
  updateCurrentUserProfile: (
    profileUpdates: Partial<Profile>,
    detailUpdates?: Partial<WheelchairUserDetails & ProviderDetails & InstitutionDetails>
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { accounts, upsertRegisteredAccount, updateAccountStatus } = usePlatform();

  // Helper to persist session in cookies & localStorage
  const persistSession = (sessionUser: AuthSessionUser | null) => {
    if (typeof window !== "undefined") {
      if (sessionUser) {
        localStorage.setItem("repairlink_user", JSON.stringify(sessionUser));
        document.cookie = `repairlink_session=${encodeURIComponent(
          JSON.stringify({ id: sessionUser.id, role: sessionUser.role, email: sessionUser.email })
        )}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        localStorage.removeItem("repairlink_user");
        document.cookie = "repairlink_session=; path=/; max-age=0; SameSite=Lax";
      }
    }
  };

  // Initialize session on load
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const supabase = createClient();
          if (supabase) {
            const {
              data: { user: sbUser },
            } = await supabase.auth.getUser();

            if (sbUser) {
              // Fetch user profile from Supabase
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", sbUser.id)
                .single();

              if (profile) {
                const sessionUser: AuthSessionUser = {
                  id: sbUser.id,
                  email: sbUser.email || "",
                  role: profile.role,
                  profile,
                };
                setUser(sessionUser);
                persistSession(sessionUser);
                setIsLoading(false);
                return;
              }
            }
          }
        }

        // Fallback: Check local storage for persistent session
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("repairlink_user");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setUser(parsed);
            } catch {
              setUser(null);
            }
          } else {
            // Clean unauthenticated default state
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  // Sign In function
  const signIn = async (
    email: string,
    password: string,
    desiredRole?: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. If Supabase is configured with live credentials
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            toast.error(error.message);
            setIsLoading(false);
            return false;
          }

          if (data.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            const sessionUser: AuthSessionUser = {
              id: data.user.id,
              email: data.user.email || email,
              role: profile?.role || desiredRole || "user",
              profile: profile || {
                id: data.user.id,
                role: profile?.role || desiredRole || "user",
                full_name: data.user.user_metadata?.full_name || email.split("@")[0],
                email: data.user.email || email,
                phone: null,
                city: "New Delhi",
                address: null,
                avatar_url: null,
                verification_status: "verified",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            };

            setUser(sessionUser);
            persistSession(sessionUser);
            toast.success(`Welcome back, ${sessionUser.profile.full_name}!`);
            setIsLoading(false);
            return true;
          }
        }
      }

      // 2. Demo & local state fallback matching
      const foundInAccounts = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );

      if (foundInAccounts) {
        if (foundInAccounts.verification_status === "suspended") {
          toast.error("Account Suspended", {
            description: foundInAccounts.suspension_reason || "This account has been suspended by platform moderation.",
          });
          setIsLoading(false);
          return false;
        }

        const resolvedRole = foundInAccounts.role;
        const matchingDemo = DEMO_ACCOUNTS[resolvedRole];
        const sessionUser: AuthSessionUser = {
          id: foundInAccounts.id,
          email: foundInAccounts.email,
          role: resolvedRole,
          profile: {
            id: foundInAccounts.id,
            role: resolvedRole,
            full_name: foundInAccounts.full_name,
            email: foundInAccounts.email,
            phone: foundInAccounts.phone,
            city: foundInAccounts.city,
            address: null,
            avatar_url: null,
            verification_status: foundInAccounts.verification_status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          details: matchingDemo?.details || null,
        };

        setUser(sessionUser);
        persistSession(sessionUser);
        toast.success(`Signed in as ${sessionUser.profile.full_name} (${resolvedRole.toUpperCase()})`);
        setIsLoading(false);
        return true;
      }

      // Match against preset role accounts or create a custom dynamic user
      const foundRole = (Object.keys(DEMO_ACCOUNTS) as UserRole[]).find(
        (r) => DEMO_ACCOUNTS[r].email.toLowerCase() === email.toLowerCase()
      );

      const targetRole = foundRole || desiredRole || "user";
      const baseAccount = DEMO_ACCOUNTS[targetRole];
      
      const displayName = foundRole 
        ? baseAccount.profile.full_name 
        : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      const sessionUser: AuthSessionUser = {
        id: foundRole ? baseAccount.id : `user-${Date.now()}`,
        email: email,
        role: targetRole,
        profile: {
          id: foundRole ? baseAccount.id : `user-${Date.now()}`,
          role: targetRole,
          full_name: displayName,
          email: email,
          phone: "+91 98112 00101",
          city: "New Delhi",
          address: null,
          avatar_url: null,
          verification_status: "verified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        details: baseAccount.details,
      };

      setUser(sessionUser);
      persistSession(sessionUser);
      toast.success(`Signed in as ${sessionUser.profile.full_name} (${targetRole.toUpperCase()})`);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error("Sign in failed. Please check credentials.");
      setIsLoading(false);
      return false;
    }
  };

  // Sign Up function with role-specific details
  const signUp = async (payload: SignUpPayload): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
              data: {
                full_name: payload.fullName,
                role: payload.role,
                city: payload.city,
                phone: payload.phone,
              },
            },
          });

          if (error) {
            toast.error(error.message);
            setIsLoading(false);
            return false;
          }

          if (data.user) {
            // Role specific details insertions
            if (payload.role === "user") {
              await supabase.from("wheelchair_user_details").insert({
                user_id: data.user.id,
                wheelchair_type: payload.wheelchairType || "Manual Active",
                wheelchair_brand: payload.wheelchairBrand,
                wheelchair_model: payload.wheelchairModel,
                device_description: payload.deviceDescription,
                emergency_contact_name: payload.emergencyContactName,
                emergency_contact_phone: payload.emergencyContactPhone,
              });
            } else if (payload.role === "provider") {
              await supabase.from("provider_details").insert({
                user_id: data.user.id,
                business_name: payload.businessName || payload.fullName,
                service_categories: payload.serviceCategories || ["General Servicing"],
                supported_wheelchair_types: payload.supportedWheelchairTypes || ["Manual Active"],
                experience_years: payload.experienceYears || "3-5 years",
              });
            } else if (payload.role === "institution") {
              await supabase.from("institution_details").insert({
                user_id: data.user.id,
                institution_name: payload.institutionName || payload.fullName,
                institution_category: payload.institutionCategory || "hospital",
                available_loaner_units: payload.availableLoanerUnits || 0,
              });
            }

            toast.success("Account created successfully!");
          }
        }
      }

      // Create structured session
      const generatedId = `user-${Date.now()}`;
      const newSessionUser: AuthSessionUser = {
        id: generatedId,
        email: payload.email,
        role: payload.role,
        profile: {
          id: generatedId,
          role: payload.role,
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          city: payload.city,
          address: null,
          avatar_url: null,
          verification_status: payload.role === "user" ? "verified" : "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        details:
          payload.role === "provider"
            ? ({
                id: `pr-${Date.now()}`,
                user_id: generatedId,
                business_name: payload.businessName || payload.fullName,
                service_categories: payload.serviceCategories || ["General Servicing"],
                supported_wheelchair_types: payload.supportedWheelchairTypes || ["Manual Active"],
                experience_years: payload.experienceYears || "3-5 years",
                service_radius_km: 25,
                is_available: true,
                rating: 5.0,
                total_jobs_completed: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as ProviderDetails)
            : payload.role === "institution"
            ? ({
                id: `inst-${Date.now()}`,
                user_id: generatedId,
                institution_name: payload.institutionName || payload.fullName,
                institution_category: payload.institutionCategory || "hospital",
                available_loaner_units: payload.availableLoanerUnits || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as InstitutionDetails)
            : undefined,
      };

      upsertRegisteredAccount({
        id: generatedId,
        full_name: payload.fullName,
        organization_name: payload.businessName || payload.institutionName,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        role: payload.role,
        verification_status: payload.role === "user" ? "verified" : "pending",
        specialty_or_details:
          payload.role === "provider"
            ? `${(payload.serviceCategories || []).join(", ")} (${payload.experienceYears || "Verified Tech"})`
            : payload.role === "institution"
            ? `${payload.institutionCategory || "Hospital"} • ${payload.availableLoanerUnits || 0} loaner units`
            : `${payload.wheelchairType || "Wheelchair User"} • ${payload.wheelchairBrand || ""} ${payload.wheelchairModel || ""}`.trim(),
      });

      setUser(newSessionUser);
      persistSession(newSessionUser);
      toast.success(`Account registered! Role: ${payload.role.toUpperCase()}`);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
      return false;
    }
  };

  // Sign Out function
  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    persistSession(null);
    toast.info("You have been signed out.");
    setIsLoading(false);
    router.push("/login");
  };

  // Switch demo role (Instant Ideathon jury shortcut)
  const switchDemoRole = (targetRole: UserRole) => {
    let account = DEMO_ACCOUNTS[targetRole];
    if (typeof window !== "undefined") {
      try {
        const overridesStr = localStorage.getItem("repairlink_role_overrides_v1");
        if (overridesStr) {
          const overrides = JSON.parse(overridesStr);
          if (overrides[targetRole]) {
            account = overrides[targetRole];
          }
        }
      } catch {
        // ignore
      }
    }
    setUser(account);
    persistSession(account);
    toast.success(`Switched role to: ${targetRole.toUpperCase()} (${account.profile.full_name})`);
    router.push(`/dashboard/${targetRole}`);
  };

  // Update verification status (Admin moderation action)
  const updateVerificationStatus = (
    userId: string,
    status: "verified" | "rejected" | "suspended" | "pending"
  ) => {
    updateAccountStatus(userId, status);
    if (user && user.id === userId) {
      const updatedUser: AuthSessionUser = {
        ...user,
        profile: {
          ...user.profile,
          verification_status: status,
          updated_at: new Date().toISOString(),
        },
      };
      setUser(updatedUser);
      persistSession(updatedUser);
    }
  };

  // Update current user's profile and role-specific operational details
  const updateCurrentUserProfile = (
    profileUpdates: Partial<Profile>,
    detailUpdates?: Partial<WheelchairUserDetails & ProviderDetails & InstitutionDetails>
  ) => {
    if (!user) return;
    const now = new Date().toISOString();
    const updatedUser: AuthSessionUser = {
      ...user,
      profile: {
        ...user.profile,
        ...profileUpdates,
        updated_at: now,
      },
      details: detailUpdates
        ? ({
            ...(user.details || {}),
            ...detailUpdates,
            updated_at: now,
          } as WheelchairUserDetails | ProviderDetails | InstitutionDetails)
        : user.details,
    };

    setUser(updatedUser);
    persistSession(updatedUser);

    if (typeof window !== "undefined") {
      try {
        const overridesStr = localStorage.getItem("repairlink_role_overrides_v1");
        const overrides = overridesStr ? JSON.parse(overridesStr) : {};
        overrides[user.role] = updatedUser;
        localStorage.setItem("repairlink_role_overrides_v1", JSON.stringify(overrides));
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        profile: user?.profile || null,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        updateVerificationStatus,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
