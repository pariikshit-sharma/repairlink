export type UserRole = "user" | "provider" | "institution" | "admin";

export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended";

export type InstitutionCategory = "hospital" | "rehabilitation_centre" | "ngo" | "other";

export type RepairLifecycleStatus =
  | "request_submitted"
  | "provider_reviewing"
  | "quotation_received"
  | "awaiting_user_approval"
  | "service_scheduled"
  | "repair_in_progress"
  | "repair_completed"
  | "request_closed"
  | "cancelled";

export type ServicePreference = "at_home" | "workshop" | "institutional";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string;
  address: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus;
  verification_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WheelchairUserDetails {
  id: string;
  user_id: string;
  wheelchair_type: string;
  wheelchair_brand?: string | null;
  wheelchair_model?: string | null;
  device_description?: string | null;
  seat_width_cm?: number | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderDetails {
  id: string;
  user_id: string;
  business_name: string;
  service_categories: string[];
  supported_wheelchair_types: string[];
  experience_years: string;
  certification_details?: string | null;
  service_radius_km: number;
  is_available: boolean;
  rating: number;
  total_jobs_completed: number;
  created_at: string;
  updated_at: string;
}

export interface InstitutionDetails {
  id: string;
  user_id: string;
  institution_name: string;
  institution_category: InstitutionCategory;
  contact_person?: string | null;
  available_loaner_units: number;
  lending_guidelines?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemizedCostItem {
  id: string;
  title: string;
  category: "parts" | "labor" | "inspection";
  cost: number;
}

export interface Quotation {
  id: string;
  repair_request_id: string;
  provider_id: string;
  provider_name: string;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  estimated_completion: string;
  notes: string;
  itemized_items: ItemizedCostItem[];
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  repair_request_id: string;
  status: RepairLifecycleStatus;
  status_label: string;
  changed_by_name: string;
  notes?: string;
  timestamp: string;
}

export interface RepairRequest {
  id: string;
  ticket_number: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  provider_id: string | null;
  provider_name: string | null;
  wheelchair_summary: {
    type: string;
    brand: string;
    model: string;
    serial?: string;
  };
  issue_category: string;
  description: string;
  images: string[];
  service_preference: ServicePreference;
  service_address: string;
  status: RepairLifecycleStatus;
  urgency: "standard" | "urgent" | "emergency";
  cancellation_reason?: string | null;
  quotation?: Quotation | null;
  status_history: StatusHistoryEntry[];
  rating?: number | null;
  review_comment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile;
  details?: WheelchairUserDetails | ProviderDetails | InstitutionDetails | null;
}


export type WheelchairLoanStatus =
  | "available"
  | "request_pending"
  | "reserved"
  | "currently_lent"
  | "under_maintenance";

export type LoanRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "lent_active"
  | "returned"
  | "cancelled";

export type WheelchairConditionRating = "tier_a_mint" | "tier_b_good" | "tier_c_functional";

export interface InventoryWheelchair {
  id: string;
  institution_id: string;
  institution_name: string;
  institution_location: string;
  institution_phone?: string;
  serial_tag: string;
  model_name: string;
  wheelchair_type: string;
  manual_or_powered: "manual" | "powered";
  seat_width_cm: number;
  weight_capacity_kg: number;
  condition_rating: WheelchairConditionRating;
  availability_status: WheelchairLoanStatus;
  lending_conditions: string;
  deposit_amount: number;
  image_url: string;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface TemporarySupportRequest {
  id: string;
  request_number: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  user_email?: string;
  user_address: string;
  wheelchair_id: string;
  wheelchair?: InventoryWheelchair;
  institution_id: string;
  institution_name: string;
  repair_ticket_id?: string | null;
  requested_start_date: string;
  requested_end_date: string;
  delivery_mode: "pickup" | "hospital_delivery";
  patient_medical_notes: string;
  status: LoanRequestStatus;
  institution_notes?: string | null;
  pickup_instructions?: string | null;
  lent_at?: string | null;
  expected_return_date?: string | null;
  returned_at?: string | null;
  created_at: string;
  updated_at: string;
}
