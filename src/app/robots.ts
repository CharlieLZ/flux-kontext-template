import { MetadataRoute } from "next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/content/locale";
import { withSiteUrl } from "@/lib/site-config";

const disallowPaths = [
  "/api/",
  "/_next/",
  "/static/",
  "/auth/",
  "/dashboard/",
  "/admin/",
  "/404",
  "/500",
  "/*.json$",
];

const allowPaths = [
  "/",
  "/generate",
  "/pricing",
  "/resources",
  "/features",
  "/terms",
  "/privacy",
  "/refund",
  ...SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map(
    (locale) => `/${locale}`,
  ),
];

const aiAgents = [
  "GPTBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "GoogleOther",
  "DuckAssistBot",
  "ChatGPT-User",
  "CCBot",
  "Baiduspider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: allowPaths,
        disallow: disallowPaths,
        crawlDelay: 1,
      },
      {
        userAgent: aiAgents,
        allow: ["/llms.txt", "/llms-full.txt"],
        disallow: ["/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: disallowPaths,
      },
    ],
    sitemap: withSiteUrl("/sitemap.xml"),
  };
}
