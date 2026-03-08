import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FluxKontextGenerator } from "@/components/FluxKontextGenerator";
import { generateMultilingualMetadata } from "@/lib/seo/metadata-generator";

export const metadata: Metadata = generateMultilingualMetadata({
  title: "AI Image Generator - Flux Kontext | Create Professional Images",
  description:
    "Generate and edit professional images with Flux Kontext AI. Text-to-image generation, image editing, and multi-image processing with advanced AI technology.",
  keywords: [
    "AI image generator",
    "Flux Kontext",
    "text to image",
    "image editing",
    "AI art",
    "professional images",
    "image generation ai",
    "ai art creator",
    "flux ai generator",
    "ai image creation",
    "professional ai images",
    "ai powered imaging",
  ],
  path: "/generate",
  images: ["/og-generate.png"],
});

export default function GeneratePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pb-20 pt-24">
        <FluxKontextGenerator />
      </main>

      <Footer />
    </div>
  );
}
