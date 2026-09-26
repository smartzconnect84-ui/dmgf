import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "./admin.settings";

export const Route = createFileRoute("/_authenticated/staff/settings")({
  component: SettingsPage,
});
