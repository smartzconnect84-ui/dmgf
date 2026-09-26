import { createFileRoute } from "@tanstack/react-router";
import { BannersPage } from "./admin.banners";

export const Route = createFileRoute("/_authenticated/staff/banners")({
  component: BannersPage,
});
