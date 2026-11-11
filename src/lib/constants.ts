export const APP_CONFIG = {
  name: "RepairLink",
  tagline: "When Mobility Stops, Support Shouldn't.",
  subTagline: "Connecting People to Possibilities",
  description:
    "A digital wheelchair repair and mobility-continuity platform connecting wheelchair users with repair providers, rehabilitation centres, hospitals, and NGOs.",
  supportPhone: "+91 (800) 419-7372",
  supportEmail: "support@repairlink.org",
  prototypeNotice:
    "SBI Young Innovators Ideathon Prototype — Verified Real-Time Mobility Continuity Network",
};

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "Find Repairs", href: "/find-repairs" },
  { name: "Temporary Support", href: "/temporary-support" },
  { name: "My Requests", href: "/dashboard/user?tab=requests" },
  { name: "My Wheelchair", href: "/dashboard/user?tab=wheelchair" },
  { name: "Profile", href: "/dashboard/user?tab=profile" },
];

export const ROLE_NAVIGATION_LINKS = {
  user: [
    { name: "Home", href: "/" },
    { name: "Find Repairs", href: "/find-repairs" },
    { name: "Temporary Support", href: "/temporary-support" },
    { name: "My Requests", href: "/dashboard/user?tab=requests" },
    { name: "My Wheelchair", href: "/dashboard/user?tab=wheelchair" },
  ],
  provider: [
    { name: "Home", href: "/" },
    { name: "Incoming", href: "/dashboard/provider?tab=incoming" },
    { name: "Quotations", href: "/dashboard/provider?tab=quotations" },
    { name: "Active Repairs", href: "/dashboard/provider?tab=active" },
    { name: "Profile", href: "/dashboard/provider?tab=profile" },
  ],
  institution: [
    { name: "Home", href: "/" },
    { name: "Lending Requests", href: "/dashboard/institution?tab=requests" },
    { name: "Inventory", href: "/dashboard/institution?tab=inventory" },
    { name: "Returns", href: "/dashboard/institution?tab=returns" },
    { name: "Loaner Catalog", href: "/temporary-support" },
  ],
  admin: [
    { name: "Home", href: "/" },
    { name: "Verifications", href: "/dashboard/admin?tab=verifications" },
    { name: "Users", href: "/dashboard/admin?tab=users" },
    { name: "Repairs", href: "/dashboard/admin?tab=repairs" },
    { name: "Categories", href: "/dashboard/admin?tab=categories" },
  ],
} as const;

export const ROLE_PORTALS = [
  {
    role: "user",
    title: "Wheelchair User",
    description: "Book repairs, track technician dispatch, and request temporary loaner wheelchairs.",
    href: "/dashboard/user",
    badge: "User Portal",
    color: "primary",
  },
  {
    role: "provider",
    title: "Repair Provider",
    description: "Accept diagnostic jobs, issue itemized quotations, and manage service dispatches.",
    href: "/dashboard/provider",
    badge: "Service Partner",
    color: "secondary",
  },
  {
    role: "institution",
    title: "Hospital / Rehab Centre / NGO",
    description: "Manage assistive inventory and approve temporary mobility support requests.",
    href: "/dashboard/institution",
    badge: "Mobility Partner",
    color: "accent",
  },
  {
    role: "admin",
    title: "Platform Administrator",
    description: "Oversee ecosystem verifications, dispute resolutions, and mobility dispatch metrics.",
    href: "/dashboard/admin",
    badge: "Super Admin",
    color: "secondary",
  },
] as const;

export const CORE_SERVICES = [
  {
    id: "smart-repair",
    title: "Smart Repair Discovery",
    tagline: "Fast, specialized diagnostics within reach",
    description:
      "Find vetted wheelchair repair technicians matching your specific manual, active, or motorized chair model with transparent pricing and doorstep response.",
    icon: "Wrench",
    benefits: [
      "Model-matched technicians (manual, electric, sports)",
      "Transparent quotations before technician dispatch",
      "Doorstep pickup & on-site rapid servicing",
    ],
    ctaText: "Find Repair Support",
    ctaLink: "/find-repairs",
    popularTag: "Most Requested",
  },
  {
    id: "temporary-mobility",
    title: "Temporary Mobility Support",
    tagline: "Never remain stranded while waiting on repairs",
    description:
      "Access loaner wheelchairs from verified hospitals, rehabilitation institutions, and partner NGOs so your independence doesn't pause for maintenance.",
    icon: "HeartHandshake",
    benefits: [
      "Institutional equipment pools across verified centers",
      "Direct condition, weight capacity, and cushion matching",
      "Zero-downtime doorstep replacement dispatch",
    ],
    ctaText: "Explore Temporary Support",
    ctaLink: "/temporary-support",
    popularTag: "Proprietary Continuity",
  },
  {
    id: "centralized-management",
    title: "Centralised Repair Management",
    tagline: "End-to-end transparency from triage to delivery",
    description:
      "Live GPS status tracking, digital warranty documentation, past service maintenance logs, and structured billing in one unified record.",
    icon: "FileCheck2",
    benefits: [
      "Digital maintenance logbook for warranties & insurance",
      "Live milestone status tracking from intake to return",
      "Secure digital sign-off and itemized invoicing",
    ],
    ctaText: "View Live Dashboard",
    ctaLink: "/dashboard/user",
    popularTag: "Enterprise Grade",
  },
];

export const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Report Wheelchair Malfunction",
    description: "Specify your wheelchair type (manual/powered), problem category, and optional photo.",
  },
  {
    step: "02",
    title: "Instant Provider Matching & Quotation",
    description: "Receive verified provider estimates with fixed SLAs, service ratings, and clear quotes.",
  },
  {
    step: "03",
    title: "Request Temporary Mobility",
    description: "If your chair needs extensive shop time, request an institution-backed loaner wheelchair.",
  },
  {
    step: "04",
    title: "Live Tracking & Seamless Return",
    description: "Monitor milestones in real time and receive your serviced chair with verified safety sign-off.",
  },
];

export const USER_SEGMENTS = [
  {
    title: "Wheelchair Users & Caregivers",
    description:
      "Regain peace of mind with 24/7 access to urgent repair coordination, verified parts, and temporary loaner wheelchairs.",
    features: ["Rapid emergency triage", "Zero-mobility-pause guarantee", "Digital warranty tracking"],
  },
  {
    title: "Independent Repair Technicians & Workshops",
    description:
      "Grow your assistive device repair business with structured client requests, parts supply links, and guaranteed digital payments.",
    features: ["Pre-qualified repair tickets", "Transparent quote builder", "Local customer routing"],
  },
  {
    title: "Hospitals, Rehab Centres & NGOs",
    description:
      "Digitize idle loaner equipment inventory to serve citizens in need while ensuring accountable return tracking and insurance coverage.",
    features: ["Smart inventory registry", "Verified borrower audit trail", "Social impact analytics"],
  },
];

export const VALUE_PILLARS = [
  {
    metric: "< 45 mins",
    label: "Target Triage Response",
    detail: "Fast technician assignment for critical mobility breakdowns.",
  },
  {
    metric: "100%",
    label: "Mobility Continuity",
    detail: "Temporary loaner wheelchairs ensure life never pauses.",
  },
  {
    metric: "Verified",
    label: "Technicians & Centers",
    detail: "Strict credential and safety verification protocols.",
  },
  {
    metric: "Zero",
    label: "Hidden Markups",
    detail: "Transparent, pre-approved digital quotations.",
  },
];
