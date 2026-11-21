import { createFileRoute } from "@tanstack/react-router";
import { MediaPage } from "./admin.media";

export const Route = createFileRoute("/_authenticated/staff/media")({
  component: MediaPage,
});
