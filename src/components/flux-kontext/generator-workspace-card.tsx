"use client";

import type { ChangeEvent, ClipboardEvent, DragEvent, RefObject } from "react";
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
  onTextareaPaste: (event: ClipboardEvent<any>) => void;
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
  onTextareaPaste,
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
  const promptPlaceholder = isEditMode
    ? "Describe what you want to change in the images..."
    : "Describe the image you want to create...";

  return (
    <Card className="p-3">
      <div className="space-y-3">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-sm font-medium text-yellow-400">
                Image Description
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onEnhancePrompt}
                className="h-6 px-2 text-xs"
              >
                ✨ AI Enhance
              </Button>
            </div>
            <Textarea
              placeholder={promptPlaceholder}
              value={promptValue}
              onChange={(event) => onPromptChange(event.target.value)}
              onPaste={onTextareaPaste}
              className="h-72 resize-none text-sm text-purple-300"
            />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-yellow-400">
              Reference Images (Optional)
            </Label>
            <div
              className="flex h-72 cursor-pointer flex-col justify-center rounded border-2 border-dashed border-border bg-muted/20 p-2 text-center transition-colors hover:border-primary/50"
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
                    className="h-6 text-xs"
                  >
                    Add More ({uploadedImages.length})
                  </Button>
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto mb-3 h-16 w-16 text-muted-foreground" />
                  <p className="mb-1 text-sm text-purple-300">
                    Click, drag & drop, or paste images
                  </p>
                  <p className="text-xs text-purple-300/60">
                    Supports JPG, PNG, WebP (optional)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-2" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block text-sm font-medium text-yellow-400">
              Images Count
            </Label>
            <select
              value={String(numImages)}
              onChange={(event) => {
                const selectedCount = Number.parseInt(event.target.value, 10);
                if (canUseImageCount(selectedCount)) {
                  onNumImagesChange(selectedCount);
                }
              }}
              className="h-8 w-full rounded border border-border bg-background p-2 text-sm text-purple-300"
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
              <div className="mt-1 rounded border border-orange-200 bg-orange-50 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">
                    {getUpgradeMessage(numImages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUpgrade}
                    className="h-5 px-2 text-xs"
                  >
                    <Crown className="mr-1 h-2 w-2" />
                    Upgrade
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-yellow-400">
              {isEditMode ? "Output Ratio" : "Aspect Ratio"}
            </Label>
            <select
              value={aspectRatio}
              onChange={(event) => onAspectRatioChange(event.target.value)}
              className="h-8 w-full rounded border border-border bg-background p-2 text-sm text-purple-300"
            >
              {aspectRatioOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon ? `${option.icon} ` : ""}
                  {option.label}
                </option>
              ))}
            </select>

            {isEditMode ? (
              <div className="mt-1 rounded border border-blue-200/20 bg-blue-50/10 p-2 text-xs text-yellow-300/70">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 text-blue-400" />
                  <span className="text-blue-300">
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
                  <Label className="flex items-center gap-1 text-sm font-medium text-yellow-400">
                    <Shield className="h-4 w-4" />
                    Security
                  </Label>
                </div>
                <div
                  className="relative flex h-16 items-center justify-center rounded bg-muted/30 p-2"
                  ref={turnstileRef}
                >
                  {isTurnstileVerified ? (
                    <div className="flex items-center gap-2 py-2 text-center text-sm text-green-600">
                      <Shield className="h-4 w-4" />✅ Verified!
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
                <Label className="mb-2 flex items-center justify-center gap-1 text-sm font-medium text-yellow-400 md:justify-start">
                  <Shield className="h-4 w-4" />
                  Security
                </Label>
                <div className="flex h-16 items-center justify-center rounded bg-muted/30 p-2">
                  <div className="flex items-center gap-2 py-2 text-center text-sm text-green-600">
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
              <div className="text-center">
                <Label className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-yellow-400">
                  <Zap className="h-5 w-5" />
                  Generate Images
                </Label>
                <Button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="h-16 w-full text-base font-semibold md:w-56"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
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
                      className="text-sm"
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
