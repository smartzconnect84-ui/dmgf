import { createFileRoute } from "@tanstack/react-router";
import { DonationsPage } from "./staff.donations";

export const Route = createFileRoute("/_authenticated/admin/donations")({
  component: DonationsPage,
});