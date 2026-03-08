"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  buildContextModels,
  getActionForModel,
  getEstimatedGenerationTime,
  getRecommendedModelValue,
} from "@/components/flux-kontext/model-config";
import type {
  GeneratedImage,
  GenerationRequest,
  GeneratorModelValue,
} from "@/components/flux-kontext/types";
import { GeneratorConfigCard } from "@/components/flux-kontext/generator-config-card";
import { GeneratorErrorBanner } from "@/components/flux-kontext/generator-error-banner";
import { GeneratedImagesSection } from "@/components/flux-kontext/generated-images-section";
import { GeneratorMarketingSections } from "@/components/flux-kontext/generator-marketing-sections";
import { GeneratorWorkspaceCard } from "@/components/flux-kontext/generator-workspace-card";
import { getEnhancedPrompt } from "@/components/flux-kontext/prompt-enhancer";

// ûֲϵ
import {
  UserType,
  getUserLimits,
  getImageCountOptions,
  getAvailableModels,
  getAvailableAspectRatios,
  hasFeature,
  needsUpgrade,
} from "@/lib/user-tiers";

export function FluxKontextGenerator() {
  const router = useRouter();
  const { data: session } = useSession();

  // ûֲ̬
  const [userType, setUserType] = useState<UserType>(UserType.ANONYMOUS);
  const [userLimits, setUserLimits] = useState(
    getUserLimits(UserType.ANONYMOUS),
  );

  // 文本生成图像状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState("");

  // Turnstile验证状态
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const [, setTurnstileError] = useState("");
  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(false);

  // ?? 文本生成图像状态

  // 文本生成图像状态
  const [textPrompt, setTextPrompt] = useState("");
  const [selectedModel, setSelectedModel] =
    useState<GeneratorModelValue>("pro");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [numImages, setNumImages] = useState(1);
  const [safetyTolerance, setSafetyTolerance] = useState("2");
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [seed, setSeed] = useState<number | undefined>(undefined);

  // 文本编辑状态
  const [editPrompt, setEditPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // ?? 文本生成图像汾ļ

  // 文本生成图像状态
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(
    null,
  );

  // 复制成功状态
  const [copySuccess, setCopySuccess] = useState("");

  // 生成图像的倒计时
  const [countdown, setCountdown] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(6); // 预估6秒

  // 多文件输入引用
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  // ?? 自动检测用户类型
  const detectUserType = useCallback((): UserType => {
    // 根据session判断用户是否登录
    if (session?.user?.email) {
      // ?? 打印用户登录信息
      if (process.env.NODE_ENV === "development") {
        console.log("?? User logged in:", session.user.email);
      }
      // 判断是否为付费用户
      if (
        (session.user as any)?.isPremium ||
        (session.user as any)?.subscription?.status === "active"
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log("?? Detected as PREMIUM user");
        }
        return UserType.PREMIUM;
      }
      // 未登录用户
      if (process.env.NODE_ENV === "development") {
        console.log("?? Detected as REGISTERED user");
      }
      return UserType.REGISTERED;
    }

    // 未登录用户
    if (process.env.NODE_ENV === "development") {
      console.log("?? Detected as ANONYMOUS user");
    }
    return UserType.ANONYMOUS;
  }, [session]);

  // 初始化用户类型 - ?? 自动检测用户类型
  useEffect(() => {
    const currentUserType = detectUserType();
    setUserType(currentUserType);
    setUserLimits(getUserLimits(currentUserType));

    // ?? 打印用户状态检测信息
    if (process.env.NODE_ENV === "development") {
      console.log("?? User status detection:", {
        session: !!session,
        email: session?.user?.email,
        userType: currentUserType,
        maxImages: getUserLimits(currentUserType).maxImages,
        requiresTurnstile: getUserLimits(currentUserType).requiresTurnstile,
      });
    }

    // 判断Turnstile是否启用
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === "true";
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    setIsTurnstileEnabled(isEnabled && !!siteKey);

    // ?? 打印Turnstile配置信息
    if (process.env.NODE_ENV === "development") {
      console.log("?? Turnstile config:", {
        isEnabled,
        hasSiteKey: !!siteKey,
        isTurnstileEnabled: isEnabled && !!siteKey,
      });
    }

    // 用户选择的模型
    const availableModels = getAvailableModels(currentUserType);
    if (availableModels.includes("pro")) {
      setSelectedModel("pro"); // ?? 默认使用PRO模型
    } else {
      setSelectedModel("max");
    }
  }, [session, detectUserType]); // ?? 依赖session

  // 动态获取选择
  const imageCountOptions = getImageCountOptions(userType);
  const availableModels = getAvailableModels(userType);
  const aspectRatioOptions = getAvailableAspectRatios(userType);

  // ?? 自动检测用户状态 - 仅在用户类型变化时触发一次
  useEffect(() => {
    // ?? 打印用户状态初始化信息
    if (process.env.NODE_ENV === "development") {
      console.log("?? User status initialized:", {
        userType,
        maxImages: userLimits.maxImages,
        availableModels: availableModels.length,
        session: !!session,
      });
    }
  }, [availableModels.length, session, userLimits.maxImages, userType]); // ?? 仅依赖用户态摘要

  // ?? 删除重复请求的useEffect
  // useEffect(() => {
  //   console.log('?? Current user status details:', {...})
  // }, [...]) // 删除

  // ?? 图像编辑状态 - 仅在图像变化时触发一次
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("?? Image state changed:", {
        uploadedImagesCount: uploadedImages.length,
        uploadedFilesCount: uploadedFiles.length,
      });
    }
  }, [uploadedImages.length, uploadedFiles.length]); // ?? 仅依赖图像变化

  // ?? 用户状态 - useEffect仅在用户类型变化时触发一次
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("?? Current user status details:", {
        userType,
        maxImages: userLimits.maxImages,
        imageCountOptions: imageCountOptions.length,
        aspectRatioOptions: aspectRatioOptions.length,
        availableModels: availableModels.length,
        session: !!session,
        userEmail: session?.user?.email,
        uploadedImagesCount: uploadedImages.length,
        uploadedFilesCount: uploadedFiles.length,
      });
    }
  }, [
    userType,
    userLimits.maxImages,
    imageCountOptions.length,
    aspectRatioOptions.length,
    availableModels.length,
    session,
    uploadedImages.length,
    uploadedFiles.length,
  ]); // ?? 仅依赖用户类型和图像变化

  // 用户是否可以使用图像数量
  const canUseImageCount = useCallback(
    (count: number): boolean => {
      const canUse = count <= userLimits.maxImages;
      // ?? 打印检查图像数量权限信息
      // console.log(`?? Check image count permission: ${count} images <= ${userLimits.maxImages} images = ${canUse}`)
      return canUse;
    },
    [userLimits.maxImages],
  );

  // 获取升级信息
  const getUpgradeMessage = (count: number): string => {
    if (count <= userLimits.maxImages) return "";

    if (userType === UserType.ANONYMOUS) {
      return "Sign up to generate up to 4 images";
    } else if (userType === UserType.REGISTERED) {
      return "Upgrade to Premium to generate up to 12 images";
    }
    return "";
  };

  // ?? 处理本地文件预览
  const handleLocalFilePreview = useCallback((file: File): string => {
    // 生成预览URL
    const previewUrl = URL.createObjectURL(file);
    console.log(`?? Created local preview URL for: ${file.name}`);
    return previewUrl;
  }, []);

  // ?? 处理文件上传
  const handleFileUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/flux-kontext", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      let errorData: any = {};

      try {
        // 全量JSON
        const responseText = await response.text();
        if (responseText.trim()) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.warn(
          "?? Failed to parse upload error response as JSON:",
          parseError,
        );
        errorData = {
          message: `Upload failed (${response.status}): ${response.statusText}`,
          error: "JSON parse failed",
        };
      }

      throw new Error(errorData.message || "File upload failed");
    }

    let data: any = {};
    try {
      // 全量JSON
      const responseText = await response.text();
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error(
        "? Failed to parse upload success response as JSON:",
        parseError,
      );
      throw new Error("Invalid response format from upload server");
    }

    return data.url;
  }, []);

  // ?? 处理多图像上传
  const handleMultiImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // ?? 处理input的value，确保选择的是相同的文件
      if (event.target) {
        event.target.value = "";
      }

      if (files.length === 0) return;

      try {
        // ?? 等待预览
        const previewUrls = files.map((file) => handleLocalFilePreview(file));

        // 设置图像状态，显示预览
        setUploadedFiles((prev) => [...prev, ...files]);
        setUploadedImages((prev) => [...prev, ...previewUrls]);
        setError("");

        console.log(`?? Added ${files.length} files for local preview`);

        // ?? 开始立即上传到R2存储
        console.log(`?? Starting immediate upload to R2 storage...`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            console.log(
              `?? Uploading file ${i + 1}/${files.length}: ${file.name}`,
            );
            const r2Url = await handleFileUpload(file);
            console.log(`? R2 Upload successful for ${file.name}:`);
            console.log(`?? R2 URL: ${r2Url}`);

            // 检查R2 URL是否可访问
            try {
              const testResponse = await fetch(r2Url, {
                method: "HEAD",
                mode: "cors",
              });
              console.log(`?? R2 URL test result:`, {
                url: r2Url,
                status: testResponse.status,
                ok: testResponse.ok,
              });

              if (testResponse.ok) {
                console.log(`? R2 URL is publicly accessible: ${r2Url}`);

                // 替换预览URL为R2 URL
                setUploadedImages((prev) => {
                  const newImages = [...prev];
                  const targetIndex = prev.length - files.length + i;
                  if (targetIndex >= 0 && targetIndex < newImages.length) {
                    if (newImages[targetIndex].startsWith("blob:")) {
                      URL.revokeObjectURL(newImages[targetIndex]);
                    }
                    newImages[targetIndex] = r2Url;
                    console.log(
                      `?? Replaced blob URL with R2 URL at index ${targetIndex}`,
                    );
                  }
                  return newImages;
                });
              } else {
                console.warn(
                  `?? R2 URL not accessible (${testResponse.status}): ${r2Url}`,
                );
              }
            } catch (testError) {
              console.warn(`?? R2 URL accessibility test failed:`, testError);
              console.log(`?? R2 URL (untested): ${r2Url}`);
            }
          } catch (uploadError: any) {
            console.error(
              `? R2 upload failed for ${file.name}:`,
              uploadError.message,
            );
          }
        }
      } catch (error: any) {
        setError(error.message);
      }
    },
    [handleLocalFilePreview, handleFileUpload],
  );

  // ?? 处理拖放
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length === 0) return;

      try {
        // ?? 等待预览
        const previewUrls = files.map((file) => handleLocalFilePreview(file));

        console.log(`?? About to update state with ${files.length} files:`, {
          fileNames: files.map((f) => f.name),
          previewUrls: previewUrls.map((url) => url.substring(0, 50) + "..."),
        });

        // 设置图像状态，显示预览
        setUploadedFiles((prev) => {
          const newFiles = [...prev, ...files];
          console.log(
            `?? Updated uploadedFiles: ${prev.length} -> ${newFiles.length}`,
          );
          return newFiles;
        });
        setUploadedImages((prev) => {
          const newImages = [...prev, ...previewUrls];
          console.log(
            `?? Updated uploadedImages: ${prev.length} -> ${newImages.length}`,
          );
          return newImages;
        });
        setError("");

        console.log(`?? Dropped ${files.length} files for local preview`);

        // ?? 开始立即上传到R2存储
        console.log(`?? Starting immediate upload to R2 storage...`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            console.log(
              `?? Uploading file ${i + 1}/${files.length}: ${file.name}`,
            );
            const r2Url = await handleFileUpload(file);
            console.log(`? R2 Upload successful for ${file.name}:`);
            console.log(`?? R2 URL: ${r2Url}`);
            console.log(`?? Testing R2 URL accessibility...`);

            // 检查R2 URL是否可访问
            try {
              const testResponse = await fetch(r2Url, {
                method: "HEAD",
                mode: "cors",
              });
              console.log(`?? R2 URL test result:`, {
                url: r2Url,
                status: testResponse.status,
                statusText: testResponse.statusText,
                ok: testResponse.ok,
                headers: {
                  "content-type": testResponse.headers.get("content-type"),
                  "content-length": testResponse.headers.get("content-length"),
                  "access-control-allow-origin": testResponse.headers.get(
                    "access-control-allow-origin",
                  ),
                },
              });

              if (testResponse.ok) {
                console.log(`? R2 URL is publicly accessible: ${r2Url}`);

                // ?? 替换预览URL为R2 URL
                setUploadedImages((prev) => {
                  const newImages = [...prev];
                  const targetIndex = prev.length - files.length + i; // 确定索引
                  if (targetIndex >= 0 && targetIndex < newImages.length) {
                    // 获取blob URL
                    if (newImages[targetIndex].startsWith("blob:")) {
                      URL.revokeObjectURL(newImages[targetIndex]);
                    }
                    newImages[targetIndex] = r2Url;
                    console.log(
                      `?? Replaced blob URL with R2 URL at index ${targetIndex}`,
                    );
                  }
                  return newImages;
                });
              } else {
                console.warn(
                  `?? R2 URL not accessible (${testResponse.status}): ${r2Url}`,
                );
              }
            } catch (testError) {
              console.warn(`?? R2 URL accessibility test failed:`, testError);
              console.log(`?? R2 URL (untested): ${r2Url}`);
            }
          } catch (uploadError: any) {
            console.error(
              `? R2 upload failed for ${file.name}:`,
              uploadError.message,
            );
            // 使用默认预览URL
          }
        }
      } catch (error: any) {
        setError(error.message);
      }
    },
    [handleLocalFilePreview, handleFileUpload],
  );

  // ?? 处理粘贴
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith("image/"));

      if (imageItems.length === 0) return;

      e.preventDefault();

      try {
        const files: File[] = [];
        const previewUrls: string[] = [];

        // ?? 等待预览
        imageItems.forEach((item) => {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
            previewUrls.push(handleLocalFilePreview(file));
          }
        });

        // 设置图像状态，显示预览
        setUploadedFiles((prev) => [...prev, ...files]);
        setUploadedImages((prev) => [...prev, ...previewUrls]);
        setError("");

        console.log(`?? Pasted ${files.length} files for local preview`);

        // ?? 开始立即上传到R2存储
        console.log(`?? Starting immediate upload to R2 storage...`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            console.log(
              `?? Uploading file ${i + 1}/${files.length}: ${file.name}`,
            );
            const r2Url = await handleFileUpload(file);
            console.log(`? R2 Upload successful for ${file.name}:`);
            console.log(`?? R2 URL: ${r2Url}`);

            // 检查R2 URL是否可访问
            try {
              const testResponse = await fetch(r2Url, {
                method: "HEAD",
                mode: "cors",
              });
              console.log(`?? R2 URL test result:`, {
                url: r2Url,
                status: testResponse.status,
                ok: testResponse.ok,
              });

              if (testResponse.ok) {
                console.log(`? R2 URL is publicly accessible: ${r2Url}`);

                // 替换预览URL为R2 URL
                setUploadedImages((prev) => {
                  const newImages = [...prev];
                  const targetIndex = prev.length - files.length + i;
                  if (targetIndex >= 0 && targetIndex < newImages.length) {
                    if (newImages[targetIndex].startsWith("blob:")) {
                      URL.revokeObjectURL(newImages[targetIndex]);
                    }
                    newImages[targetIndex] = r2Url;
                    console.log(
                      `?? Replaced blob URL with R2 URL at index ${targetIndex}`,
                    );
                  }
                  return newImages;
                });
              } else {
                console.warn(
                  `?? R2 URL not accessible (${testResponse.status}): ${r2Url}`,
                );
              }
            } catch (testError) {
              console.warn(`?? R2 URL accessibility test failed:`, testError);
              console.log(`?? R2 URL (untested): ${r2Url}`);
            }
          } catch (uploadError: any) {
            console.error(
              `? R2 upload failed for ${file.name}:`,
              uploadError.message,
            );
          }
        }
      } catch (error: any) {
        setError(error.message);
      }
    },
    [handleLocalFilePreview, handleFileUpload],
  );

  // Turnstile验证
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setIsTurnstileVerified(true);
    setTurnstileError("");
    console.log("Turnstile verification successful, token:", token);
  }, []);

  const handleTurnstileError = useCallback((error: string) => {
    setTurnstileToken("");
    setIsTurnstileVerified(false);
    setTurnstileError(error);
    console.error("Turnstile verification failed:", error);

    // ?? Զˢ߼
    if (
      error.includes("600010") ||
      error.includes("timeout") ||
      error.includes("network")
    ) {
      console.log(
        "?? Detected network/timeout error, auto-refreshing in 3 seconds...",
      );
      setTurnstileError("Network error detected, auto-refreshing...");

      setTimeout(() => {
        console.log("?? Auto-refreshing Turnstile widget...");
        setTurnstileError("");
        setIsTurnstileVerified(false);
        setTurnstileToken("");

        // Turnstile widget
        if (turnstileRef.current && (turnstileRef.current as any).reset) {
          (turnstileRef.current as any).reset();
        }
      }, 3000);
    }
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
    setIsTurnstileVerified(false);
    setTurnstileError("Verification expired, auto-refreshing...");
    console.log("Turnstile verification expired, will auto-refresh");

    // 2ϢԶˢЧ
    setTimeout(() => {
      setTurnstileError("");
    }, 2000);
  }, []);

  // 是否需要Turnstile验证 - 🔧 修复智能验证逻辑
  const checkTurnstileRequired = useCallback(() => {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === "true";
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // ֻ5%
    if (process.env.NODE_ENV === "development" && Math.random() < 0.05) {
      console.log("?? Turnstile check:", {
        isEnabled,
        hasSiteKey: !!siteKey,
        userType,
        requiresTurnstile: userLimits.requiresTurnstile,
        isTurnstileEnabled,
        isTurnstileVerified,
        hasToken: !!turnstileToken,
      });
    }

    // Turnstileδûȱãֱӷfalse
    if (!isEnabled || !siteKey) {
      if (process.env.NODE_ENV === "development" && Math.random() < 0.05) {
        console.log("?? Turnstile disabled: missing config");
      }
      return false;
    }

    // ûȷ֤
    if (userLimits.requiresTurnstile === false) {
      // ûȷ֤
      if (process.env.NODE_ENV === "development" && Math.random() < 0.05) {
        console.log("?? Turnstile disabled: premium user");
      }
      return false;
    }

    if (userLimits.requiresTurnstile === "smart") {
      // עû֤֤ͲҪ֤
      if (isTurnstileVerified && turnstileToken) {
        if (process.env.NODE_ENV === "development" && Math.random() < 0.05) {
          console.log(
            "?? Turnstile smart mode: already verified, no need to verify again",
          );
        }
        return false;
      } else {
        if (process.env.NODE_ENV === "development" && Math.random() < 0.05) {
          console.log("?? Turnstile smart mode: verification required");
        }
        return true;
      }
    }

    // ûҪ֤
    if (process.env.NODE_ENV === "development" && Math.random() < 0.05) {
      console.log("?? Turnstile required: anonymous user");
    }
    return userLimits.requiresTurnstile === true;
  }, [
    userLimits.requiresTurnstile,
    userType,
    isTurnstileEnabled,
    isTurnstileVerified,
    turnstileToken,
  ]);

  // 验证Turnstile token（如果启用）- 🔧 修复智能验证逻辑
  const validateTurnstile = useCallback(async (): Promise<boolean> => {
    const needsVerification = checkTurnstileRequired();

    if (!needsVerification) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔧 Turnstile verification not required for this user type or already verified",
        );
      }
      return true; // 不需要验证，直接通过
    }

    // 🔧 修改：智能验证模式下，如果已经验证过就不需要再验证
    if (
      userLimits.requiresTurnstile === "smart" &&
      isTurnstileVerified &&
      turnstileToken
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Turnstile smart mode: using existing verification");
      }
      return true;
    }

    // 如果需要验证但没有token或未验证，需要完成验证
    if (!isTurnstileVerified || !turnstileToken) {
      console.log("❌ Turnstile verification required but not completed");
      setError("Please complete human verification to continue");
      return false;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Turnstile verification passed");
    }
    return true;
  }, [
    checkTurnstileRequired,
    isTurnstileVerified,
    turnstileToken,
    userLimits.requiresTurnstile,
  ]);

  // ͼƬ֧4ŵ
  const batchGenerate = useCallback(async (request: GenerationRequest) => {
    const maxPerBatch = 4; // FAL API֧4
    const totalImages = request.num_images || 1;
    const batches = Math.ceil(totalImages / maxPerBatch);

    let allImages: any[] = [];

    for (let i = 0; i < batches; i++) {
      const batchSize = Math.min(maxPerBatch, totalImages - i * maxPerBatch);
      const batchRequest = { ...request, num_images: batchSize };

      try {
        const response = await fetch("/api/flux-kontext", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchRequest),
        });

        if (!response.ok) {
          let errorData: any = {};

          try {
            // ȫJSON
            const responseText = await response.text();
            if (responseText.trim()) {
              errorData = JSON.parse(responseText);
            }
          } catch (parseError) {
            console.warn(
              "?? Failed to parse error response as JSON:",
              parseError,
            );
            errorData = {
              message: `Server error (${response.status}): ${response.statusText}`,
              error: "JSON parse failed",
            };
          }

          // ͳһTurnstile֤ʧܴ
          if (
            errorData.code === "TURNSTILE_VERIFICATION_FAILED" ||
            errorData.code === "TURNSTILE_RETRY_REQUIRED" ||
            errorData.error?.includes("Human verification")
          ) {
            console.log(
              "?? Detected Turnstile verification failed, auto reset verification state",
            );
            setIsTurnstileVerified(false);
            setTurnstileToken("");
            setTurnstileError("Verification failed, please verify again");

            // Turnstile widget
            if (turnstileRef.current && (turnstileRef.current as any).reset) {
              (turnstileRef.current as any).reset();
            }

            setError(
              "Human verification failed, please complete verification again and try",
            );
            return;
          }

          throw new Error(
            errorData.message ||
              `Server error: ${response.status} ${response.statusText}`,
          );
        }

        let data: any = {};
        try {
          // ȫJSON
          const responseText = await response.text();
          console.log("?? Success response text length:", responseText.length);

          // ǿӦ
          if (!responseText || responseText.trim().length === 0) {
            console.error("? Empty response from server");
            throw new Error(
              "Server returned empty response - please try again",
            );
          }

          if (responseText.trim().length <= 2) {
            console.error("? Minimal response from server:", responseText);
            throw new Error(
              "Server returned minimal response - this may be a temporary issue, please try again",
            );
          }

          if (responseText.trim()) {
            data = JSON.parse(responseText);
            console.log("? Successfully parsed response data:", {
              success: data.success,
              hasData: !!data.data,
              hasImages: !!data.data?.images || !!data.images,
              imageCount: data.data?.images?.length || data.images?.length || 0,
              dataKeys: Object.keys(data),
              responseLength: responseText.length,
              // ϸݽṹ
              dataStructure: {
                topLevelKeys: Object.keys(data),
                dataKeys: data.data ? Object.keys(data.data) : null,
                hasError: !!data.error,
                errorMessage: data.error || data.message,
                creditsRemaining: data.credits_remaining,
                // ͼƬֶ
                possibleImageFields: {
                  "data.images": !!data.data?.images,
                  images: !!data.images,
                  "data.result": !!data.data?.result,
                  result: !!data.result,
                  "data.output": !!data.data?.output,
                  output: !!data.output,
                },
              },
              // ʾϢ
              fullError: data.error
                ? {
                    error: data.error,
                    message: data.message,
                    details: data.details,
                  }
                : null,
              // ʾӦǰ500ַ
              responsePreview:
                responseText.substring(0, 500) +
                (responseText.length > 500 ? "..." : ""),
              // ʾdataṹ
              fullDataObject:
                JSON.stringify(data, null, 2).substring(0, 1000) +
                (JSON.stringify(data).length > 1000 ? "..." : ""),
            });

            // Chromeչͻ
            if (data.error && data.error.includes("chrome-extension")) {
              console.warn("?? Chrome extension conflict detected");
              throw new Error(
                "Browser extension conflict detected. Please disable ad blockers or privacy extensions and try again.",
              );
            }

            // Ӧ
            if (
              data.success === true &&
              (!data.data || Object.keys(data.data || {}).length === 0)
            ) {
              console.error("? Server returned success but no data");
              throw new Error(
                "Server processing completed but no images were generated. This may be due to content policy restrictions or temporary service issues.",
              );
            }
          }
        } catch (parseError) {
          console.error(
            "? Failed to parse success response as JSON:",
            parseError,
          );
          throw new Error(
            "Invalid response format from server - please try again",
          );
        }

        if (data.success && (data.data?.images || data.images)) {
          const images = data.data?.images || data.images;
          allImages.push(...images);
        }
      } catch (error) {
        console.error(`Batch ${i + 1} failed:`, error);
        if (i === 0) throw error; // һʧ׳
      }
    }

    return { images: allImages };
  }, []);

  // ͼĺĺ
  const generateImage = useCallback(
    async (request: GenerationRequest) => {
      let countdownInterval: NodeJS.Timeout | null = null; // 倒计时定时器
      const startTime = Date.now(); // 🔧 将startTime移到函数顶部

      try {
        setIsGenerating(true);
        setError("");
        setLastRequest(request); // 保存请求

        // 🔧 添加详细的请求开始日志
        console.log("🚀 ===== 图像生成开始 =====");
        console.log("🔧 Starting image generation:", {
          action: request.action,
          prompt: request.prompt?.substring(0, 100) + "...",
          hasImages: !!(request.image_url || request.image_urls),
          numImages: request.num_images || 1,
          userType,
          timestamp: new Date().toISOString(),
          fullRequest: {
            action: request.action,
            prompt: request.prompt,
            image_url: request.image_url,
            image_urls: request.image_urls,
            aspect_ratio: request.aspect_ratio,
            guidance_scale: request.guidance_scale,
            num_images: request.num_images,
            safety_tolerance: request.safety_tolerance,
            output_format: request.output_format,
            seed: request.seed,
            turnstile_token: request.turnstile_token ? "已设置" : "未设置",
          },
        });

        const currentEstimatedTime = getEstimatedGenerationTime(request.action);
        setCountdown(currentEstimatedTime);

        console.log(`⏱️ 预估生成时间: ${currentEstimatedTime}秒`);

        countdownInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, currentEstimatedTime - elapsed);
          setCountdown(remaining);

          if (remaining <= 0 && countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
        }, 1000);

        // 用户权限检查
        if (needsUpgrade(userType, request.num_images || 1)) {
          console.log("❌ 用户权限不足:", {
            userType,
            requestedImages: request.num_images || 1,
            maxAllowed: userLimits.maxImages,
          });
          if (countdownInterval) {
            clearInterval(countdownInterval); // 清除倒计时
            countdownInterval = null;
          }
          setCountdown(0);
          setError(
            `Upgrade required: Current plan allows up to ${userLimits.maxImages} images. Click the upgrade button to get more.`,
          );
          return;
        }

        // 🔧 使用增强的Turnstile验证
        console.log("🔐 开始Turnstile验证检查...");
        const isVerified = await validateTurnstile();
        if (!isVerified) {
          console.log("❌ Turnstile验证失败");
          if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
          setCountdown(0);
          return;
        }
        console.log("✅ Turnstile验证通过");

        // 如果验证通过，尝试获取token
        let turnstileTokenToUse: string | null = null;
        if (checkTurnstileRequired()) {
          if (isTurnstileVerified && turnstileToken) {
            turnstileTokenToUse = turnstileToken;
            console.log(
              "🔧 Using Turnstile verification token:",
              turnstileToken.substring(0, 20) + "...",
            );
          }

          if (turnstileTokenToUse) {
            request.turnstile_token = turnstileTokenToUse;
          }
        }

        console.log("📡 准备发送API请求到 /api/flux-kontext...");
        console.log("📋 最终请求数据:", JSON.stringify(request, null, 2));

        let result;

        // 如果需要生成超过4张图片且用户有权限，使用批量生成
        if (
          (request.num_images || 1) > 4 &&
          hasFeature(userType, "batchGeneration")
        ) {
          console.log("🔄 使用批量生成模式 (>4张图片)");
          result = await batchGenerate(request);
        } else {
          console.log("📡 发送单次API请求...");
          const response = await fetch("/api/flux-kontext", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          });

          console.log("📨 API响应接收完成:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url,
            type: response.type,
            redirected: response.redirected,
          });

          if (!response.ok) {
            console.log("❌ API响应状态不正常，开始解析错误信息...");
            let errorData: any = {};

            try {
              // 完全读取JSON响应
              const responseText = await response.text();
              console.log("📄 错误响应原始文本:", {
                length: responseText.length,
                preview: responseText.substring(0, 1000),
                full: responseText,
              });

              if (responseText.trim()) {
                errorData = JSON.parse(responseText);
                console.log("📋 解析后的错误数据:", errorData);
              }
            } catch (parseError) {
              console.warn("⚠️ 解析错误响应JSON失败:", parseError);
              errorData = {
                message: `Server error (${response.status}): ${response.statusText}`,
                error: "JSON parse failed",
              };
            }

            // 统一处理Turnstile验证失败错误
            if (
              errorData.code === "TURNSTILE_VERIFICATION_FAILED" ||
              errorData.code === "TURNSTILE_RETRY_REQUIRED" ||
              errorData.error?.includes("Human verification")
            ) {
              console.log("🔧 检测到Turnstile验证失败，自动重置验证状态");
              setIsTurnstileVerified(false);
              setTurnstileToken("");
              setTurnstileError("Verification failed, please verify again");

              // 重置Turnstile widget
              if (turnstileRef.current && (turnstileRef.current as any).reset) {
                (turnstileRef.current as any).reset();
              }

              setError(
                "Human verification failed, please complete verification again and try",
              );
              return;
            }

            throw new Error(
              errorData.message ||
                `Server error: ${response.status} ${response.statusText}`,
            );
          }

          console.log("✅ API响应状态正常，开始解析成功响应...");
          let data: any = {};
          let responseText = ""; // 🔧 将responseText声明移到外层作用域
          try {
            // 完全读取JSON响应
            responseText = await response.text();
            console.log("📄 ===== API响应详细分析 =====");
            console.log("📋 响应状态:", {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
              headers: Object.fromEntries(response.headers.entries()),
            });
            console.log("📄 响应原始文本 (完整):", responseText);
            console.log("📄 响应文本长度:", responseText.length);
            console.log(
              "📄 响应文本前1000字符:",
              responseText.substring(0, 1000),
            );

            // 🔧 增强响应验证
            if (!responseText || responseText.trim().length === 0) {
              console.error("❌ 服务器返回空响应");
              throw new Error(
                "Server returned empty response - please try again",
              );
            }

            if (responseText.trim().length <= 2) {
              console.error("❌ 服务器返回极简响应:", responseText);
              throw new Error(
                "Server returned minimal response - this may be a temporary issue, please try again",
              );
            }

            if (responseText.trim()) {
              data = JSON.parse(responseText);

              // 🔧 超详细的响应数据结构分析
              console.log("📊 ===== 解析后的JSON数据结构分析 =====");
              console.log("📋 JSON解析成功，数据类型:", typeof data);
              console.log("📋 顶级字段:", Object.keys(data));
              console.log(
                "📋 完整JSON对象 (格式化):",
                JSON.stringify(data, null, 2),
              );

              // 🔧 检查所有可能的错误字段
              console.log("🔍 ===== 错误字段检查 =====");
              console.log("🔍 data.error:", data.error);
              console.log("🔍 data.message:", data.message);
              console.log("🔍 data.success:", data.success);
              console.log("🔍 data.code:", data.code);
              console.log("🔍 data.details:", data.details);

              // 🔧 检查数据字段
              console.log("🔍 ===== 数据字段检查 =====");
              console.log("🔍 data.data:", !!data.data);
              console.log("🔍 data.data类型:", typeof data.data);
              if (data.data) {
                console.log("🔍 data.data字段:", Object.keys(data.data));
                console.log("🔍 data.data.images:", !!data.data.images);
                console.log(
                  "🔍 data.data.images长度:",
                  data.data.images?.length || 0,
                );
              }

              // 🔧 检查直接图像字段
              console.log("🔍 data.images:", !!data.images);
              console.log("🔍 data.images长度:", data.images?.length || 0);

              // 🔧 检查其他可能的字段
              console.log("🔍 ===== 其他字段检查 =====");
              console.log("🔍 data.result:", !!data.result);
              console.log("🔍 data.output:", !!data.output);
              console.log("🔍 data.credits_remaining:", data.credits_remaining);
              console.log("🔍 data.safety_check:", !!data.safety_check);
              console.log("🔍 data.warning:", data.warning);

              // 🔧 首先检查是否有错误信息
              if (data.error) {
                console.error("❌ ===== 发现错误字段 =====");
                console.error("❌ data.error:", data.error);
                console.error("❌ data.message:", data.message);
                console.error("❌ data.details:", data.details);
                console.error("❌ data.code:", data.code);
                console.error(
                  "❌ 完整错误对象:",
                  JSON.stringify(
                    {
                      error: data.error,
                      message: data.message,
                      details: data.details,
                      code: data.code,
                    },
                    null,
                    2,
                  ),
                );
                throw new Error(
                  data.message || data.error || "Server returned an error",
                );
              }

              // 🔧 检查success字段
              if (data.success === false) {
                console.error("❌ ===== success字段为false =====");
                console.error("❌ data.success:", data.success);
                console.error("❌ data.message:", data.message);
                console.error("❌ data.error:", data.error);
                throw new Error(
                  data.message ||
                    data.error ||
                    "Server returned success: false",
                );
              }

              // 🔧 检查Chrome扩展冲突
              if (data.error && data.error.includes("chrome-extension")) {
                console.warn("⚠️ 检测到Chrome扩展冲突");
                throw new Error(
                  "Browser extension conflict detected. Please disable ad blockers or privacy extensions and try again.",
                );
              }

              // 🔧 检查成功响应但无数据
              if (
                data.success === true &&
                (!data.data || Object.keys(data.data || {}).length === 0)
              ) {
                console.error("❌ 服务器返回成功但无数据");
                console.error("❌ data.success:", data.success);
                console.error("❌ data.data:", data.data);
                console.error(
                  "❌ data.data字段数量:",
                  data.data ? Object.keys(data.data).length : 0,
                );
                throw new Error(
                  "Server processing completed but no images were generated. This may be due to content policy restrictions or temporary service issues.",
                );
              }

              console.log("✅ ===== 响应验证通过 =====");
            }
          } catch (parseError) {
            console.error("❌ 解析成功响应JSON失败:", parseError);
            console.error("❌ 原始响应文本:", responseText);
            throw new Error(
              "Invalid response format from server - please try again",
            );
          }

          // 🔧 修改：确保正确处理result，兼容不同的响应数据结构
          result = data.data || data;
        }

        // 🔧 增强测试，检查result结构
        console.log("🔍 最终result结构分析:", {
          hasResult: !!result,
          resultType: typeof result,
          hasImages: !!result?.images,
          imagesCount: result?.images?.length || 0,
          resultKeys: result ? Object.keys(result) : [],
          firstImageUrl:
            result?.images?.[0]?.url?.substring(0, 50) + "..." || "N/A",
          // 🔧 添加完整result对象用于调试
          fullResult:
            JSON.stringify(result, null, 2).substring(0, 1500) +
            (JSON.stringify(result).length > 1500 ? "..." : ""),
        });

        if (result && result.images) {
          console.log("🖼️ 开始处理生成的图像...");
          const newImages: GeneratedImage[] = result.images.map(
            (img: any, index: number) => {
              console.log(`🔍 处理图像 ${index + 1}:`, {
                url: img.url?.substring(0, 50) + "...",
                width: img.width,
                height: img.height,
                hasUrl: !!img.url,
                urlLength: img.url?.length || 0,
              });
              return {
                url: img.url,
                width: img.width,
                height: img.height,
                prompt: request.prompt,
                action: request.action,
                timestamp: Date.now(),
              };
            },
          );

          // 🔧 临时禁用过于严格的图像质量检测系统
          const suspiciousImages: Array<{
            index: number;
            image: GeneratedImage;
            reason: string;
          }> = [];
          const nsfwDetectedImages: Array<{
            index: number;
            image: GeneratedImage;
            reason: string;
          }> = [];

          console.log("🔍 开始图像质量检测...");

          // 🔧 只保留NSFW检测，移除其他过于严格的检测
          for (let i = 0; i < newImages.length; i++) {
            const img = newImages[i];
            const originalImg = result.images[i]; // 获取原始API返回数据
            const urlLower = img.url.toLowerCase();
            let isNsfwDetected = false;

            console.log(`🔍 检测图像 ${i + 1}:`, {
              url: img.url?.substring(0, 50) + "...",
              urlLength: img.url?.length || 0,
              width: img.width,
              height: img.height,
            });

            // ✅ 只保留NSFW检测（基于API返回的has_nsfw_concepts字段）
            const hasNsfwConcepts =
              result.has_nsfw_concepts &&
              Array.isArray(result.has_nsfw_concepts) &&
              result.has_nsfw_concepts[i] === true;

            if (hasNsfwConcepts) {
              isNsfwDetected = true;
              console.warn(`🚨 图像 ${i + 1} 被API标记为NSFW:`, {
                url: img.url.substring(0, 50) + "...",
                hasNsfwConcepts,
              });
              nsfwDetectedImages.push({
                index: i,
                image: img,
                reason: "nsfw_content",
              });
            } else {
              // 🔧 记录正常图像信息
              console.log(`✅ 图像 ${i + 1} 通过检测:`, {
                url: img.url.substring(0, 50) + "...",
                width: img.width,
                height: img.height,
                hasNsfwConcepts: false,
              });
            }
          }

          // 🔧 只处理真正的NSFW检测到的图像
          if (nsfwDetectedImages.length > 0) {
            console.warn(
              `🚨 检测到 ${nsfwDetectedImages.length} 张NSFW内容图像`,
            );

            // 创建专门的NSFW错误信息
            const nsfwMessage =
              nsfwDetectedImages.length === newImages.length
                ? "Content not displayed due to NSFW detection. Your prompt may contain adult or inappropriate content that violates our community guidelines. Please modify your prompt to create family-friendly content."
                : `${nsfwDetectedImages.length} out of ${newImages.length} images were not displayed due to NSFW detection. Please consider adjusting your prompt to avoid adult or inappropriate content.`;

            setError(nsfwMessage);

            // 如果所有图片都是NSFW检测，可以尝试重新生成1次（更安全参数）
            if (
              nsfwDetectedImages.length === newImages.length &&
              retryCount < 1
            ) {
              console.log(
                `🔄 所有图像都被标记为NSFW，尝试使用更安全的参数重试...`,
              );
              setRetryCount((prev) => prev + 1);

              // 修改参数重试：降低guidance_scale和safety_tolerance
              const retryRequest = {
                ...request,
                guidance_scale: Math.max(
                  1.0,
                  (request.guidance_scale || 3.5) - 1.0,
                ), // 降低强度
                safety_tolerance: "1", // 使用最严格的安全设置
                seed: Math.floor(Math.random() * 1000000), // 随机种子
              };

              console.log(`🔄 重试参数:`, {
                guidance_scale: retryRequest.guidance_scale,
                safety_tolerance: retryRequest.safety_tolerance,
                seed: retryRequest.seed,
              });

              // 延迟3秒重试
              setTimeout(() => {
                generateImage(retryRequest);
              }, 3000);
              return;
            }

            // 🔧 如果有部分图像通过检测，显示通过的图像
            const validImages = newImages.filter(
              (_, index) =>
                !nsfwDetectedImages.some((nsfw) => nsfw.index === index),
            );

            if (validImages.length > 0) {
              console.log(
                `✅ 显示 ${validImages.length} 张有效图像，共 ${newImages.length} 张`,
              );
              setGeneratedImages((prev) => [...validImages, ...prev]);
              setRetryCount(0); // 重置重试计数
            }

            return; // 不继续处理，因为已经处理了NSFW情况
          }

          // 🔧 移除所有其他质量检测，直接显示图像
          console.log("✅ 图像生成成功:", {
            imageCount: newImages.length,
            firstImageUrl: newImages[0]?.url?.substring(0, 50) + "...",
            duration: Date.now() - startTime,
            allImagesValid: true,
          });

          console.log("🎉 ===== 图像生成完成 =====");
          setGeneratedImages((prev) => [...newImages, ...prev]);
          setRetryCount(0); // 重置重试计数
        } else {
          console.warn("⚠️ result中没有images:", result);
          throw new Error("No images generated - please try again");
        }
      } catch (error: any) {
        console.error("❌ ===== 图像生成错误 =====");
        console.error("🔥 生成错误详情:", {
          message: error.message,
          stack: error.stack,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          errorType: typeof error,
          errorConstructor: error.constructor?.name,
          fullError: error,
        });

        // 🔧 清除倒计时
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        setCountdown(0);

        // 🔧 记录错误信息
        let userFriendlyError = error.message || "Image generation failed";

        if (error.message?.includes("fetch")) {
          userFriendlyError =
            "Network error - please check your connection and try again";
        } else if (error.message?.includes("timeout")) {
          userFriendlyError =
            "Request timeout - the server is taking too long to respond";
        } else if (error.message?.includes("JSON")) {
          userFriendlyError = "Server response error - please try again";
        } else if (error.message?.includes("verification")) {
          userFriendlyError =
            "Human verification failed - please complete verification and try again";
        }

        console.log("📝 用户友好错误信息:", userFriendlyError);
        setError(userFriendlyError);

        // 🔧 记录重试次数
        if (
          error.message.includes("verification") ||
          error.message.includes("Verification")
        ) {
          setRetryCount((prev) => prev + 1);
        }
      } finally {
        setIsGenerating(false);
        // 🔧 确保清除倒计时定时器
        if (countdownInterval) {
          clearInterval(countdownInterval);
          setCountdown(0);
        }
        console.log("🏁 图像生成流程结束");
      }
    },
    [
      validateTurnstile,
      checkTurnstileRequired,
      turnstileToken,
      isTurnstileVerified,
      batchGenerate,
      userType,
      userLimits.maxImages,
      retryCount,
    ],
  );

  // 🔧 处理重试
  const handleRetry = useCallback(async () => {
    if (lastRequest) {
      await generateImage(lastRequest);
    }
  }, [lastRequest, generateImage]);

  // 🔧 处理文本生成图像
  const handleTextToImage = useCallback(async () => {
    if (!textPrompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    const action = getActionForModel(selectedModel, false, false);

    await generateImage({
      action,
      prompt: textPrompt,
      aspect_ratio: aspectRatio,
      guidance_scale: guidanceScale,
      num_images: numImages,
      safety_tolerance: safetyTolerance,
      output_format: outputFormat,
      seed: seed,
    });
  }, [
    textPrompt,
    selectedModel,
    aspectRatio,
    guidanceScale,
    numImages,
    safetyTolerance,
    outputFormat,
    seed,
    generateImage,
  ]);

  // ?? 🔧 处理图像编辑
  const handleImageEdit = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError("Please upload images to edit");
      return;
    }

    // ?? ��������ʾ�ʣ�ʹ��Ĭ����ʾ��
    const finalPrompt =
      editPrompt.trim() || "enhance this image, improve quality and details";

    // ?? ����Ƿ���blob URL��Ҫ�ȴ�ת��
    const hasBlobUrls = uploadedImages.some((url) => url.startsWith("blob:"));
    if (hasBlobUrls) {
      console.log("? Detected blob URLs, waiting for R2 conversion...");
      setError("Please wait for image upload to complete before editing");
      return;
    }

    // ?? ��֤����URL���ǿɷ��ʵ�HTTP URL
    const invalidUrls = uploadedImages.filter((url) => !url.startsWith("http"));
    if (invalidUrls.length > 0) {
      console.error("? Invalid URLs detected:", invalidUrls);
      setError(
        "Some images are not properly uploaded. Please re-upload and try again.",
      );
      return;
    }

    // ?? ͼƬ�Ѿ���R2 URL��ֱ��ʹ��
    const imageUrls = uploadedImages;
    console.log(`?? Using images for editing:`, imageUrls);

    // ?? ʹ������ģ��ѡ��
    const isMultiImage = imageUrls.length > 1;
    const action = getActionForModel(selectedModel, true, isMultiImage);

    const requestData = isMultiImage
      ? { image_urls: imageUrls }
      : { image_url: imageUrls[0] };

    console.log(`?? Image editing with prompt: "${finalPrompt}"`);

    // ?? 🔧 处理图像编辑
    await generateImage({
      action,
      prompt: finalPrompt,
      ...requestData,
      // ?? 🔧 处理图像编辑
      guidance_scale: guidanceScale,
      num_images: numImages,
      safety_tolerance: safetyTolerance,
      output_format: outputFormat,
      seed: seed,
    });
  }, [
    editPrompt,
    uploadedImages,
    selectedModel,
    guidanceScale,
    numImages,
    safetyTolerance,
    outputFormat,
    seed,
    generateImage,
  ]); // ?? 🔧 处理图像编辑

  // 🔧 移除上传的图像
  const removeUploadedImage = useCallback(
    (index: number) => {
      // 🔧 移除上传的图像
      const urlToRemove = uploadedImages[index];
      if (urlToRemove && urlToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRemove);
      }

      // 🔧 移除上传的图像
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

      console.log(`??? Removed image ${index + 1} and cleaned up resources`);
    },
    [uploadedImages],
  );

  // 🔧 复制图像链接
  const handleCopyLink = useCallback(async (url: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopySuccess("Link copied!");
      // 3����Զ������ʾ
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
      setCopySuccess("Copy failed");
      setTimeout(() => setCopySuccess(""), 3000);
    }
  }, []);

  // 🔧 下载图像
  const handleDownloadImage = useCallback(async (image: GeneratedImage) => {
    try {
      // 🔧 下载图像
      const downloadUrl =
        (image as any).r2_url || (image as any).fal_url || image.url;

      console.log("?? Starting download:", {
        r2_url: (image as any).r2_url,
        fal_url: (image as any).fal_url,
        main_url: image.url,
        selected_url: downloadUrl,
      });

      // 🔧 下载图像
      try {
        const response = await fetch(downloadUrl, {
          method: "GET",
          headers: {
            Accept: "image/*",
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `flux-kontext-${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log("? Download successful via fetch");
          return;
        }
      } catch (fetchError) {
        console.warn(
          "?? Fetch download failed, trying direct link:",
          fetchError,
        );
      }

      // 🔧 下载图像
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `flux-kontext-${Date.now()}.jpg`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // 🔧 添加DOM元素
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("? Download initiated via direct link");
    } catch (error) {
      console.error("? Download failed:", error);
      // 🔧 下载图像
      const openUrl = (image as any).fal_url || image.url;
      window.open(openUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  // 🔧 快速编辑图像
  const handleQuickEdit = useCallback(
    async (image: GeneratedImage, editText: string) => {
      if (!editText.trim()) {
        setError("Please enter edit instructions");
        return;
      }

      console.log("?? Quick edit started:", {
        imageUrl: image.url,
        editText: editText.trim(),
        selectedModel,
      });

      // 🔧 设置图像
      setUploadedImages([image.url]);
      setEditPrompt(editText.trim());

      // 🔧 滚动到编辑区域
      window.scrollTo({ top: 0, behavior: "smooth" });

      // 🔧 等待一段时间后，设置编辑提示词
      setTimeout(async () => {
        // 🔧 使用模型进行编辑
        const action = getActionForModel(selectedModel, true, false); // 图像编辑

        console.log(`?? Quick edit with minimal parameters`);

        // 🔧 处理图像编辑
        await generateImage({
          action,
          prompt: editText.trim(),
          image_url: image.url,
          // 🔧 处理图像编辑
          guidance_scale: guidanceScale,
          num_images: 1, // 图像编辑
          safety_tolerance: safetyTolerance,
          output_format: outputFormat,
          // 🔧 处理随机种子
        });
      }, 500); // 500msӳȷ״̬
    },
    [
      selectedModel,
      guidanceScale,
      safetyTolerance,
      outputFormat,
      generateImage,
    ],
  ); // 🔧 处理图像编辑

  // 🔧 处理图像预览

  // 🔧 处理拖放事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isEditMode = uploadedImages.length > 0;
  const promptValue = isEditMode ? editPrompt : textPrompt;
  const availableContextModels = buildContextModels({
    availableModels,
    hasImages: isEditMode,
    isMultiImage: uploadedImages.length > 1,
  });
  const recommendedModel = getRecommendedModelValue(availableContextModels);
  const currentModelInfo =
    availableContextModels.find((model) => model.value === selectedModel) ||
    availableContextModels[0];
  const shouldShowTurnstile = isTurnstileEnabled && checkTurnstileRequired();
  const canSubmit = !isGenerating && (isEditMode || Boolean(textPrompt.trim()));

  useEffect(() => {
    if (recommendedModel !== selectedModel) {
      setSelectedModel(recommendedModel);
    }
  }, [recommendedModel, selectedModel]);

  const handleUpgrade = useCallback(() => {
    router.push("/pricing");
  }, [router]);

  const handlePromptChange = useCallback(
    (value: string) => {
      if (isEditMode) {
        setEditPrompt(value);
      } else {
        setTextPrompt(value);
      }
    },
    [isEditMode],
  );

  const handleEnhancePrompt = useCallback(() => {
    const enhancedPrompt = getEnhancedPrompt(promptValue);

    if (isEditMode) {
      setEditPrompt(enhancedPrompt);
    } else {
      setTextPrompt(enhancedPrompt);
    }
  }, [isEditMode, promptValue]);

  const handleSelectGeneratedImage = useCallback((image: GeneratedImage) => {
    setUploadedImages([image.url]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMissingEditInstructions = useCallback(() => {
    setError("Please enter edit instructions");
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <GeneratorErrorBanner
        error={error}
        isGenerating={isGenerating}
        showRetry={Boolean(lastRequest) && retryCount > 0}
        showUpgrade={error.includes("Upgrade required")}
        onRetry={handleRetry}
        onUpgrade={handleUpgrade}
        onDismiss={() => setError("")}
      />

      <section className="flex flex-col py-2">
        <header className="mb-3" />
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <GeneratorConfigCard
              isEditMode={isEditMode}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              currentModelInfo={currentModelInfo}
              availableContextModels={availableContextModels}
              userType={userType}
              guidanceScale={guidanceScale}
              onGuidanceScaleChange={setGuidanceScale}
              safetyTolerance={safetyTolerance}
              onSafetyToleranceChange={setSafetyTolerance}
              seed={seed}
              onSeedChange={setSeed}
              onRandomizeSeed={() =>
                setSeed(Math.floor(Math.random() * 1000000))
              }
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
            />

            <GeneratorWorkspaceCard
              isEditMode={isEditMode}
              promptValue={promptValue}
              onPromptChange={handlePromptChange}
              onEnhancePrompt={handleEnhancePrompt}
              onTextareaPaste={handlePaste}
              uploadedImages={uploadedImages}
              multiFileInputRef={multiFileInputRef}
              onMultiImageUpload={handleMultiImageUpload}
              onRemoveUploadedImage={removeUploadedImage}
              onUploadZonePaste={handlePaste}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              numImages={numImages}
              onNumImagesChange={setNumImages}
              imageCountOptions={imageCountOptions}
              canUseImageCount={canUseImageCount}
              getUpgradeMessage={getUpgradeMessage}
              onUpgrade={handleUpgrade}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              aspectRatioOptions={aspectRatioOptions}
              isTurnstileEnabled={isTurnstileEnabled}
              shouldShowTurnstile={shouldShowTurnstile}
              isTurnstileVerified={isTurnstileVerified}
              turnstileRef={turnstileRef}
              onTurnstileVerify={handleTurnstileVerify}
              onTurnstileError={handleTurnstileError}
              onTurnstileExpire={handleTurnstileExpire}
              userType={userType}
              isGenerating={isGenerating}
              countdown={countdown}
              canSubmit={canSubmit}
              onSubmit={isEditMode ? handleImageEdit : handleTextToImage}
            />
          </div>
        </div>
      </section>

      <GeneratedImagesSection
        generatedImages={generatedImages}
        isGenerating={isGenerating}
        countdown={countdown}
        uploadedImagesCount={uploadedImages.length}
        aspectRatio={aspectRatio}
        copySuccess={copySuccess}
        onCopyLink={handleCopyLink}
        onDownloadImage={handleDownloadImage}
        onQuickEdit={handleQuickEdit}
        onSelectImageForEditing={handleSelectGeneratedImage}
        onMissingEditInstructions={handleMissingEditInstructions}
      />

      <GeneratorMarketingSections
        selectedModel={selectedModel}
        availableModels={availableModels}
        onSelectModel={setSelectedModel}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
