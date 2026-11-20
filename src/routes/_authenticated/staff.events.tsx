import { createFileRoute } from "@tanstack/react-router";
import { RecordsEditor } from "@/components/staff/RecordsEditor";

export const Route = createFileRoute("/_authenticated/staff/events")({
  component: () => (
    <RecordsEditor
      table="events"
      title="Events"
      subtitle="Manage upcoming events and campaigns."
      titleKey="title"
      imageKey="image_url"
      defaults={{ title: "", description: "", image_url: "", date_text: "", location: "", tag: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "title", label: "Title" },
        { key: "tag", label: "Tag" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image_url", label: "Image", type: "image" },
        { key: "date_text", label: "Date" },
        { key: "location", label: "Location" },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_active", label: "Visible on site", type: "bool" },
      ]}
    />
  ),
});