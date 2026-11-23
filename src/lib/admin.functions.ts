import { createEdgeAction } from "@/lib/edge-api";
import { STAFF_ROLES } from "@/lib/staff.functions";

export const OWNER_EMAIL = "info24dmgf@gmail.com";
export const removeDemoAccounts = createEdgeAction("removeDemoAccounts");
export const ensureOwnerAdmin = createEdgeAction("ensureOwnerAdmin");
export const ensureProductionSettings = createEdgeAction("ensureProductionSettings");
export const grantSelfFullAccess = createEdgeAction("grantSelfFullAccess");
export const adminListStaffUsers = createEdgeAction("adminListStaffUsers");
export const adminAssignRole = createEdgeAction("adminAssignRole");
export const adminRemoveRole = createEdgeAction("adminRemoveRole");
export type AdminStatus = { isAdmin: boolean; roles: string[]; userId: string };

export const getMyAdminStatus = createEdgeAction<AdminStatus>("getMyAdminStatus");
export const inviteStaff = createEdgeAction("inviteStaff");
export { STAFF_ROLES };
