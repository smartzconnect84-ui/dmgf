import { createEdgeAction } from "@/lib/edge-api";
import type { TeamMemberRow } from "@/lib/site-data.functions";

export const adminListBanners = createEdgeAction("adminListBanners");
export const adminUpsertBanner = createEdgeAction("adminUpsertBanner");
export const adminDeleteBanner = createEdgeAction("adminDeleteBanner");
export const adminListContent = createEdgeAction("adminListContent");
export const adminUpdateContentValue = createEdgeAction("adminUpdateContentValue");
export const adminUpsertContentBlock = createEdgeAction("adminUpsertContentBlock");
export const adminDeleteContentBlock = createEdgeAction("adminDeleteContentBlock");
export const adminListTeam = createEdgeAction<TeamMemberRow[]>("adminListTeam");
export const adminUpsertTeam = createEdgeAction("adminUpsertTeam");
export const adminDeleteTeam = createEdgeAction("adminDeleteTeam");
export const adminListSubmissions = createEdgeAction("adminListSubmissions");
export const adminMarkSubmission = createEdgeAction("adminMarkSubmission");
export const adminDeleteSubmission = createEdgeAction("adminDeleteSubmission");
export const adminListMedia = createEdgeAction("adminListMedia");
export const adminRegisterMedia = createEdgeAction("adminRegisterMedia");
export const adminDeleteMedia = createEdgeAction("adminDeleteMedia");
export const adminUpdateSettings = createEdgeAction("adminUpdateSettings");
export const adminExportContent = createEdgeAction("adminExportContent");
export const adminImportContent = createEdgeAction("adminImportContent");
export const submitForm = createEdgeAction("submitForm");

/** Content collections managed by the shared RecordsEditor. */
export type RecordTable = "programs" | "gallery_items" | "events" | "news_posts";

export type PublishableTable = RecordTable | "hero_banners" | "team_members";

/** Query keys the public pages use for each collection. */
export const PUBLIC_QUERY_KEYS: Record<PublishableTable, string[]> = {
  hero_banners: ["public", "banners"],
  programs: ["pub", "programs"],
  gallery_items: ["pub", "gallery"],
  events: ["pub", "events"],
  news_posts: ["pub", "news"],
  team_members: ["pub", "team"],
};

export const adminListRecords = createEdgeAction<Record<string, unknown>[]>("adminListRecords");
export const adminSaveRecord = createEdgeAction("adminSaveRecord");
export const adminDeleteRecord = createEdgeAction("adminDeleteRecord");
/** Publishes (`published: true`) or unpublishes a row by flipping `is_active`. */
export const adminSetPublished = createEdgeAction("adminSetPublished");
