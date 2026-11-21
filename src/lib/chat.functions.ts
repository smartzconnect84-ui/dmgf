import { z } from "zod";

const inputSchema = z.object({
  mode: z.enum(["faq", "donor", "volunteer"]),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).min(1).max(40),
});

export async function chatWithAssistant(input: { data: unknown }) {
  const payload = inputSchema.parse(input.data);
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) return { error: result?.error ?? "Sorry, something went wrong. Please try again." };
  return result as { reply: string };
}
