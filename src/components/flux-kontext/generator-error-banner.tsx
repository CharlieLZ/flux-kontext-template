"use client";

import { AlertCircle, Crown, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface GeneratorErrorBannerProps {
  error: string;
  isGenerating: boolean;
  showRetry: boolean;
  showUpgrade: boolean;
  onRetry: () => void;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function GeneratorErrorBanner({
  error,
  isGenerating,
  showRetry,
  showUpgrade,
  onRetry,
  onUpgrade,
  onDismiss,
}: GeneratorErrorBannerProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
      <span className="flex-1 text-destructive">{error}</span>
      <div className="flex gap-2">
        {showUpgrade ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            className="ml-2"
          >
            <Crown className="mr-1 h-3 w-3" />
            Upgrade Now
          </Button>
        ) : null}
        {showRetry ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isGenerating}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Retry
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
