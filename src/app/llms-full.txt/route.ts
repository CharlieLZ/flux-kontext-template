import { buildLlmsFullText } from "@/lib/seo/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsFullText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
