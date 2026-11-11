export interface ProviderReview {
  id: string;
  userName: string;
  userRole: string;
  rating: number;
  date: string;
  comment: string;
  wheelchairType: string;
  serviceCategory: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  location: {
    lat: number;
    lng: number;
    neighborhood: string;
  };
  distanceKm: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationBadge: string;
  estimatedResponseTime: string;
  startingPriceInr: number;
  serviceModes: ("doorstep" | "workshop" | "pickup_drop")[];
  servicesOffered: string[];
  supportedWheelchairTypes: string[];
  experienceYears: string;
  bio: string;
  certifications: string[];
  workingHours: string;
  activeJobs: number;
  completedJobs: number;
  reviews: ProviderReview[];
  emergencySupport: boolean;
}

export const PROBLEM_CATEGORIES = [
  {
    id: "wheel_damage",
    name: "Wheel damage",
    shortName: "Wheels & Tires",
    description: "Punctures, hub bearing wear, spoke breakage, rim misalignment",
    iconName: "Disc",
    color: "emerald",
    estimatedTriage: "1-2 hours",
  },
  {
    id: "brake_malfunction",
    name: "Brake malfunction",
    shortName: "Brakes & Locks",
    description: "Slack cables, parking lock slipping, worn brake pads, loose lever",
    iconName: "OctagonAlert",
    color: "amber",
    estimatedTriage: "45 mins",
  },
  {
    id: "motor_electrical",
    name: "Motor/electrical issue",
    shortName: "Motor & Wiring",
    description: "Controller joystick failure, actuator glitch, harness wire disconnection",
    iconName: "Zap",
    color: "primary",
    estimatedTriage: "2-4 hours",
  },
  {
    id: "battery_issue",
    name: "Battery issue",
    shortName: "Battery & Charger",
    description: "Rapid battery drain, BMS fault, charging port damage, cell imbalance",
    iconName: "BatteryCharging",
    color: "purple",
    estimatedTriage: "1-3 hours",
  },
  {
    id: "seat_cushion",
    name: "Seat and cushion damage",
    shortName: "Seat & Cushion",
    description: "Torn sling upholstery, roho/gel pressure cushion leak, backrest frame",
    iconName: "Armchair",
    color: "teal",
    estimatedTriage: "2 hours",
  },
  {
    id: "frame_damage",
    name: "Frame damage",
    shortName: "Frame & Welding",
    description: "Bent footplate, structural weld crack, axle camber bending, caster fork",
    iconName: "Hammer",
    color: "rose",
    estimatedTriage: "3-6 hours",
  },
  {
    id: "general_servicing",
    name: "General servicing",
    shortName: "Safety Tuneup",
    description: "Full lubrications, bolt tightening, brake re-tensioning, safety audit",
    iconName: "ShieldCheck",
    color: "blue",
    estimatedTriage: "1 hour",
  },
  {
    id: "other",
    name: "Other",
    shortName: "Custom Problem",
    description: "Specialized ergonomic adaptation, headrest installation, custom accessories",
    iconName: "HelpCircle",
    color: "slate",
    estimatedTriage: "Variable",
  },
];

export const WHEELCHAIR_TYPES = [
  "Manual Active",
  "Motorized / Electric",
  "High-Back Tilt-in-Space",
  "Standard Transport",
  "Sports Wheelchair",
];

export const MOCK_PROVIDERS: ProviderItem[] = [
  {
    id: "prov-01",
    name: "Vikram Sharma",
    businessName: "Apex Mobility Diagnostics & Repair Hub",
    tagline: "Certified Assistive Tech Technicians • Doorstep Dispatch",
    phone: "+91 98112 54321",
    email: "vikram@apexrepairs.org",
    city: "New Delhi",
    address: "14 Okhla Industrial Area Phase 3, New Delhi, 110020",
    location: {
      lat: 28.5355,
      lng: 77.2688,
      neighborhood: "Okhla / South Delhi",
    },
    distanceKm: 2.4,
    rating: 4.9,
    reviewCount: 94,
    isVerified: true,
    verificationBadge: "Verified Partner • RCI Certified",
    estimatedResponseTime: "< 45 mins",
    startingPriceInr: 350,
    serviceModes: ["doorstep", "workshop", "pickup_drop"],
    servicesOffered: [
      "Wheel damage",
      "Brake malfunction",
      "Motor/electrical issue",
      "Battery issue",
      "General servicing",
      "Seat and cushion damage",
    ],
    supportedWheelchairTypes: [
      "Manual Active",
      "Motorized / Electric",
      "High-Back Tilt-in-Space",
      "Standard Transport",
    ],
    experienceYears: "7+ years",
    bio: "Apex Mobility is South Delhi's premier assistive device repair station. We specialize in motorized joystick diagnostics, manual spoke truing, and brake calibration. Doorstep van carries common Ottobock, Karma, and Sunrise spare parts.",
    certifications: [
      "Certified Assistive Rehabilitation Technologist (RCI #A4891)",
      "Ottobock Authorized Service Center Training",
      "ISPO India Member",
    ],
    workingHours: "Mon - Sat: 08:30 AM - 08:00 PM (Emergency breakdown hotline active 24/7)",
    activeJobs: 4,
    completedJobs: 412,
    emergencySupport: true,
    reviews: [
      {
        id: "rev-01",
        userName: "Sunita Menon",
        userRole: "Wheelchair User",
        rating: 5,
        date: "04 Nov 2024",
        comment: "My active manual wheelchair caster bearing seized during office hours. Vikram arrived at my workplace within 35 minutes and replaced the fork bearing on the spot. Lifesaver!",
        wheelchairType: "Manual Active",
        serviceCategory: "Wheel damage",
      },
      {
        id: "rev-02",
        userName: "Amitav Roy",
        userRole: "Caregiver",
        rating: 5,
        date: "22 Oct 2024",
        comment: "Excellent battery diagnostics for my father's electric wheelchair. Transparent quotation before touching anything.",
        wheelchairType: "Motorized / Electric",
        serviceCategory: "Battery issue",
      },
    ],
  },
  {
    id: "prov-02",
    name: "Sunil K. Verma",
    businessName: "MobilityAid Rapid Works",
    tagline: "Manual Rigids & Custom Frame Specialists",
    phone: "+91 98711 88992",
    email: "sunil@mobilityaidworks.com",
    city: "New Delhi",
    address: "C-28, Green Park Extension, New Delhi, 110016",
    location: {
      lat: 28.5584,
      lng: 77.2039,
      neighborhood: "Green Park / Hauz Khas",
    },
    distanceKm: 3.8,
    rating: 4.8,
    reviewCount: 68,
    isVerified: true,
    verificationBadge: "Verified Partner",
    estimatedResponseTime: "< 1 hour",
    startingPriceInr: 299,
    serviceModes: ["doorstep", "workshop"],
    servicesOffered: [
      "Wheel damage",
      "Brake malfunction",
      "Frame damage",
      "Seat and cushion damage",
      "General servicing",
    ],
    supportedWheelchairTypes: [
      "Manual Active",
      "Standard Transport",
      "Sports Wheelchair",
    ],
    experienceYears: "10+ years",
    bio: "Over a decade of hands-on mechanical rehabilitation experience. We fabricate and repair custom wheelchair footplates, weld fractured aluminum frames, and install ergonomic seating cushions.",
    certifications: [
      "ITI Mechanical & Precision TIG Welding Certified",
      "National Disability Mobility Support Award 2023",
    ],
    workingHours: "Mon - Sat: 09:00 AM - 07:00 PM",
    activeJobs: 2,
    completedJobs: 290,
    emergencySupport: true,
    reviews: [
      {
        id: "rev-03",
        userName: "Devendra Patil",
        userRole: "Para Athlete",
        rating: 5,
        date: "28 Oct 2024",
        comment: "Sunil re-aligned the negative camber on my sports basketball wheelchair. Unbeatable precision work.",
        wheelchairType: "Sports Wheelchair",
        serviceCategory: "Frame damage",
      },
    ],
  },
  {
    id: "prov-03",
    name: "Pooja Malhotra & Team",
    businessName: "CareMotion Electronics & Rehabilitation Desk",
    tagline: "Power Chair BMS & Joystick PCB Experts",
    phone: "+91 98104 77221",
    email: "support@caremotiondelhi.in",
    city: "New Delhi",
    address: "Plot 82, Jasola Vihar Pocket 1, New Delhi, 110025",
    location: {
      lat: 28.5412,
      lng: 77.2882,
      neighborhood: "Jasola / Sarita Vihar",
    },
    distanceKm: 5.1,
    rating: 4.9,
    reviewCount: 82,
    isVerified: true,
    verificationBadge: "Verified EV Partner",
    estimatedResponseTime: "< 1.5 hours",
    startingPriceInr: 450,
    serviceModes: ["doorstep", "workshop", "pickup_drop"],
    servicesOffered: [
      "Motor/electrical issue",
      "Battery issue",
      "Brake malfunction",
      "General servicing",
      "Other",
    ],
    supportedWheelchairTypes: [
      "Motorized / Electric",
      "High-Back Tilt-in-Space",
      "Manual Active",
    ],
    experienceYears: "6+ years",
    bio: "Specialized in micro-controller debugging, battery pack cell rejuvenation, brushless hub motor maintenance, and electronic dynamic braking for all Indian and imported electric wheelchairs.",
    certifications: [
      "B.Tech Electronics & Assistive Devices Systems",
      "Curtis / Dynamic Controls Diagnostic Certified",
    ],
    workingHours: "Mon - Sun: 08:00 AM - 09:00 PM",
    activeJobs: 5,
    completedJobs: 334,
    emergencySupport: true,
    reviews: [
      {
        id: "rev-04",
        userName: "Harshvardhan S.",
        userRole: "Wheelchair User",
        rating: 5,
        date: "01 Nov 2024",
        comment: "My power chair controller threw an Error 7 code during rain. Pooja diagnosed water intrusion in the wiring harness and resealed it in 40 minutes.",
        wheelchairType: "Motorized / Electric",
        serviceCategory: "Motor/electrical issue",
      },
    ],
  },
  {
    id: "prov-04",
    name: "Raju N. Yadav",
    businessName: "Samarpan Wheelchair Service Station",
    tagline: "Affordable Rapid Doorstep Tuneups",
    phone: "+91 98991 33445",
    email: "raju@samarpanrepairs.in",
    city: "New Delhi",
    address: "Shop 12, Main Market, Lajpat Nagar 4, New Delhi, 110024",
    location: {
      lat: 28.5677,
      lng: 77.2433,
      neighborhood: "Lajpat Nagar / Central Delhi",
    },
    distanceKm: 4.2,
    rating: 4.7,
    reviewCount: 45,
    isVerified: true,
    verificationBadge: "Verified Partner",
    estimatedResponseTime: "< 2 hours",
    startingPriceInr: 250,
    serviceModes: ["doorstep", "workshop"],
    servicesOffered: [
      "Wheel damage",
      "Brake malfunction",
      "Seat and cushion damage",
      "General servicing",
    ],
    supportedWheelchairTypes: [
      "Manual Active",
      "Standard Transport",
    ],
    experienceYears: "8+ years",
    bio: "Focused on reliable mechanical repairs, puncture-proof solid tire conversions, brake cable tensioning, and annual tune-ups at fair and transparent prices.",
    certifications: [
      "Community Assistive Technology Maintenance Certificate",
    ],
    workingHours: "Mon - Sat: 09:30 AM - 07:30 PM",
    activeJobs: 1,
    completedJobs: 180,
    emergencySupport: false,
    reviews: [],
  },
];
