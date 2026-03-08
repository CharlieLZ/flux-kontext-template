"use client";

import { useId } from "react";
import type { CSSProperties } from "react";
import { Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  GeneratorModelOption,
  GeneratorModelValue,
} from "@/components/flux-kontext/types";
import { UserType } from "@/lib/user-tiers";

interface GeneratorConfigCardProps {
  isEditMode: boolean;
  selectedModel: GeneratorModelValue;
  onSelectModel: (value: GeneratorModelValue) => void;
  currentModelInfo?: GeneratorModelOption;
  availableContextModels: GeneratorModelOption[];
  userType: UserType;
  guidanceScale: number;
  onGuidanceScaleChange: (value: number) => void;
  safetyTolerance: string;
  onSafetyToleranceChange: (value: string) => void;
  seed?: number;
  onSeedChange: (value: number | undefined) => void;
  onRandomizeSeed: () => void;
  outputFormat: string;
  onOutputFormatChange: (value: string) => void;
}

export function GeneratorConfigCard({
  isEditMode,
  selectedModel,
  onSelectModel,
  currentModelInfo,
  availableContextModels,
  userType,
  guidanceScale,
  onGuidanceScaleChange,
  safetyTolerance,
  onSafetyToleranceChange,
  seed,
  onSeedChange,
  onRandomizeSeed,
  outputFormat,
  onOutputFormatChange,
}: GeneratorConfigCardProps) {
  const modelSelectId = useId();
  const guidanceScaleId = useId();
  const safetyToleranceId = useId();
  const seedId = useId();
  const outputFormatId = useId();

  return (
    <Card
      className="generator-panel generator-reveal p-5 lg:p-6"
      style={{ "--generator-delay": "40ms" } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="text-left">
          <span className="generator-kicker">Cinematic darkroom workspace</span>
          <h1 className="generator-heading mt-4 text-3xl font-semibold sm:text-4xl">
            Flux Kontext Studio
          </h1>
          <p className="generator-subheading mt-3 max-w-2xl text-sm sm:text-base">
            A refined control surface for image generation, reference-guided
            editing, and faster iteration without the neon-purple dashboard
            look.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="generator-chip generator-chip--warm text-[11px]"
            >
              Character Consistency
            </Badge>
            <Badge variant="outline" className="generator-chip text-[11px]">
              Style Transfer
            </Badge>
            <Badge variant="outline" className="generator-chip text-[11px]">
              Multi-Image Support
            </Badge>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label
              htmlFor={modelSelectId}
              className="generator-label text-sm font-medium"
            >
              {isEditMode ? "Image Editing Model" : "Text to Image Model"}
            </Label>
            {currentModelInfo?.recommended ? (
              <Badge
                variant="outline"
                className="generator-chip generator-chip--success text-[11px]"
              >
                Recommended
              </Badge>
            ) : null}
          </div>

          <select
            id={modelSelectId}
            value={selectedModel}
            onChange={(event) => {
              const nextValue = event.target.value as GeneratorModelValue;
              onSelectModel(nextValue === "max-multi" ? "max" : nextValue);
            }}
            aria-label={
              isEditMode
                ? "Select image editing model"
                : "Select text to image model"
            }
            className="generator-control w-full rounded-xl p-2.5 text-sm"
          >
            {availableContextModels.map((model) => (
              <option
                key={model.value}
                value={model.value}
                disabled={!model.available}
              >
                {model.label}
                {model.recommended ? " ⭐" : ""}
                {!model.available ? " (Upgrade required)" : ""}
              </option>
            ))}
          </select>

          {currentModelInfo ? (
            <div className="generator-note mt-3 border-white/5 bg-white/[0.025] p-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="generator-label font-medium">Credits:</span>
                  <span className="generator-copy ml-1">
                    {currentModelInfo.credits}
                  </span>
                </div>
                <div>
                  <span className="generator-label font-medium">Speed:</span>
                  <span className="generator-copy ml-1">
                    {currentModelInfo.speed}
                  </span>
                </div>
                <div>
                  <span className="generator-label font-medium">Quality:</span>
                  <span className="generator-copy ml-1">
                    {currentModelInfo.quality}
                  </span>
                </div>
                <div>
                  <span className="generator-label font-medium">Type:</span>
                  <span className="generator-copy ml-1">
                    {isEditMode ? "Editing" : "Generation"}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <p className="generator-subheading mb-2 text-xs">
                  {currentModelInfo.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentModelInfo.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="generator-chip px-1.5 py-0 text-[11px]"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {currentModelInfo && !currentModelInfo.available ? (
            <div className="generator-note generator-note--warning mt-3 text-sm">
              <div className="flex items-center justify-between">
                <span>
                  {userType === UserType.ANONYMOUS
                    ? "Sign up to unlock this model"
                    : "Upgrade Required"}
                </span>
              </div>
            </div>
          ) : null}

          {isEditMode && currentModelInfo ? (
            <div className="generator-note generator-note--info mt-3 text-sm">
              <span className="text-xs">
                Multi-image editing detected. Using experimental multi-image
                processing.
              </span>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="generator-label mb-2 flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Advanced Settings
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor={guidanceScaleId}
                className="generator-label mb-1 block text-xs font-medium"
              >
                Strength: {guidanceScale}
              </Label>
              <div className="space-y-1">
                <input
                  id={guidanceScaleId}
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(event) =>
                    onGuidanceScaleChange(Number.parseFloat(event.target.value))
                  }
                  className="generator-range h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                />
                <div className="generator-muted flex justify-between text-xs">
                  <span>Creative</span>
                  <span>Strict</span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor={safetyToleranceId}
                className="generator-label mb-1 block text-xs font-medium"
              >
                Safety: {safetyTolerance}
              </Label>
              <div className="space-y-1">
                <input
                  id={safetyToleranceId}
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={Number.parseInt(safetyTolerance, 10)}
                  onChange={(event) =>
                    onSafetyToleranceChange(event.target.value)
                  }
                  className="generator-range h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                />
                <div className="generator-muted flex justify-between text-xs">
                  <span>Strict</span>
                  <span>Permissive</span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor={seedId}
                className="generator-label mb-1 block text-xs font-medium"
              >
                Seed
              </Label>
              <div className="flex gap-1">
                <Input
                  id={seedId}
                  type="number"
                  placeholder="Random"
                  value={seed || ""}
                  inputMode="numeric"
                  autoComplete="off"
                  onChange={(event) =>
                    onSeedChange(
                      event.target.value
                        ? Number.parseInt(event.target.value, 10)
                        : undefined,
                    )
                  }
                  className="generator-control h-9 flex-1 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRandomizeSeed}
                  aria-label="Generate random seed"
                  title="Generate random seed"
                  className="generator-secondary-button h-9 w-9 p-0"
                >
                  🎲
                </Button>
              </div>
            </div>

            <div>
              <Label
                htmlFor={outputFormatId}
                className="generator-label mb-1 block text-xs font-medium"
              >
                Format
              </Label>
              <select
                id={outputFormatId}
                value={outputFormat}
                onChange={(event) => onOutputFormatChange(event.target.value)}
                aria-label="Select output format"
                className="generator-control h-9 w-full rounded-xl px-3 text-xs"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
