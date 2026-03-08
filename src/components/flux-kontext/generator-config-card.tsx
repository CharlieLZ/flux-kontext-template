"use client";

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
  return (
    <Card className="p-3">
      <div className="space-y-3">
        <div className="mb-4 text-center">
          <h1 className="mb-1 text-2xl font-bold text-yellow-400 sm:text-3xl">
            Flux Kontext AI Generator
          </h1>
          <p className="mb-2 text-base text-yellow-300/80">
            Create and edit professional images with advanced AI technology
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-xs text-primary"
            >
              Character Consistency
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-xs text-primary"
            >
              Style Transfer
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-xs text-primary"
            >
              Multi-Image Support
            </Badge>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label className="text-sm font-medium text-yellow-400">
              {isEditMode ? "Image Editing Model" : "Text to Image Model"}
            </Label>
            {currentModelInfo?.recommended ? (
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-xs text-green-700"
              >
                Recommended
              </Badge>
            ) : null}
          </div>

          <select
            value={selectedModel}
            onChange={(event) => {
              const nextValue = event.target.value as GeneratorModelValue;
              onSelectModel(nextValue === "max-multi" ? "max" : nextValue);
            }}
            className="w-full rounded border border-border bg-background p-2 text-sm text-purple-300"
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
            <div className="mt-2 rounded-lg border border-border bg-muted/20 p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-yellow-400">Credits:</span>
                  <span className="ml-1 text-purple-300">
                    {currentModelInfo.credits}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-yellow-400">Speed:</span>
                  <span className="ml-1 text-purple-300">
                    {currentModelInfo.speed}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-yellow-400">Quality:</span>
                  <span className="ml-1 text-purple-300">
                    {currentModelInfo.quality}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-yellow-400">Type:</span>
                  <span className="ml-1 text-purple-300">
                    {isEditMode ? "Editing" : "Generation"}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <p className="mb-1 text-xs text-yellow-300/80">
                  {currentModelInfo.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentModelInfo.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-primary/20 bg-primary/5 px-1 py-0 text-xs text-primary"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {currentModelInfo && !currentModelInfo.available ? (
            <div className="mt-2 rounded border border-orange-200 bg-orange-50 p-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-orange-700">
                  {userType === UserType.ANONYMOUS
                    ? "Sign up to unlock this model"
                    : "Upgrade Required"}
                </span>
              </div>
            </div>
          ) : null}

          {isEditMode && currentModelInfo ? (
            <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2 text-sm">
              <span className="text-xs text-blue-700">
                Multi-image editing detected. Using experimental multi-image
                processing.
              </span>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-400">
            <Settings className="h-4 w-4" />
            Advanced Settings
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs font-medium text-yellow-400">
                Strength: {guidanceScale}
              </Label>
              <div className="space-y-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(event) =>
                    onGuidanceScaleChange(Number.parseFloat(event.target.value))
                  }
                  className="slider h-1 w-full cursor-pointer appearance-none rounded-lg bg-muted"
                />
                <div className="flex justify-between text-xs text-yellow-300/60">
                  <span>Creative</span>
                  <span>Strict</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium text-yellow-400">
                Safety: {safetyTolerance}
              </Label>
              <div className="space-y-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={Number.parseInt(safetyTolerance, 10)}
                  onChange={(event) =>
                    onSafetyToleranceChange(event.target.value)
                  }
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-muted"
                />
                <div className="flex justify-between text-xs text-yellow-300/60">
                  <span>Strict</span>
                  <span>Permissive</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium text-yellow-400">
                Seed
              </Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Random"
                  value={seed || ""}
                  onChange={(event) =>
                    onSeedChange(
                      event.target.value
                        ? Number.parseInt(event.target.value, 10)
                        : undefined,
                    )
                  }
                  className="h-7 flex-1 text-xs text-purple-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRandomizeSeed}
                  title="Generate random seed"
                  className="h-7 w-7 p-0"
                >
                  🎲
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium text-yellow-400">
                Format
              </Label>
              <select
                value={outputFormat}
                onChange={(event) => onOutputFormatChange(event.target.value)}
                className="h-7 w-full rounded border border-border bg-background p-1 text-xs text-purple-300"
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
