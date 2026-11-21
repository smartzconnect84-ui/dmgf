import { createFileRoute } from "@tanstack/react-router";
import { RecordsEditor } from "@/components/staff/RecordsEditor";

export const Route = createFileRoute("/_authenticated/admin/programs")({
  component: () => (
    <RecordsEditor
      table="programs"
      title="Programs"
      subtitle="Add and update the foundation's programs."
      titleKey="title"
      imageKey="image_url"
      defaults={{
        title: "",
        summary: "",
        body: "",
        image_url: "",
        tag: "",
        date_text: "",
        location: "",
        is_highlight: false,
        sort_order: 0,
        is_active: true,
      }}
      fields={[
        { key: "title", label: "Title" },
        { key: "tag", label: "Tag (e.g. Women Empowerment)" },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "body", label: "Full description", type: "textarea" },
        { key: "image_url", label: "Flyer / photo", type: "image" },
        { key: "date_text", label: "Date" },
        { key: "location", label: "Location" },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_highlight", label: "Highlight", type: "bool" },
        { key: "is_active", label: "Visible on site", type: "bool" },
      ]}
    />
  ),
});
