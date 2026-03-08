"use client";

import { useId } from "react";
import type {
  CSSProperties,
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  RefObject,
} from "react";
import {
  Crown,
  Image as ImageIcon,
  Info,
  Loader2,
  Shield,
  Zap,
} from "lucide-react";

import { SmartImagePreview } from "@/components/SmartImagePreview";
import { StandardTurnstile } from "@/components/StandardTurnstile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserType } from "@/lib/user-tiers";

interface ImageCountOption {
  value: number;
  label: string;
}

interface AspectRatioOption {
  value: string;
  label: string;
  icon?: string;
}

interface GeneratorWorkspaceCardProps {
  isEditMode: boolean;
  promptValue: string;
  onPromptChange: (value: string) => void;
  onEnhancePrompt: () => void;
  uploadedImages: string[];
  multiFileInputRef: RefObject<HTMLInputElement>;
  onMultiImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveUploadedImage: (index: number) => void;
  onUploadZonePaste: (event: ClipboardEvent<any>) => void;
  onDragOver: (event: DragEvent<any>) => void;
  onDragEnter: (event: DragEvent<any>) => void;
  onDragLeave: (event: DragEvent<any>) => void;
  onDrop: (event: DragEvent<any>) => void;
  numImages: number;
  onNumImagesChange: (value: number) => void;
  imageCountOptions: ImageCountOption[];
  canUseImageCount: (count: number) => boolean;
  getUpgradeMessage: (count: number) => string;
  onUpgrade: () => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  aspectRatioOptions: AspectRatioOption[];
  isTurnstileEnabled: boolean;
  shouldShowTurnstile: boolean;
  isTurnstileVerified: boolean;
  turnstileRef: RefObject<HTMLDivElement>;
  onTurnstileVerify: (token: string) => void;
  onTurnstileError: (error: string) => void;
  onTurnstileExpire: () => void;
  userType: UserType;
  isGenerating: boolean;
  countdown: number;
  canSubmit: boolean;
  onSubmit: () => void;
}

export function GeneratorWorkspaceCard({
  isEditMode,
  promptValue,
  onPromptChange,
  onEnhancePrompt,
  uploadedImages,
  multiFileInputRef,
  onMultiImageUpload,
  onRemoveUploadedImage,
  onUploadZonePaste,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  numImages,
  onNumImagesChange,
  imageCountOptions,
  canUseImageCount,
  getUpgradeMessage,
  onUpgrade,
  aspectRatio,
  onAspectRatioChange,
  aspectRatioOptions,
  isTurnstileEnabled,
  shouldShowTurnstile,
  isTurnstileVerified,
  turnstileRef,
  onTurnstileVerify,
  onTurnstileError,
  onTurnstileExpire,
  userType,
  isGenerating,
  countdown,
  canSubmit,
  onSubmit,
}: GeneratorWorkspaceCardProps) {
  const promptId = useId();
  const imageCountId = useId();
  const aspectRatioId = useId();
  const uploadHintId = useId();
  const promptPlaceholder = isEditMode
    ? "Describe what you want to change in the images…"
    : "Describe the image you want to create…";

  return (
    <Card
      className="generator-panel generator-panel--subtle generator-reveal p-5 lg:p-6"
      style={{ "--generator-delay": "120ms" } as CSSProperties}
    >
      <div className="space-y-5">
        <div className="mb-2 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label
                htmlFor={promptId}
                className="generator-label text-sm font-medium"
              >
                Image Description
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onEnhancePrompt}
                className="generator-secondary-button h-8 px-3 text-xs"
              >
                ✨ Refine Prompt
              </Button>
            </div>
            <Textarea
              id={promptId}
              placeholder={promptPlaceholder}
              value={promptValue}
              onChange={(event) => onPromptChange(event.target.value)}
              spellCheck={false}
              className="generator-control min-h-[19rem] resize-none rounded-2xl px-4 py-3 text-sm leading-6"
            />
          </div>

          <div>
            <Label className="generator-label mb-1 block text-sm font-medium">
              Reference Images (Optional)
            </Label>
            <div
              className="generator-dropzone flex min-h-[19rem] cursor-pointer flex-col justify-center rounded-[1.4rem] p-3 text-center"
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => {
                if (multiFileInputRef.current) {
                  multiFileInputRef.current.value = "";
                }
                multiFileInputRef.current?.click();
              }}
              onPaste={onUploadZonePaste}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (multiFileInputRef.current) {
                    multiFileInputRef.current.value = "";
                  }
                  multiFileInputRef.current?.click();
                }
              }}
              role="button"
              aria-label="Upload reference images"
              aria-describedby={uploadHintId}
              tabIndex={0}
            >
              <input
                ref={multiFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onMultiImageUpload}
                className="hidden"
              />

              {uploadedImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1">
                    {uploadedImages.slice(0, 4).map((url, index) => (
                      <SmartImagePreview
                        key={index}
                        url={url}
                        alt={`Reference ${index + 1}`}
                        index={index}
                        onRemove={() => onRemoveUploadedImage(index)}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (multiFileInputRef.current) {
                        multiFileInputRef.current.value = "";
                      }
                      multiFileInputRef.current?.click();
                    }}
                    className="generator-secondary-button h-8 text-xs"
                  >
                    Add More ({uploadedImages.length})
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="generator-icon-orb mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[rgba(103,177,199,0.12)]">
                    <ImageIcon className="h-8 w-8 text-[rgba(191,229,242,0.92)]" />
                  </div>
                  <p className="generator-copy mb-1 text-sm font-medium">
                    Click, drag & drop, or paste images
                  </p>
                  <p id={uploadHintId} className="generator-muted text-xs">
                    Supports JPG, PNG, WebP (optional)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label
              htmlFor={imageCountId}
              className="generator-label mb-1 block text-sm font-medium"
            >
              Images Count
            </Label>
            <select
              id={imageCountId}
              value={String(numImages)}
              onChange={(event) => {
                const selectedCount = Number.parseInt(event.target.value, 10);
                if (canUseImageCount(selectedCount)) {
                  onNumImagesChange(selectedCount);
                }
              }}
              aria-label="Select images count"
              className="generator-control h-10 w-full rounded-xl px-3 text-sm"
            >
              {imageCountOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={!canUseImageCount(option.value)}
                >
                  {option.label}
                  {!canUseImageCount(option.value) ? " (Upgrade required)" : ""}
                </option>
              ))}
            </select>

            {!canUseImageCount(numImages) ? (
              <div className="generator-note generator-note--warning mt-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>{getUpgradeMessage(numImages)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUpgrade}
                    className="generator-secondary-button h-7 px-2 text-xs"
                  >
                    <Crown className="mr-1 h-2 w-2" />
                    Upgrade
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <Label
              htmlFor={aspectRatioId}
              className="generator-label mb-1 block text-sm font-medium"
            >
              {isEditMode ? "Output Ratio" : "Aspect Ratio"}
            </Label>
            <select
              id={aspectRatioId}
              value={aspectRatio}
              onChange={(event) => onAspectRatioChange(event.target.value)}
              aria-label={
                isEditMode ? "Select output ratio" : "Select aspect ratio"
              }
              className="generator-control h-10 w-full rounded-xl px-3 text-sm"
            >
              {aspectRatioOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon ? `${option.icon} ` : ""}
                  {option.label}
                </option>
              ))}
            </select>

            {isEditMode ? (
              <div className="generator-note generator-note--info mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 text-[rgba(191,229,242,0.92)]" />
                  <span>
                    Image editing may preserve original proportions. Output
                    ratio provides guidance but final size depends on input
                    image.
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-1 md:col-span-1">
            {shouldShowTurnstile ? (
              <div>
                <div className="mb-2 flex items-center justify-center md:justify-start">
                  <Label className="generator-label flex items-center gap-1 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Security
                  </Label>
                </div>
                <div
                  className="generator-note generator-note--info relative flex min-h-24 items-center justify-center rounded-2xl p-3"
                  ref={turnstileRef}
                >
                  {isTurnstileVerified ? (
                    <div className="flex items-center gap-2 py-2 text-center text-sm text-[rgba(210,235,221,0.96)]">
                      <Shield className="h-4 w-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="text-center">
                      <StandardTurnstile
                        onVerify={onTurnstileVerify}
                        onError={onTurnstileError}
                        onExpire={onTurnstileExpire}
                        theme="auto"
                        size="flexible"
                      />
                      <div className="mt-1 text-xs text-muted-foreground">
                        Human verification required
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Label className="generator-label mb-2 flex items-center justify-center gap-1 text-sm font-medium md:justify-start">
                  <Shield className="h-4 w-4" />
                  Security
                </Label>
                <div className="generator-note generator-note--success flex min-h-24 items-center justify-center rounded-2xl p-3">
                  <div className="flex items-center gap-2 py-2 text-center text-sm">
                    <Shield className="h-4 w-4" />
                    {userType === UserType.PREMIUM
                      ? "Premium User"
                      : userType === UserType.REGISTERED
                        ? "Registered User"
                        : !isTurnstileEnabled
                          ? "Disabled"
                          : "No verification needed"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 flex flex-col justify-center md:col-span-2">
            <div className="flex justify-center md:justify-end md:pr-8">
              <div className="generator-section-frame w-full max-w-sm p-4 text-center">
                <Label className="generator-label mb-3 flex items-center justify-center gap-2 text-sm font-medium">
                  <Zap className="h-5 w-5" />
                  Generate Images
                </Label>
                <Button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="generator-primary-button h-16 w-full text-base font-semibold"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating…</span>
                      {countdown > 0 ? (
                        <span className="text-sm opacity-70">
                          ~{countdown}s
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Generate
                    </>
                  )}
                </Button>

                {!canUseImageCount(numImages) ? (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUpgrade}
                      className="generator-secondary-button text-sm"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      {getUpgradeMessage(numImages)}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
