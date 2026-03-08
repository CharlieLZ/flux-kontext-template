const PLACEHOLDER_SITE_URL = "https://your-domain.example";
const PLACEHOLDER_GITHUB_REPO_URL = "https://github.com/your-org/your-repo";
const PLACEHOLDER_X_URL = "https://x.com/your-brand";
const PLACEHOLDER_TWITTER_URL = "https://twitter.com/your-brand";
const PLACEHOLDER_PINTEREST_URL = "https://pinterest.com/your-brand";

function stripWww(hostname: string) {
  return hostname.replace(/^www\./, "");
}

function resolveDefaultSiteUrl() {
  const vercelUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (vercelUrl) {
    const formatted = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return normalizePublicUrl(formatted, PLACEHOLDER_SITE_URL);
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return PLACEHOLDER_SITE_URL;
}

function resolveDefaultApiBaseUrl(siteUrl: string) {
  try {
    const url = new URL(siteUrl);
    const hostname = stripWww(url.hostname);

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost")
    ) {
      return normalizePublicUrl(siteUrl, siteUrl);
    }

    return normalizePublicUrl(`https://api.${hostname}`, `https://api.${hostname}`);
  } catch {
    return normalizePublicUrl("https://api.your-domain.example", "https://api.your-domain.example");
  }
}

function resolveDefaultSupportEmail(siteUrl: string) {
  try {
    const hostname = stripWww(new URL(siteUrl).hostname);

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost")
    ) {
      return "support@your-domain.example";
    }

    return `support@${hostname}`;
  } catch {
    return "support@your-domain.example";
  }
}

function normalizePublicUrl(input: string | undefined, fallback: string) {
  const value = input?.trim() || fallback;

  try {
    const url = new URL(value);

    if (url.protocol === "http:") {
      url.protocol = "https:";
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function normalizeEmail(input: string | undefined, fallback: string) {
  const value = input?.trim();
  return value && value.includes("@") ? value : fallback;
}

export const siteConfig = {
  projectName: process.env.NEXT_PUBLIC_PROJECT_NAME?.trim() || "Flux Kontext",
  siteUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    resolveDefaultSiteUrl(),
  ),
  apiBaseUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    resolveDefaultApiBaseUrl(resolveDefaultSiteUrl()),
  ),
  assetBaseUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_CDN_URL,
    process.env.NEXT_PUBLIC_SITE_URL || resolveDefaultSiteUrl(),
  ),
  supportEmail: normalizeEmail(
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    resolveDefaultSupportEmail(resolveDefaultSiteUrl()),
  ),
  githubRepoUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL,
    PLACEHOLDER_GITHUB_REPO_URL,
  ),
  socialLinks: {
    x: normalizePublicUrl(process.env.NEXT_PUBLIC_X_URL, PLACEHOLDER_X_URL),
    twitter: normalizePublicUrl(
      process.env.NEXT_PUBLIC_TWITTER_URL,
      PLACEHOLDER_TWITTER_URL,
    ),
    pinterest: normalizePublicUrl(
      process.env.NEXT_PUBLIC_PINTEREST_URL,
      PLACEHOLDER_PINTEREST_URL,
    ),
  },
} as const;

export function withSiteUrl(path = "/") {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}

export function withApiUrl(path = "/") {
  return new URL(path, `${siteConfig.apiBaseUrl}/`).toString();
}

export function withAssetUrl(path = "/") {
  return new URL(path, `${siteConfig.assetBaseUrl}/`).toString();
}

export function mailtoSupport() {
  return `mailto:${siteConfig.supportEmail}`;
}

export function replaceSiteTokens(text: string) {
  return text
    .replaceAll("{{projectName}}", siteConfig.projectName)
    .replaceAll("{{siteUrl}}", siteConfig.siteUrl)
    .replaceAll("{{apiBaseUrl}}", siteConfig.apiBaseUrl)
    .replaceAll("{{supportEmail}}", siteConfig.supportEmail)
    .replaceAll("{{githubRepoUrl}}", siteConfig.githubRepoUrl);
}
