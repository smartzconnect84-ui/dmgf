import type { IncomingMessage, ServerResponse } from "node:http";

interface ApiRequest extends IncomingMessage { protocol?: string; headers: IncomingMessage["headers"] }
interface ApiResponse extends ServerResponse { setHeader(name: string, value: string): void; status(code: number): ApiResponse; send(body: string): void }

const entries = [
  ["/", "weekly", "1.0"], ["/about", "monthly", "0.9"], ["/team", "monthly", "0.8"],
  ["/ceo-message", "monthly", "0.8"], ["/programs", "monthly", "0.9"], ["/donate", "monthly", "0.9"],
  ["/volunteer", "monthly", "0.8"], ["/events", "weekly", "0.7"], ["/gallery", "monthly", "0.6"],
  ["/news", "weekly", "0.7"], ["/contact", "yearly", "0.6"],
] as const;

export default function handler(req: ApiRequest, res: ApiResponse) {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  const protocol = req.headers["x-forwarded-proto"] ?? req.protocol ?? "https";
  const base = host ? `${protocol}://${host}` : "";
  const urls = entries.map(([path, changefreq, priority]) => `  <url><loc>${base}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return res.status(200).send(xml);
}
