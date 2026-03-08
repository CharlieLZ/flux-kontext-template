const FALLBACK_SITE_URL = "https://fluxkontext.space";
const FALLBACK_API_BASE_URL = "https://api.fluxkontext.space";
const FALLBACK_SUPPORT_EMAIL = "support@fluxkontext.space";
const FALLBACK_GITHUB_REPO_URL =
  "https://github.com/fluxkontext/fluxkontext.space";
const FALLBACK_X_URL = "https://x.com/fluxkontext";
const FALLBACK_TWITTER_URL = "https://twitter.com/fluxkontext";
const FALLBACK_PINTEREST_URL = "https://pinterest.com/fluxkontext";

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
  siteUrl: normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL, FALLBACK_SITE_URL),
  apiBaseUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    FALLBACK_API_BASE_URL,
  ),
  assetBaseUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_CDN_URL,
    process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL,
  ),
  supportEmail: normalizeEmail(
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    FALLBACK_SUPPORT_EMAIL,
  ),
  githubRepoUrl: normalizePublicUrl(
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL,
    FALLBACK_GITHUB_REPO_URL,
  ),
  socialLinks: {
    x: normalizePublicUrl(process.env.NEXT_PUBLIC_X_URL, FALLBACK_X_URL),
    twitter: normalizePublicUrl(
      process.env.NEXT_PUBLIC_TWITTER_URL,
      FALLBACK_TWITTER_URL,
    ),
    pinterest: normalizePublicUrl(
      process.env.NEXT_PUBLIC_PINTEREST_URL,
      FALLBACK_PINTEREST_URL,
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
