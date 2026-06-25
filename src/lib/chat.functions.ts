import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  mode: z.enum(["faq", "donor", "volunteer"]),
  messages: z.array(MessageSchema).min(1).max(40),
});

const FOUNDATION_CONTEXT = `
You are the official AI assistant for the Deesire Moore Grace Foundation (DMGF),
a legally registered, self-supported nonprofit headquartered in Congo Town,
Opposite EJS Ministerial Complex, Monrovia, Liberia.

Mission: Giving Hope. Empowering Communities. Transforming Lives.
DMGF empowers women, youth and children across Liberia through education,
healthcare, livelihoods, women's empowerment, child welfare, youth development
and advocacy (including campaigns like "Say No To Drugs" and Early/Unwanted
Pregnancy Prevention in Margibi County and beyond).

Contact:
- Email: info24dmgf@gmail.com
- Phones: 0777513816, 0776679963, +231 888061379 (WhatsApp)
- Office hours: Monday–Saturday, 9:00 AM – 5:00 PM

Donation methods:
- PayPal & international cards
- Orange Money: +231 776679963
- MTN Mobile Money: +231 888061378
- Bank Transfer (contact us for details)
- Sponsorship tiers: $25 school supplies, $50 family healthcare, $100 vocational
  training, $250 community project, $500 class education, $1000 community-wide impact.

Programs: Women Empowerment, Youth Development, Child Welfare & Education,
Healthcare & Wellness, Community Development, Advocacy.

Website sections: Home (/), About (/about), Programs (/programs),
Events (/events), Gallery (/gallery), News (/news), Contact (/contact),
Donate (/donate), Volunteer (/volunteer).

Style: warm, compassionate, concise, professional. Keep replies short (under
160 words) unless asked for detail. Use plain language. When helpful, point
users to the relevant page (e.g. "You can donate at /donate"). Never invent
financial figures, partners, or statistics not listed here. If unsure, suggest
contacting info24dmgf@gmail.com.
`.trim();

const MODE_PROMPTS: Record<"faq" | "donor" | "volunteer", string> = {
  faq: `Role: FAQ Assistant. Answer visitor questions about DMGF — who we are,
what we do, where we work, programs, events, transparency, how to get involved.
If a user expresses interest in donating or volunteering, offer to switch and
point them to /donate or /volunteer.`,

  donor: `Role: Donor Onboarding Assistant. Warmly guide a prospective donor.
Ask 1–2 short questions at a time: (1) what cause matters most (women, youth,
children, healthcare, education, community), (2) preferred frequency (one-time
or monthly), (3) suggested amount and impact tier, (4) preferred payment method
(PayPal/Card, Orange Money, MTN MoMo, Bank Transfer, Sponsorship). Confirm
their choice, explain the impact, and direct them to /donate to complete the
gift. Thank them generously. Never collect card numbers or personal financial
details in chat.`,

  volunteer: `Role: Volunteer Onboarding Assistant. Warmly guide a prospective
volunteer. Ask 1–2 short questions at a time: (1) name and location (city/county),
(2) area of interest (Community Outreach, Tutoring & Mentorship, Skilled
Professional, Internship), (3) skills they bring, (4) weekly availability.
Summarize their profile, explain next steps, and direct them to /volunteer to
submit the official application. Be encouraging and clear.`,
};

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { error: "AI service is not configured. Please contact info24dmgf@gmail.com." };
    }

    const systemPrompt = `${FOUNDATION_CONTEXT}\n\n${MODE_PROMPTS[data.mode]}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...data.messages,
        ],
      }),
    });

    if (response.status === 429) {
      return { error: "We're receiving a lot of messages right now. Please try again in a moment." };
    }
    if (response.status === 402) {
      return { error: "Our AI assistant is temporarily unavailable. Please email info24dmgf@gmail.com." };
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("AI gateway error:", response.status, text);
      return { error: "Sorry, something went wrong. Please try again." };
    }

    const json = await response.json();
    const reply: string =
      json?.choices?.[0]?.message?.content?.toString().trim() ??
      "I'm here to help — could you rephrase your question?";

    return { reply };
  });
