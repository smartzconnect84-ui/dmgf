import { createEdgeAction } from "@/lib/edge-api";

export const STAFF_ROLES = [
  "admin",
  "editor",
  "ceo",
  "global_director",
  "communication_director",
  "program_director",
  "financial_director",
  "brand_ambassador",
  "volunteer",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const ALL_STAFF_ROLES: StaffRole[] = [...STAFF_ROLES];
export const STAFF_MESSAGING_ROLES: StaffRole[] = STAFF_ROLES.filter((role) => role !== "volunteer");

export const getMyStaffProfile = createEdgeAction("getMyStaffProfile");
export const updateMyStaffProfile = createEdgeAction("updateMyStaffProfile");
export const ensureDemoStaff = createEdgeAction("ensureDemoStaff");
export const listDemoStaff = createEdgeAction("listDemoStaff");
export const staffListDonations = createEdgeAction("staffListDonations");
export const staffUpsertDonation = createEdgeAction("staffUpsertDonation");
export const staffDeleteDonation = createEdgeAction("staffDeleteDonation");
export const staffListSubmissions = createEdgeAction("staffListSubmissions");
export const listStaffRecipients = createEdgeAction("listStaffRecipients");
export const listStaffMessages = createEdgeAction("listStaffMessages");
export const sendStaffMessage = createEdgeAction("sendStaffMessage");
export const markStaffMessageRead = createEdgeAction("markStaffMessageRead");
export const staffExportPrograms = createEdgeAction("staffExportPrograms");
export const staffImportPrograms = createEdgeAction("staffImportPrograms");
export const staffUpdatePassword = createEdgeAction("staffUpdatePassword");
