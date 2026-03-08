import { DEFAULT_LOCALE, LOCALE_FLAGS, LOCALE_NAMES, SUPPORTED_LOCALES } from "@/lib/content/locale";
import { siteConfig, withSiteUrl } from "@/lib/site-config";

type LinkItem = {
  label: string;
  path: string;
  description: string;
};

const coreLinks: LinkItem[] = [
  {
    label: "AI Image Generator",
    path: "/generate",
    description:
      "Main image generation workspace for text-to-image, editing, and multi-image workflows.",
  },
  {
    label: "Pricing Plans",
    path: "/pricing",
    description:
      "Plan comparison, credit packs, and commercial usage options for different teams.",
  },
  {
    label: "Resources Hub",
    path: "/resources",
    description:
      "Guides, launch help, FAQs, and product education for using the template effectively.",
  },
  {
    label: "API Documentation",
    path: "/resources/api",
    description:
      "Developer reference for authentication, generation endpoints, and request formats.",
  },
];

const legalLinks: LinkItem[] = [
  {
    label: "Terms of Service",
    path: "/terms",
    description: "Rules, acceptable usage expectations, and account responsibilities.",
  },
  {
    label: "Privacy Policy",
    path: "/privacy",
    description: "Data handling, analytics, cookies, and privacy commitments.",
  },
  {
    label: "Refund Policy",
    path: "/refund",
    description: "Refund eligibility, cancellation flow, and billing expectations.",
  },
];

const helpfulLinks: LinkItem[] = [
  {
    label: "About the Product",
    path: "/#about",
    description: "Landing-page overview of the product positioning and template value.",
  },
  {
    label: "FAQ Section",
    path: "/resources#faq",
    description: "Common answers about credits, generation limits, and usage guidance.",
  },
  {
    label: "Contact",
    path: "/#contact",
    description: "Support and help entry point for operators using this template.",
  },
];

function formatLink({ label, path, description }: LinkItem) {
  return `- [${label}](${withSiteUrl(path)}): ${description}`;
}

function formatLocaleLink(locale: (typeof SUPPORTED_LOCALES)[number]) {
  const label = `${LOCALE_FLAGS[locale]} ${LOCALE_NAMES[locale]}`;
  const path = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
  return `- [${label}](${withSiteUrl(path)}): ${locale === DEFAULT_LOCALE ? "Default language homepage." : `${LOCALE_NAMES[locale]} language homepage.`}`;
}

export function buildLlmsText() {
  return [
    `# ${siteConfig.projectName}`,
    "",
    `> ${siteConfig.projectName} is a multilingual AI image-generation web template with authentication, billing, documentation, and API-ready workflows.`,
    "",
    "## Core Product Areas",
    ...coreLinks.map(formatLink),
    "",
    `## Language Entry Points (${SUPPORTED_LOCALES.length} locales)`,
    ...SUPPORTED_LOCALES.map(formatLocaleLink),
    "",
    "## Legal",
    ...legalLinks.map(formatLink),
    "",
    "## Helpful Links",
    ...helpfulLinks.map(formatLink),
    "",
    "## Support",
    `- Email: ${siteConfig.supportEmail}`,
    `- Repository: ${siteConfig.githubRepoUrl}`,
    "",
  ].join("\n");
}

export function buildLlmsFullText() {
  return [
    `# ${siteConfig.projectName} - Full Machine-Readable Product Guide`,
    "",
    `> ${siteConfig.projectName} is a production-oriented Next.js template for AI image products. It includes generation flows, auth, pricing, docs, multilingual SEO, and provider-ready backend abstractions.`,
    "",
    "## Product Summary",
    `- Website: ${siteConfig.siteUrl}`,
    `- API base: ${siteConfig.apiBaseUrl}`,
    `- Support: ${siteConfig.supportEmail}`,
    `- Repository: ${siteConfig.githubRepoUrl}`,
    "",
    "## What This Template Covers",
    "- App Router based Next.js frontend",
    "- Server routes for image generation and payment workflows",
    "- Authentication, credits, billing, and protected dashboard surfaces",
    "- Multilingual landing pages and SEO metadata",
    "- Provider abstraction layer for image-generation backends",
    "",
    "## Core Product Areas",
    ...coreLinks.map(formatLink),
    "",
    "## Legal and Trust Pages",
    ...legalLinks.map(formatLink),
    "",
    "## Language Entry Points",
    ...SUPPORTED_LOCALES.map(formatLocaleLink),
    "",
    "## Recommended Reading Order",
    ...[
      "Start with the homepage to understand positioning and product structure.",
      "Open the generator page to inspect the core image workflow.",
      "Review pricing to understand credits and packaging.",
      "Read API docs before wiring external clients or automation.",
      "Use the legal pages when preparing production launch checklists.",
    ].map((line) => `- ${line}`),
    "",
    "## Integration Notes",
    "- Generation providers are abstracted behind a server-side adapter layer.",
    "- Public brand URLs and support addresses should come from environment variables.",
    "- Static machine-readable files are generated from centralized site configuration.",
    "",
    "## Helpful Links",
    ...helpfulLinks.map(formatLink),
    "",
  ].join("\n");
}
