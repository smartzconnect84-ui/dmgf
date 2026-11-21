import { generateText, gateway } from "ai";
import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";

interface ApiRequest extends IncomingMessage {
  body?: unknown;
}
interface ApiResponse extends ServerResponse {
  status(code: number): ApiResponse;
  json(value: unknown): void;
}

const inputSchema = z.object({
  mode: z.enum(["faq", "donor", "volunteer"]),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).min(1).max(40),
});

const foundationContext = `You are the official AI assistant for the Deesire Moore Grace Foundation (DMGF), a legally registered, self-supported nonprofit headquartered in Congo Town, Opposite EJS Ministerial Complex, Monrovia, Liberia.

Mission: Giving Hope. Empowering Communities. Transforming Lives. DMGF empowers women, youth and children across Liberia through education, healthcare, livelihoods, women's empowerment, child welfare, youth development and advocacy (including campaigns like "Say No To Drugs" and Early/Unwanted Pregnancy Prevention in Margibi County and beyond).

Contact: info24dmgf@gmail.com; 0777513816, 0776679963, +231 888061379 (WhatsApp). Office hours: Monday–Saturday, 9:00 AM – 5:00 PM.

Donation methods: PayPal & international cards; Orange Money +231 776679963; MTN Mobile Money +231 888061378; bank transfer (contact us for details). Sponsorship tiers: $25 school supplies, $50 family healthcare, $100 vocational training, $250 community project, $500 class education, $1000 community-wide impact.

Programs: Women Empowerment, Youth Development, Child Welfare & Education, Healthcare & Wellness, Community Development, Advocacy. Website: Home (/), About (/about), Programs (/programs), Events (/events), Gallery (/gallery), News (/news), Contact (/contact), Donate (/donate), Volunteer (/volunteer).

Style: warm, compassionate, concise, professional. Keep replies short (under 160 words) unless asked for detail. Use plain language. Never invent financial figures, partners, or statistics. If unsure, suggest contacting info24dmgf@gmail.com.`;

const modePrompts = {
  faq: "Role: FAQ Assistant. Answer visitor questions about DMGF — who we are, what we do, where we work, programs, events, transparency, and how to get involved. If a user expresses interest in donating or volunteering, point them to /donate or /volunteer.",
  donor: "Role: Donor Onboarding Assistant. Warmly guide a prospective donor. Ask 1–2 short questions at a time about their preferred cause, frequency, amount, impact tier, and payment method. Confirm their choice, explain the impact, and direct them to /donate. Never collect card numbers or personal financial details in chat.",
  volunteer: "Role: Volunteer Onboarding Assistant. Warmly guide a prospective volunteer. Ask 1–2 short questions at a time about name and location, area of interest, skills, and weekly availability. Summarize their profile, explain next steps, and direct them to /volunteer to submit the official application.",
} as const;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid chat request." });

  try {
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      system: `${foundationContext}\n\n${modePrompts[parsed.data.mode]}`,
      messages: parsed.data.messages,
      maxOutputTokens: 250,
    });
    return res.status(200).json({ reply: text.trim() || "I'm here to help — could you rephrase your question?" });
  } catch (error) {
    console.error("AI Gateway request failed", error instanceof Error ? error.name : "unknown error");
    return res.status(503).json({ error: "Our AI assistant is temporarily unavailable. Please try again or email info24dmgf@gmail.com." });
  }
}
