import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "./admin.team";

export const Route = createFileRoute("/_authenticated/staff/team")({
  component: TeamPage,
});
