"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

// 声明Turnstile全局类型 - 定义Cloudflare Turnstile的JavaScript API接口
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string; // 渲染验证组件，返回widget ID
      remove: (widgetId: string) => void; // 移除指定的widget
      reset: (widgetId: string) => void; // 重置指定的widget
    };
  }
}

// StandardTurnstile组件的属性接口定义
interface StandardTurnstileProps {
  onVerify: (token: string) => void; // 验证成功回调函数
  onError: (error: string) => void; // 验证失败回调函数
  onExpire?: () => void; // 验证过期回调函数（可选）
  theme?: "light" | "dark" | "auto"; // 主题模式
  size?: "normal" | "compact" | "flexible"; // 组件尺寸
  className?: string; // 自定义CSS类名
}

// 主要的StandardTurnstile组件
export function StandardTurnstile({
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "flexible",
  className = "",
}: StandardTurnstileProps) {
  console.log("🚀 StandardTurnstile组件开始渲染，props:", {
    theme,
    size,
    className,
    hasOnVerify: !!onVerify,
    hasOnError: !!onError,
    hasOnExpire: !!onExpire,
  });

  // React Refs - 用于直接操作DOM元素
  const containerRef = useRef<HTMLDivElement>(null); // 验证组件容器的引用
  const widgetRef = useRef<string | null>(null); // Turnstile widget ID的引用

  console.log("📝 初始化Refs:", {
    containerRef: !!containerRef,
    widgetRef: !!widgetRef,
    currentWidgetId: widgetRef.current,
  });

  // 组件状态管理
  const [isLoading, setIsLoading] = useState(true); // 是否正在加载
  const [hasError, setHasError] = useState(false); // 是否有错误
  const [errorMessage, setErrorMessage] = useState(""); // 错误信息
  const [retryCount, setRetryCount] = useState(0); // 重试次数
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // 脚本是否已加载
  const [isVerified, setIsVerified] = useState(false); // 是否已验证成功

  console.log("📊 当前组件状态:", {
    isLoading,
    hasError,
    errorMessage,
    retryCount,
    isScriptLoaded,
    isVerified,
  });

  // 检查Turnstile脚本是否已加载的函数
  const checkScriptLoaded = useCallback(() => {
    console.log("🔍 检查Turnstile脚本是否已加载...");
    const windowExists = typeof window !== "undefined";
    const turnstileExists = windowExists && !!window.turnstile;

    console.log("🔍 脚本检查结果:", {
      windowExists,
      turnstileExists,
      windowTurnstile: windowExists ? window.turnstile : "window不存在",
    });

    return turnstileExists;
  }, []);

  // 动态加载Turnstile脚本的函数
  const loadTurnstileScript = useCallback(() => {
    console.log("📥 开始加载Turnstile脚本...");

    return new Promise<void>((resolve, reject) => {
      // 如果脚本已经加载，直接返回成功
      if (checkScriptLoaded()) {
        console.log("✅ 脚本已经加载，直接返回成功");
        setIsScriptLoaded(true);
        resolve();
        return;
      }

      // 检查是否已经有脚本标签在加载中
      const existingScript = document.querySelector('script[src*="turnstile"]');
      console.log("🔍 检查现有脚本标签:", {
        existingScript: !!existingScript,
        scriptSrc: existingScript?.getAttribute("src"),
      });

      if (existingScript) {
        console.log("⏳ 发现现有脚本正在加载，等待加载完成...");
        // 如果脚本正在加载，等待加载完成
        const checkInterval = setInterval(() => {
          console.log("🔄 检查脚本加载状态...");
          if (checkScriptLoaded()) {
            console.log("✅ 脚本加载完成！");
            clearInterval(checkInterval);
            setIsScriptLoaded(true);
            resolve();
          }
        }, 100);

        // 设置超时
        setTimeout(() => {
          console.log("⏰ 脚本加载超时，清除检查间隔");
          clearInterval(checkInterval);
          if (!checkScriptLoaded()) {
            console.error("❌ Turnstile脚本加载超时");
            reject(new Error("Turnstile脚本加载超时"));
          }
        }, 10000);
        return;
      }

      console.log("📝 创建新的script标签...");
      // 创建script标签动态加载Cloudflare Turnstile脚本
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true; // 异步加载
      script.defer = true; // 延迟执行

      console.log("📝 Script标签配置:", {
        src: script.src,
        async: script.async,
        defer: script.defer,
      });

      // 脚本加载成功的处理
      script.onload = () => {
        console.log("✅ Turnstile脚本加载成功！");
        console.log("🔍 验证window.turnstile是否可用:", !!window.turnstile);
        setIsScriptLoaded(true);
        resolve();
      };

      // 脚本加载失败的处理
      script.onerror = (error) => {
        console.error("❌ Turnstile脚本加载失败:", error);
        reject(new Error("Turnstile脚本加载失败"));
      };

      console.log("📤 将脚本添加到页面头部...");
      // 将脚本添加到页面头部
      document.head.appendChild(script);

      // 设置10秒超时机制
      setTimeout(() => {
        console.log("⏰ 检查脚本加载超时...");
        if (!checkScriptLoaded()) {
          console.error("❌ Turnstile脚本加载超时（10秒）");
          reject(new Error("Turnstile脚本加载超时"));
        }
      }, 10000);
    });
  }, [checkScriptLoaded]);

  // 渲染Turnstile验证组件的函数
  const renderTurnstile = useCallback(() => {
    console.log("🎨 开始渲染Turnstile组件...");

    // 检查容器和Turnstile API是否准备就绪
    const containerReady = !!containerRef.current;
    const turnstileReady = !!window.turnstile;

    console.log("🔍 渲染前检查:", {
      containerReady,
      turnstileReady,
      containerElement: containerRef.current,
      windowTurnstile: window.turnstile,
    });

    if (!containerRef.current || !window.turnstile) {
      console.warn("⚠️ 无法渲染Turnstile: 容器或脚本未准备就绪");
      return;
    }

    // 获取环境变量中的站点密钥
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    console.log("🔑 获取站点密钥:", {
      hasSiteKey: !!siteKey,
      siteKeyLength: siteKey?.length,
      siteKeyPrefix: siteKey?.substring(0, 10) + "...",
    });

    if (!siteKey) {
      console.error("❌ Turnstile站点密钥未配置");
      setHasError(true);
      setErrorMessage("验证服务未配置");
      return;
    }

    try {
      console.log("🧹 清理现有widget...");
      // 清理现有的widget（如果存在）
      if (widgetRef.current && window.turnstile) {
        console.log("🗑️ 移除现有widget:", widgetRef.current);
        try {
          window.turnstile.remove(widgetRef.current);
          console.log("✅ 现有widget移除成功");
        } catch (e) {
          console.warn("⚠️ 清理现有widget失败:", e);
        }
      }

      console.log("🧹 清空容器内容...");
      // 清空容器内容
      containerRef.current.innerHTML = "";

      console.log("🎨 开始渲染新的Turnstile widget...");
      console.log("🔧 Widget配置:", {
        sitekey: siteKey?.substring(0, 10) + "...",
        theme,
        size,
      });

      // 渲染新的Turnstile widget
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey, // 站点密钥
        theme: theme, // 主题设置
        size: size, // 尺寸设置
        // 验证成功的回调函数
        callback: (token: string) => {
          console.log("✅ Turnstile验证成功！");
          console.log("🎫 收到验证token:", {
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + "...",
          });

          console.log("📝 更新组件状态为验证成功...");
          setHasError(false);
          setErrorMessage("");
          setIsLoading(false);
          setIsVerified(true);

          console.log("📞 调用父组件的成功回调...");
          onVerify(token); // 调用父组件的成功回调
        },
        // 验证失败的回调函数
        "error-callback": (error: string) => {
          console.error("❌ Turnstile验证失败:", error);
          console.log("📝 更新组件状态为验证失败...");
          setHasError(true);
          setErrorMessage(error);
          setIsLoading(false);
          setIsVerified(false);

          console.log("📞 调用父组件的错误回调...");
          onError(error); // 调用父组件的错误回调
        },
        // 验证过期的回调函数
        "expired-callback": () => {
          console.log("⏰ Turnstile验证已过期");
          console.log("📝 更新组件状态为过期...");
          setIsLoading(true);
          setIsVerified(false);

          console.log("📞 调用父组件的过期回调...");
          onExpire?.(); // 调用父组件的过期回调（如果存在）
        },
      });

      console.log("🎨 Widget渲染完成，widget ID:", widgetRef.current);

      // 更新组件状态
      console.log("📝 更新组件状态为渲染成功...");
      setIsLoading(false);
      setHasError(false);
      console.log("✅ Turnstile widget渲染成功");
    } catch (error: any) {
      // 处理渲染过程中的错误
      console.error("❌ Turnstile widget渲染失败:", error);
      console.log("📝 更新组件状态为渲染失败...");
      setHasError(true);
      setErrorMessage(error.message || "验证组件渲染失败");
      setIsLoading(false);
      setIsVerified(false);
    }
  }, [theme, size, onVerify, onError, onExpire]);

  // 重试验证的处理函数
  const handleRetry = useCallback(() => {
    console.log("🔄 开始重试Turnstile验证...");
    console.log("📊 重试前状态:", {
      retryCount,
      isLoading,
      hasError,
      isVerified,
    });

    setRetryCount((prev) => {
      const newCount = prev + 1;
      console.log("📈 增加重试计数:", prev, "->", newCount);
      return newCount;
    });

    console.log("📝 重置组件状态...");
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    setIsVerified(false);

    // 根据脚本加载状态决定重试策略
    const scriptLoaded = checkScriptLoaded();
    console.log("🔍 检查脚本加载状态:", scriptLoaded);

    if (scriptLoaded) {
      console.log("✅ 脚本已加载，直接重新渲染...");
      renderTurnstile(); // 直接重新渲染
    } else {
      console.log("📥 脚本未加载，重新加载脚本然后渲染...");
      // 重新加载脚本然后渲染
      loadTurnstileScript()
        .then(() => {
          console.log("✅ 脚本重新加载成功，开始渲染...");
          renderTurnstile();
        })
        .catch((error) => {
          console.error("❌ 重试失败:", error);
          console.log("📝 更新组件状态为重试失败...");
          setHasError(true);
          setErrorMessage(error.message);
          setIsLoading(false);
        });
    }
  }, [
    checkScriptLoaded,
    loadTurnstileScript,
    renderTurnstile,
    hasError,
    isLoading,
    isVerified,
    retryCount,
  ]);

  // 组件初始化的useEffect钩子
  useEffect(() => {
    console.log("🔧 StandardTurnstile组件初始化useEffect触发");
    console.log("🌍 环境检查:", {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_ENABLE_TURNSTILE: process.env.NEXT_PUBLIC_ENABLE_TURNSTILE,
      hasSiteKey: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    });

    console.log("📥 开始加载脚本并渲染组件...");
    // 加载脚本并渲染组件
    loadTurnstileScript()
      .then(() => {
        console.log("✅ 脚本加载成功，开始渲染组件...");
        renderTurnstile();
      })
      .catch((error) => {
        console.error("❌ Turnstile初始化失败:", error);
        console.log("📝 更新组件状态为初始化失败...");
        setHasError(true);
        setErrorMessage(error.message);
        setIsLoading(false);
      });

    // 组件卸载时的清理函数
    return () => {
      console.log("🧹 StandardTurnstile组件卸载，开始清理...");
      if (widgetRef.current && window.turnstile) {
        console.log("🗑️ 清理widget:", widgetRef.current);
        try {
          window.turnstile.remove(widgetRef.current);
          console.log("✅ Widget清理成功");
        } catch (e) {
          console.warn("⚠️ 组件清理失败:", e);
        }
      } else {
        console.log("ℹ️ 无需清理widget（widget不存在或turnstile不可用）");
      }
    };
  }, [loadTurnstileScript, renderTurnstile]);

  console.log("🎨 开始渲染JSX，当前状态:", {
    isLoading,
    hasError,
    isVerified,
    errorMessage,
  });

  // 组件的JSX渲染部分
  return (
    <div className={`turnstile-container ${className}`}>
      {/* 加载状态显示 */}
      {isLoading && !hasError && !isVerified && (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading security verification...</span>
          </div>
        </div>
      )}

      {/* 错误状态显示 */}
      {hasError && (
        <div className="generator-note generator-note--danger flex flex-col items-center gap-3 rounded-xl p-4">
          <div className="generator-status-inline generator-status-inline--danger text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Verification Error</span>
          </div>
          <p className="text-center text-xs">
            {errorMessage || "验证加载失败"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("🔄 用户点击重试按钮");
              handleRetry();
            }}
            className="h-8 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry ({retryCount})
          </Button>
        </div>
      )}

      {/* 验证成功状态显示 */}
      {isVerified && !hasError && (
        <div className="generator-note generator-note--success flex items-center justify-center rounded-xl p-4">
          <div className="generator-status-inline generator-status-inline--success text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Verification Successful</span>
          </div>
        </div>
      )}

      {/* Turnstile widget容器 */}
      <div
        ref={containerRef}
        className={`turnstile-widget ${isLoading || hasError || isVerified ? "hidden" : ""}`}
      />

      {/* 验证就绪状态的控制按钮 */}
      {!isLoading && !hasError && !isVerified && (
        <div className="flex items-center justify-between mt-2">
          <div className="generator-status-inline generator-status-inline--success text-xs">
            <Shield className="h-3 w-3" />
            <span>Verification Ready</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("🔄 用户点击刷新按钮");
              handleRetry();
            }}
            className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}

// 验证Turnstile token的工具函数
export async function verifyStandardTurnstileToken(
  token: string,
): Promise<boolean> {
  console.log("🔐 开始验证Turnstile token...");
  console.log("🎫 Token信息:", {
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 20) + "...",
  });

  try {
    console.log("📤 发送POST请求到验证API...");
    // 发送POST请求到验证API
    const response = await fetch("/api/verify-turnstile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    console.log("📥 收到API响应:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // 检查HTTP响应状态
    if (!response.ok) {
      console.error("❌ Turnstile token验证失败:", response.status);
      return false;
    }

    // 解析响应数据
    const data = await response.json();
    console.log("📊 解析响应数据:", data);
    console.log("✅ Turnstile token验证结果:", data.success);
    return data.success === true;
  } catch (error) {
    // 处理网络或其他错误
    console.error("❌ Turnstile token验证错误:", error);
    return false;
  }
}
