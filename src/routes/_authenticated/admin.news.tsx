import { createFileRoute } from "@tanstack/react-router";
import { RecordsEditor } from "@/components/staff/RecordsEditor";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: () => (
    <RecordsEditor
      table="news_posts"
      title="News & Blog"
      subtitle="Publish news, stories and announcements."
      titleKey="title"
      imageKey="image_url"
      defaults={{
        title: "",
        slug: "",
        excerpt: "",
        body: "",
        image_url: "",
        category: "",
        sort_order: 0,
        is_active: true,
      }}
      fields={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "category", label: "Category" },
        { key: "excerpt", label: "Excerpt", type: "textarea" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "image_url", label: "Image", type: "image" },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_active", label: "Visible on site", type: "bool" },
      ]}
    />
  ),
});
