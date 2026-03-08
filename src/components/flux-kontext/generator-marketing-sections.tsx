"use client";

import {
  Edit,
  Image as ImageIcon,
  Layers,
  Lock,
  Settings,
  Upload,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GeneratorModelValue } from "@/components/flux-kontext/types";

interface GeneratorMarketingSectionsProps {
  selectedModel: GeneratorModelValue;
  availableModels: string[];
  onSelectModel: (value: GeneratorModelValue) => void;
  onUpgrade: () => void;
}

export function GeneratorMarketingSections({
  selectedModel,
  availableModels,
  onSelectModel,
  onUpgrade,
}: GeneratorMarketingSectionsProps) {
  return (
    <>
      <section className="mt-8 rounded-lg bg-muted/30 px-6 py-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-3xl font-bold">
            How to Use Our AI Platform
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                1. Upload Your Image
              </h3>
              <p className="text-muted-foreground">
                Upload your image for character consistency and style analysis.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Edit className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                2. Write Editing Prompt
              </h3>
              <p className="text-muted-foreground">
                Describe your edits. The AI handles character consistency and
                style reference.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                3. Generate with AI Models
              </h3>
              <p className="text-muted-foreground">
                Choose Pro model (16 credits) or Max model (32 credits) for
                generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 py-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Key AI Features
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mb-2 font-semibold">Character Consistency</h3>
              <p className="text-sm text-muted-foreground">
                Maintain character identity across different scenes and poses
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Settings className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="mb-2 font-semibold">Smart Editing</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent image modifications with AI-powered precision
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <ImageIcon className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="mb-2 font-semibold">Style Reference</h3>
              <p className="text-sm text-muted-foreground">
                Generate new scenes in existing styles with consistency
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="mb-2 font-semibold">Interactive Speed</h3>
              <p className="text-sm text-muted-foreground">
                Fast processing with minimal latency for quick iterations
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-8 py-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold">
                What is Flux Kontext?
              </h3>
              <p className="text-muted-foreground">
                Our platform is a suite of generative flow matching models for
                image generation and editing. Unlike traditional text-to-image
                models, it understands both text and images as input for true
                in-context generation.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold">
                What makes this platform special?
              </h3>
              <p className="text-muted-foreground">
                The system offers four key capabilities: character consistency
                across scenes, smart editing with AI precision, style reference
                for new scenes, and interactive speed with minimal latency.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold">
                Which model should I choose?
              </h3>
              <p className="text-muted-foreground">
                Pro model (16 credits) excels at fast iterative editing while
                maintaining character consistency. Max model (32 credits)
                provides maximum performance with improved prompt adherence and
                typography.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold">
                How does the platform achieve character consistency?
              </h3>
              <p className="text-muted-foreground">
                The AI preserves elements across scenes by understanding visual
                context. It builds upon previous edits while maintaining
                characters, identities, styles, and features consistent.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold">
                How does smart editing work?
              </h3>
              <p className="text-muted-foreground">
                Smart editing uses AI to make intelligent modifications while
                preserving image quality. This capability enables precise
                enhancements while maintaining overall composition.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold">
                Can the platform handle style reference?
              </h3>
              <p className="text-muted-foreground">
                Yes, the AI generates new scenes in existing styles. It analyzes
                style elements from reference images to create consistent visual
                aesthetics across generations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-8 py-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            AI Model Comparison
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="border-2 border-primary/20 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Pro Model</h3>
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700"
                >
                  16 Credits
                </Badge>
              </div>
              <p className="mb-6 text-muted-foreground">
                Perfect for fast iterative editing and character consistency
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Fast processing speed</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Smart editing capabilities</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Style reference support</span>
                </li>
              </ul>
              <Button
                variant={selectedModel === "pro" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  if (!availableModels.includes("pro")) {
                    onUpgrade();
                    return;
                  }
                  onSelectModel("pro");
                }}
              >
                {!availableModels.includes("pro") ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Upgrade Required
                  </>
                ) : selectedModel === "pro" ? (
                  "Selected"
                ) : (
                  "Select Pro Model"
                )}
              </Button>
            </Card>

            <Card className="border-2 border-purple-500/20 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Max Model</h3>
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-purple-700"
                >
                  32 Credits
                </Badge>
              </div>
              <p className="mb-6 text-muted-foreground">
                Maximum performance with enhanced prompt adherence
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Highest quality output</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Advanced typography</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Superior prompt adherence</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Professional-grade results</span>
                </li>
              </ul>
              <Button
                variant={selectedModel === "max" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  if (!availableModels.includes("max")) {
                    onUpgrade();
                    return;
                  }
                  onSelectModel("max");
                }}
              >
                {!availableModels.includes("max") ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Upgrade Required
                  </>
                ) : selectedModel === "max" ? (
                  "Selected"
                ) : (
                  "Select Max Model"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
