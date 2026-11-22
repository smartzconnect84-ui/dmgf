import {
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Images,
  KeyRound,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
  Layers,
} from "lucide-react";
import { STAFF_ROLES, STAFF_MESSAGING_ROLES, type StaffRole } from "@/lib/staff.functions";

type StaffModule = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  roles: readonly StaffRole[];
  responsibility: Partial<Record<StaffRole, string>>;
  dashboard?: boolean;
};

const allStaffRoles = STAFF_ROLES;

export const STAFF_MODULES: StaffModule[] = [
  {
    to: "/staff",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Assigned module shortcuts",
    roles: allStaffRoles,
    responsibility: Object.fromEntries(allStaffRoles.map((role) => [role, "View assigned modules"])) as Record<StaffRole, string>,
  },
  {
    to: "/staff/donations",
    label: "Donations",
    icon: DollarSign,
    description: "Donation records and totals",
    roles: ["financial_director", "ceo"],
    responsibility: {
      financial_director: "Create, edit, and delete donation records",
      ceo: "Read donation records and totals",
    },
    dashboard: true,
  },
  {
    to: "/staff/submissions",
    label: "Inbox",
    icon: Mail,
    description: "Contact and volunteer submissions",
    roles: ["communication_director", "ceo", "brand_ambassador"],
    responsibility: {
      communication_director: "Read and manage all form submissions",
      ceo: "Read all form submissions",
      brand_ambassador: "Read volunteer sign-ups only",
    },
    dashboard: true,
  },
  {
    to: "/staff/banners",
    label: "Hero Banners",
    icon: ImageIcon,
    description: "Homepage slides",
    roles: ["communication_director"],
    responsibility: { communication_director: "Create, edit, publish, and remove banners" },
    dashboard: true,
  },
  {
    to: "/staff/content",
    label: "Page Content",
    icon: FileText,
    description: "Page text and content blocks",
    roles: ["communication_director"],
    responsibility: { communication_director: "Create, edit, save, import, and export content" },
    dashboard: true,
  },
  {
    to: "/staff/settings",
    label: "Site Settings",
    icon: Settings,
    description: "Contact details and social links",
    roles: ["communication_director"],
    responsibility: { communication_director: "Edit and save site-wide settings" },
    dashboard: true,
  },
  {
    to: "/staff/team",
    label: "Team",
    icon: Users,
    description: "Leadership and ambassador profiles",
    roles: ["ceo"],
    responsibility: { ceo: "Create, edit, publish, and remove team profiles" },
    dashboard: true,
  },
  {
    to: "/staff/programs",
    label: "Programs",
    icon: Layers,
    description: "Programs, descriptions, and flyers",
    roles: ["program_director"],
    responsibility: { program_director: "Create, edit, publish, and remove programs" },
    dashboard: true,
  },
  {
    to: "/staff/gallery",
    label: "Gallery",
    icon: Images,
    description: "Published photos and captions",
    roles: ["program_director", "communication_director"],
    responsibility: {
      program_director: "Create, edit, publish, and remove gallery items",
      communication_director: "Create, edit, publish, and remove gallery items",
    },
    dashboard: true,
  },
  {
    to: "/staff/events",
    label: "Events",
    icon: Calendar,
    description: "Upcoming events and campaigns",
    roles: ["communication_director", "program_director", "ceo"],
    responsibility: {
      communication_director: "Create, edit, publish, and remove events",
      program_director: "Create, edit, publish, and remove events",
      ceo: "Create, edit, publish, and remove events",
    },
    dashboard: true,
  },
  {
    to: "/staff/news",
    label: "News",
    icon: Newspaper,
    description: "News, stories, and announcements",
    roles: ["communication_director", "ceo"],
    responsibility: {
      communication_director: "Create, edit, publish, and remove news",
      ceo: "Create, edit, publish, and remove news",
    },
    dashboard: true,
  },
  {
    to: "/staff/media",
    label: "Media Library",
    icon: ImageIcon,
    description: "Uploaded images and reusable assets",
    roles: ["communication_director"],
    responsibility: { communication_director: "Upload, register, and remove media assets" },
  },
  {
    to: "/staff/profile",
    label: "Account",
    icon: KeyRound,
    description: "Profile and sign-in security",
    roles: allStaffRoles,
    responsibility: Object.fromEntries(allStaffRoles.map((role) => [role, "Manage own profile and password"])) as Record<StaffRole, string>,
  },
  {
    to: "/staff/messages",
    label: "Messages",
    icon: MessageSquare,
    description: "Private staff messages",
    roles: STAFF_MESSAGING_ROLES,
    responsibility: Object.fromEntries(STAFF_MESSAGING_ROLES.map((role) => [role, "Send and read own staff messages"])) as Record<StaffRole, string>,
    dashboard: true,
  },
];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  ceo: "Founder & CEO",
  global_director: "Global Director",
  communication_director: "Communication Director",
  program_director: "Program Director",
  financial_director: "Financial Director",
  brand_ambassador: "Brand Ambassador",
  volunteer: "Volunteer",
};

export function roleLabel(role: StaffRole) {
  return STAFF_ROLE_LABELS[role] ?? role;
}

export function modulesForRole(role: StaffRole) {
  return STAFF_MODULES.filter((module) => module.roles.includes(role));
}
