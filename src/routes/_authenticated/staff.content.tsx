import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "./admin.content";

export const Route = createFileRoute("/_authenticated/staff/content")({
  component: ContentPage,
});
