import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StaffLayout } from "@/components/staff/StaffLayout";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({
    meta: [
      { title: "Staff Portal · DMGF" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <StaffLayout>
      <Outlet />
    </StaffLayout>
  ),
});
