"use client";

import type { CSSProperties, MouseEvent } from "react";
import {
  Copy,
  Download,
  Edit,
  Eye,
  Image as ImageIcon,
  Loader2,
  Zap,
} from "lucide-react";

import { CreditDisplay } from "@/components/CreditDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GeneratedImage } from "@/components/flux-kontext/types";

interface GeneratedImagesSectionProps {
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  countdown: number;
  uploadedImagesCount: number;
  aspectRatio: string;
  copySuccess: string;
  onCopyLink: (url: string) => Promise<void>;
  onDownloadImage: (image: GeneratedImage) => Promise<void>;
  onQuickEdit: (image: GeneratedImage, editText: string) => Promise<void>;
  onSelectImageForEditing: (image: GeneratedImage) => void;
  onMissingEditInstructions: () => void;
}

interface GeneratedImageCardProps {
  image: GeneratedImage;
  index: number;
  aspectRatio: string;
  copySuccess: string;
  onCopyLink: (url: string) => Promise<void>;
  onDownloadImage: (image: GeneratedImage) => Promise<void>;
  onQuickEdit: (image: GeneratedImage, editText: string) => Promise<void>;
  onSelectImageForEditing: (image: GeneratedImage) => void;
  onMissingEditInstructions: () => void;
}

function GeneratedImageCard({
  image,
  index,
  aspectRatio,
  copySuccess,
  onCopyLink,
  onDownloadImage,
  onQuickEdit,
  onSelectImageForEditing,
  onMissingEditInstructions,
}: GeneratedImageCardProps) {
  const getCardInput = (event: MouseEvent<HTMLButtonElement>) => {
    const cardElement = event.currentTarget.closest(
      "[data-generated-image-card]",
    );
    return cardElement?.querySelector(
      'input[placeholder="Edit this image..."]',
    ) as HTMLInputElement | null;
  };

  return (
    <Card
      key={index}
      className="generator-image-card group overflow-hidden"
      data-generated-image-card
    >
      <div className="generator-image-frame relative">
        <img
          src={image.url}
          alt={`Generated ${index + 1}`}
          width={image.width || 1024}
          height={image.height || 1024}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <Button
            variant="outline"
            size="sm"
            onClick={async (event) => {
              const inputElement = getCardInput(event);
              const editText = inputElement?.value?.trim() || "";

              if (editText) {
                await onQuickEdit(image, editText);
                if (inputElement) {
                  inputElement.value = "";
                }
                return;
              }

              onSelectImageForEditing(image);
            }}
            aria-label="Send image back to editor"
            title="Quick edit this image"
            className="generator-icon-button h-9 w-9 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadImage(image)}
            aria-label="Download generated image"
            title="Download image"
            className="generator-icon-button h-9 w-9 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
          "{image.prompt}"
        </p>
        <div className="mb-3 flex items-center justify-between text-xs">
          <Badge variant="outline" className="text-xs">
            {image.action.replace("-", " ")}
          </Badge>
          <span className="text-muted-foreground">
            {image.width && image.height
              ? `${image.width}×${image.height}`
              : aspectRatio}
          </span>
        </div>

        <div className="mb-2 grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="generator-secondary-button h-8 text-xs"
            onClick={async () => {
              const linkToCopy = (image as any).fal_url || image.url;
              await onCopyLink(linkToCopy);
            }}
            aria-label="Copy generated image URL"
            title="Copy image URL"
          >
            <Copy className="mr-1 h-3 w-3" />
            COPY
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const openUrl = (image as any).fal_url || image.url;
              window.open(openUrl, "_blank", "noopener,noreferrer");
            }}
            aria-label="Open generated image in a new tab"
            title="Open in new page"
            className="generator-secondary-button h-8 text-xs"
          >
            <Eye className="mr-1 h-3 w-3" />
            OPEN
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadImage(image)}
            aria-label="Download generated image"
            title="Download image"
            className="generator-secondary-button h-8 text-xs"
          >
            <Download className="mr-1 h-3 w-3" />
            DOWN
          </Button>
        </div>

        {copySuccess ? (
          <div
            className="generator-copy-toast mb-2 rounded border py-1 text-center text-xs"
            role="status"
            aria-live="polite"
          >
            ✅ {copySuccess}
          </div>
        ) : null}

        <div className="border-t pt-3">
          <div className="flex gap-2">
            <Input
              placeholder="Edit this image…"
              aria-label="Quick edit instructions"
              className="generator-control h-9 flex-1 rounded-xl px-3 text-xs"
              onKeyDown={async (event) => {
                if (event.key !== "Enter") {
                  return;
                }

                const editText = (
                  event.target as HTMLInputElement
                ).value.trim();
                if (!editText) {
                  return;
                }

                await onQuickEdit(image, editText);
                (event.target as HTMLInputElement).value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={async (event) => {
                const inputElement =
                  event.currentTarget.parentElement?.querySelector("input");
                const editText = inputElement?.value?.trim() || "";

                if (!editText) {
                  onMissingEditInstructions();
                  return;
                }

                await onQuickEdit(image, editText);
                if (inputElement) {
                  inputElement.value = "";
                }
              }}
              aria-label="Submit quick edit"
              className="generator-secondary-button h-9 w-9 p-0"
              title="Quick edit and generate"
            >
              <Zap className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GeneratedImagesSection({
  generatedImages,
  isGenerating,
  countdown,
  uploadedImagesCount,
  aspectRatio,
  copySuccess,
  onCopyLink,
  onDownloadImage,
  onQuickEdit,
  onSelectImageForEditing,
  onMissingEditInstructions,
}: GeneratedImagesSectionProps) {
  return (
    <section
      className="generator-reveal py-4 pb-8"
      style={{ "--generator-delay": "180ms" } as CSSProperties}
    >
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="generator-heading flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
          <ImageIcon className="h-6 w-6" />
          Generated Images
        </h2>
        <CreditDisplay showBuyButton={true} className="flex-shrink-0" />
      </div>

      {generatedImages.length === 0 ? (
        <Card className="generator-empty-state h-96">
          <CardContent className="flex h-full items-center justify-center">
            <div className="text-center">
              {isGenerating ? (
                <>
                  <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary/50" />
                  <h3 className="generator-heading mb-2 text-xl font-medium">
                    Creating your image…
                  </h3>
                  {countdown > 0 ? (
                    <p className="generator-muted text-sm">
                      Estimated time remaining: ~{countdown} seconds
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <ImageIcon className="mx-auto mb-6 h-24 w-24 text-muted-foreground/30" />
                  <h3 className="generator-heading mb-3 text-xl font-medium">
                    Generated images will appear here
                  </h3>
                  <p className="generator-muted mx-auto max-w-md text-sm sm:text-base">
                    {uploadedImagesCount > 0
                      ? `Ready to edit ${uploadedImagesCount} image${uploadedImagesCount > 1 ? "s" : ""}. Add your editing instructions and click the generate button.`
                      : "Enter a description and click generate to create new images."}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generatedImages.map((image, index) => (
              <GeneratedImageCard
                key={index}
                image={image}
                index={index}
                aspectRatio={aspectRatio}
                copySuccess={copySuccess}
                onCopyLink={onCopyLink}
                onDownloadImage={onDownloadImage}
                onQuickEdit={onQuickEdit}
                onSelectImageForEditing={onSelectImageForEditing}
                onMissingEditInstructions={onMissingEditInstructions}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
