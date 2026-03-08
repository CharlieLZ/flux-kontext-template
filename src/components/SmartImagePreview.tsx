"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface SmartImagePreviewProps {
  url: string;
  alt: string;
  index: number;
  onRemove: () => void;
}

function getUrlType(url: string): "blob" | "http" | "data" | "unknown" {
  if (url.startsWith("blob:")) return "blob";
  if (url.startsWith("http://") || url.startsWith("https://")) return "http";
  if (url.startsWith("data:")) return "data";
  return "unknown";
}

function generateFallbackUrls(originalUrl: string): string[] {
  const urls = [originalUrl];
  const urlType = getUrlType(originalUrl);

  if (urlType === "blob" || urlType === "data") {
    return urls;
  }

  if (originalUrl.includes("r2.dev")) {
    const urlParts = originalUrl.split("/");
    const fileName = urlParts.slice(-2).join("/");
    const accountIdMatch = originalUrl.match(/pub-([a-f0-9]+)\.r2\.dev/);

    if (accountIdMatch) {
      const accountId = accountIdMatch[1];
      urls.push(
        `https://pub-${accountId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")}.r2.dev/${fileName}`,
      );
      if (process.env.R2_BUCKET_NAME) {
        urls.push(
          `https://${process.env.R2_BUCKET_NAME}.${accountId}.r2.cloudflarestorage.com/${fileName}`,
        );
      }
    }
  }

  if (originalUrl.includes("fal.media") || originalUrl.includes("fal.ai")) {
    urls.push(originalUrl.replace("fal.media", "storage.fal.ai"));
    urls.push(originalUrl.replace("storage.fal.ai", "fal.media"));
  }

  return [...new Set(urls)];
}

export function SmartImagePreview({
  url,
  alt,
  index,
  onRemove,
}: SmartImagePreviewProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = useCallback(async () => {
    const urlType = getUrlType(currentUrl);

    // 🔧 对于blob URL，直接标记为错误，不重试
    if (urlType === "blob") {
      console.warn(
        `⚠️ Blob URL failed to load for image ${index + 1}:`,
        currentUrl,
      );
      setHasError(true);
      setIsLoading(false);
      return;
    }

    if (retryCount < 3) {
      const fallbackUrls = generateFallbackUrls(url);
      const nextUrl = fallbackUrls[retryCount + 1];

      if (nextUrl && nextUrl !== currentUrl) {
        console.log(
          `🔄 Trying fallback URL ${retryCount + 1} for image ${index + 1}:`,
          nextUrl,
        );
        setCurrentUrl(nextUrl);
        setRetryCount((prev) => prev + 1);
        setIsLoading(true);
        setHasError(false);
        return;
      }
    }

    console.error(`❌ All fallback URLs failed for image ${index + 1}:`, url);
    setHasError(true);
    setIsLoading(false);
  }, [url, currentUrl, retryCount, index]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Successfully loaded image ${index + 1}:`, currentUrl);
    }
  }, [currentUrl, index]);

  // 🔧 当URL改变时重置状态
  useEffect(() => {
    console.log(`🔄 URL changed for image ${index + 1}:`, {
      newUrl: url.substring(0, 50) + "...",
    });
    setCurrentUrl(url);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [url, index]);

  // 🔧 添加调试信息
  useEffect(() => {
    console.log(`📁 SmartImagePreview state for image ${index + 1}:`, {
      url: url.substring(0, 50) + "...",
      currentUrl: currentUrl.substring(0, 50) + "...",
      isLoading,
      hasError,
      retryCount,
    });
  }, [url, currentUrl, isLoading, hasError, retryCount, index]);

  // 🔧 强制重新加载图片当URL改变时
  useEffect(() => {
    if (currentUrl) {
      console.log(
        `🖼️ Loading image ${index + 1}:`,
        currentUrl.substring(0, 50) + "...",
      );
      setIsLoading(true);
      setHasError(false);

      // 🔧 预加载图片以确保能正常显示
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Image ${index + 1} preloaded successfully`);
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        console.warn(`❌ Image ${index + 1} preload failed`);
        handleImageError();
      };
      img.src = currentUrl;
    }
  }, [currentUrl, index, handleImageError]);

  // 🔧 检查blob URL是否仍然有效
  useEffect(() => {
    const urlType = getUrlType(currentUrl);
    if (urlType === "blob") {
      // 🔧 对于blob URL，直接让浏览器处理，不进行额外检查
      // blob URL的有效性由浏览器内部管理
      console.log(
        `📁 Using blob URL for image ${index + 1}:`,
        currentUrl.substring(0, 50) + "...",
      );
    }
  }, [currentUrl, index]);

  return (
    <div className="relative">
      <div className="generator-thumbnail-frame h-20 w-full overflow-hidden rounded">
        {!hasError ? (
          <>
            <img
              src={currentUrl}
              alt={alt}
              className="w-full h-full object-cover transition-opacity duration-200"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: isLoading ? "none" : "block" }}
              loading="lazy"
            />
            {isLoading && (
              <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <div className="generator-thumbnail-error flex h-full w-full flex-col items-center justify-center rounded p-1 text-xs">
            <div className="text-center">
              <div className="mb-1">⚠️</div>
              <div>Load Error</div>
              <div className="text-xs opacity-70">
                {getUrlType(url) === "blob" ? "Local file" : `Ref ${index + 1}`}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 text-xs mt-1 p-0"
                onClick={() => {
                  setRetryCount(0);
                  setCurrentUrl(url);
                  setHasError(false);
                  setIsLoading(true);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="generator-icon-button generator-icon-button--danger absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
        onClick={onRemove}
      >
        <X className="h-2 w-2" />
      </Button>
    </div>
  );
}
