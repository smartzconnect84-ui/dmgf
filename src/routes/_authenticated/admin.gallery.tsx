import { createFileRoute } from "@tanstack/react-router";
import { RecordsEditor } from "@/components/staff/RecordsEditor";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: () => (
    <RecordsEditor
      table="gallery_items"
      title="Gallery"
      subtitle="Upload and caption photos for the gallery."
      titleKey="caption"
      imageKey="image_url"
      defaults={{ image_url: "", caption: "", alt_text: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "image_url", label: "Photo", type: "image" },
        { key: "caption", label: "Caption" },
        { key: "alt_text", label: "Image description (for accessibility)" },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_active", label: "Visible on site", type: "bool" },
      ]}
    />
  ),
});
