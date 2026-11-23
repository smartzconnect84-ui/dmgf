import { createEdgeAction } from "@/lib/edge-api";

export type TeamMemberRow = {
  id: string;
  name: string;
  role_title: string;
  photo_url: string | null;
  bio: string | null;
  email: string | null;
  sort_order: number;
  is_active: boolean;
};

export const fetchHeroBanners = createEdgeAction("fetchHeroBanners");
export const fetchContentBlocks = createEdgeAction<Record<string, string>>("fetchContentBlocks");
export const fetchGalleryItems = createEdgeAction("fetchGalleryItems");
export const fetchEvents = createEdgeAction("fetchEvents");
export const fetchNews = createEdgeAction("fetchNews");
export const fetchPrograms = createEdgeAction("fetchPrograms");
export const fetchTeam = createEdgeAction<TeamMemberRow[]>("fetchTeam");
export const fetchSiteSettings = createEdgeAction("fetchSiteSettings");
