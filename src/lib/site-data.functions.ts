import { createEdgeAction } from "@/lib/edge-api";

export const fetchHeroBanners = createEdgeAction("fetchHeroBanners");
export const fetchContentBlocks = createEdgeAction<Record<string, string>>("fetchContentBlocks");
export const fetchGalleryItems = createEdgeAction("fetchGalleryItems");
export const fetchEvents = createEdgeAction("fetchEvents");
export const fetchNews = createEdgeAction("fetchNews");
export const fetchPrograms = createEdgeAction("fetchPrograms");
export const fetchTeam = createEdgeAction("fetchTeam");
export const fetchSiteSettings = createEdgeAction("fetchSiteSettings");
