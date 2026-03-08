import { fal } from "@fal-ai/client";
import { r2Storage } from "@/lib/services/r2-storage";

// 配置FAL客户端
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY
  });
  console.log("✅ FAL client configured");
  
  // 🔍 验证FAL客户端配置
  try {
    const keyLength = process.env.FAL_KEY.length;
    console.log(`🔍 FAL key validation:`, {
      keyLength,
      isValidLength: keyLength > 20,
      hasExpectedPrefix: process.env.FAL_KEY.startsWith('fal_') || process.env.FAL_KEY.startsWith('key_')
    });
  } catch (keyError) {
    console.error('❌ FAL key validation error:', keyError);
  }
} else {
  console.error('❌ FAL_KEY environment variable not found');
}

// 定义API端点常量 - 🔧 根据FAL API官方文档完全修复端点
export const FLUX_ENDPOINTS = {
  // 🔧 Kontext 图像编辑端点（image-to-image）- 根据官方文档修复
  KONTEXT_PRO: "fal-ai/flux-pro/kontext",
  KONTEXT_MAX: "fal-ai/flux-pro/kontext/max", 
  
  // 🔧 Kontext 多图像编辑端点 - 根据官方文档修复
  KONTEXT_MAX_MULTI: "fal-ai/flux-pro/kontext/max/multi",
  KONTEXT_PRO_MULTI: "fal-ai/flux-pro/kontext/multi",
  
  // 🔧 标准FLUX文生图端点 - 根据官方文档修复
  FLUX_PRO_TEXT_TO_IMAGE: "fal-ai/flux-pro",
  FLUX_MAX_TEXT_TO_IMAGE: "fal-ai/flux-pro/v1.1", // FLUX1.1 [pro]
  
  // 🔧 标准FLUX端点 - 根据官方文档修复
  FLUX_SCHNELL: "fal-ai/flux/schnell",
  FLUX_DEV: "fal-ai/flux/dev",
  FLUX_GENERAL: "fal-ai/flux-general", // 通用FLUX端点，支持LoRA
  FLUX_REALISM: "fal-ai/flux-lora", // 使用LoRA实现真实感
  FLUX_ANIME: "fal-ai/flux-lora" // 使用LoRA实现动漫风格
} as const;

// 定义类型接口
export interface FluxKontextBaseInput {
  prompt: string;
  seed?: number;
  guidance_scale?: number;
  sync_mode?: boolean;
  num_images?: number;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  output_format?: "jpeg" | "png";
}

export interface FluxKontextImageEditInput extends FluxKontextBaseInput {
  image_url: string;
  aspect_ratio?: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21";
}

export interface FluxKontextMultiImageInput extends FluxKontextBaseInput {
  image_urls: string[];
  aspect_ratio?: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21";
}

export interface FluxKontextTextToImageInput extends FluxKontextBaseInput {
  aspect_ratio?: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21";
}

export interface FluxKontextImage {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
}

export interface FluxKontextResult {
  images: FluxKontextImage[];
  timings?: any;
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

// Flux Kontext API服务类
export class FluxKontextService {
  
  /**
   * Kontext [pro] - 图像编辑
   * 快速迭代编辑，保持角色一致性
   */
  static async editImagePro(input: FluxKontextImageEditInput): Promise<FluxKontextResult> {
    try {
      // 🔧 根据API文档，移除不支持的aspect_ratio参数
      const kontextInput = {
        prompt: input.prompt,
        image_url: input.image_url,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format
        // ❌ 移除 aspect_ratio - Kontext API不支持此参数
      };

      console.log(`🚀 Starting editImagePro with input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        image_url: input.image_url?.substring(0, 50) + '...',
        removed_aspect_ratio: input.aspect_ratio, // 记录被移除的参数
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        endpoint: FLUX_ENDPOINTS.KONTEXT_PRO,
        cleanedInput: JSON.stringify(kontextInput).substring(0, 300) + '...'
      });

      console.log(`📡 Calling fal.subscribe for endpoint: ${FLUX_ENDPOINTS.KONTEXT_PRO}`);
      
      const result = await fal.subscribe(FLUX_ENDPOINTS.KONTEXT_PRO, {
        input: kontextInput, // 🔧 使用清理后的输入参数
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`📊 Queue update:`, {
            status: update.status,
            position: (update as any).queue_position,
            logs: (update as any).logs?.map((log: any) => log.message).join(", ")
          });
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", (update as any).logs?.map((log: any) => log.message).join("\n"));
          }
        },
      });

      console.log(`📋 FAL subscribe result:`, {
        hasData: !!result.data,
        dataType: typeof result.data,
        hasImages: !!result.data?.images,
        imagesCount: result.data?.images?.length || 0,
        requestId: (result as any).requestId,
        fullResultKeys: result ? Object.keys(result) : [],
        dataKeys: result.data ? Object.keys(result.data) : [],
        firstImageUrl: result.data?.images?.[0]?.url?.substring(0, 50) + '...' || 'N/A',
        resultStringified: JSON.stringify(result).substring(0, 500) + '...'
      });

      if (!result.data) {
        console.error('❌ FAL subscribe returned no data:', {
          fullResult: result,
          resultKeys: Object.keys(result),
          resultStringified: JSON.stringify(result)
        });
        throw new Error('FAL API returned no data - this may indicate a service issue or invalid request');
      }

      // 🔍 检查data结构
      if (!result.data.images) {
        console.error('❌ FAL subscribe data has no images:', {
          dataKeys: Object.keys(result.data),
          dataStringified: JSON.stringify(result.data)
        });
        
        // 🔍 尝试查找其他可能的图片字段
        const possibleFields = ['image', 'output', 'result'];
        for (const field of possibleFields) {
          if ((result.data as any)[field]) {
            console.log(`🔍 Found potential images in data.${field}:`, (result.data as any)[field]);
            if (Array.isArray((result.data as any)[field])) {
              (result.data as any).images = (result.data as any)[field];
              break;
            } else if (typeof (result.data as any)[field] === 'string') {
              (result.data as any).images = [{ url: (result.data as any)[field] }];
              break;
            }
          }
        }
        
        if (!result.data.images) {
          throw new Error('FAL API returned data without images field');
        }
      }

      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("❌ Flux Kontext Pro editing error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          prompt: input.prompt?.substring(0, 100) + '...',
          image_url: input.image_url?.substring(0, 50) + '...'
        }
      });
      throw error;
    }
  }

  /**
   * Kontext [max] - 图像编辑
   * 最高性能，改进的提示遵循和排版生成
   */
  static async editImageMax(input: FluxKontextImageEditInput): Promise<FluxKontextResult> {
    try {
      // 🔧 根据API文档，移除不支持的aspect_ratio参数
      const kontextInput = {
        prompt: input.prompt,
        image_url: input.image_url,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format
        // ❌ 移除 aspect_ratio - Kontext API不支持此参数
      };

      console.log(`🚀 Starting editImageMax with input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        image_url: input.image_url?.substring(0, 50) + '...',
        removed_aspect_ratio: input.aspect_ratio, // 记录被移除的参数
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        endpoint: FLUX_ENDPOINTS.KONTEXT_MAX,
        cleanedInput: JSON.stringify(kontextInput).substring(0, 300) + '...'
      });

      const result = await fal.subscribe(FLUX_ENDPOINTS.KONTEXT_MAX, {
        input: kontextInput, // 🔧 使用清理后的输入参数
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("❌ Flux Kontext Max editing error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          prompt: input.prompt?.substring(0, 100) + '...',
          image_url: input.image_url?.substring(0, 50) + '...',
          removed_aspect_ratio: input.aspect_ratio
        }
      });
      throw error;
    }
  }

  /**
   * Kontext [max] - 多图像编辑（实验性）
   * 处理多个图像的编辑功能
   */
  static async editMultiImageMax(input: FluxKontextMultiImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 根据API文档，移除不支持的aspect_ratio参数
      const kontextInput = {
        prompt: input.prompt,
        image_urls: input.image_urls,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format
        // ❌ 移除 aspect_ratio - Kontext API不支持此参数
      };

      console.log(`🚀 Starting editMultiImageMax with input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        image_urls_count: input.image_urls?.length || 0,
        removed_aspect_ratio: input.aspect_ratio, // 记录被移除的参数
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        endpoint: FLUX_ENDPOINTS.KONTEXT_MAX_MULTI,
        cleanedInput: JSON.stringify(kontextInput).substring(0, 300) + '...'
      });

      const result = await fal.subscribe(FLUX_ENDPOINTS.KONTEXT_MAX_MULTI, {
        input: kontextInput, // 🔧 使用清理后的输入参数
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("❌ Flux Kontext Max multi-image editing error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          prompt: input.prompt?.substring(0, 100) + '...',
          image_urls_count: input.image_urls?.length || 0,
          removed_aspect_ratio: input.aspect_ratio
        }
      });
      throw error;
    }
  }

  /**
   * Kontext [max] - 文本生成图像
   * 最高性能的文本到图像生成
   */
  static async textToImageMax(input: FluxKontextTextToImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 转换参数格式：标准FLUX端点使用image_size而不是aspect_ratio
      const fluxInput = {
        prompt: input.prompt,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        sync_mode: input.sync_mode,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        // 🔧 将aspect_ratio转换为image_size格式
        image_size: this.convertAspectRatioToImageSize(input.aspect_ratio)
      };

      console.log(`🚀 Starting textToImageMax with converted input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        original_aspect_ratio: input.aspect_ratio,
        converted_image_size: fluxInput.image_size,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        endpoint: FLUX_ENDPOINTS.FLUX_MAX_TEXT_TO_IMAGE
      });

      console.log(`📡 Calling fal.subscribe for endpoint: ${FLUX_ENDPOINTS.FLUX_MAX_TEXT_TO_IMAGE}`);
      
      const result = await fal.subscribe(FLUX_ENDPOINTS.FLUX_MAX_TEXT_TO_IMAGE, {
        input: fluxInput,
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`📊 Queue update:`, {
            status: update.status,
            position: (update as any).queue_position,
            logs: (update as any).logs?.map((log: any) => log.message).join(", ")
          });
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", (update as any).logs?.map((log: any) => log.message).join("\n"));
          }
        },
      });

      console.log(`📋 FAL subscribe result:`, {
        hasData: !!result.data,
        dataType: typeof result.data,
        hasImages: !!result.data?.images,
        imagesCount: result.data?.images?.length || 0,
        requestId: (result as any).requestId,
        fullResultKeys: result ? Object.keys(result) : [],
        dataKeys: result.data ? Object.keys(result.data) : [],
        firstImageUrl: result.data?.images?.[0]?.url?.substring(0, 50) + '...' || 'N/A',
        resultStringified: JSON.stringify(result).substring(0, 500) + '...'
      });

      if (!result.data) {
        console.error('❌ FAL subscribe returned no data:', {
          fullResult: result,
          resultKeys: Object.keys(result),
          resultStringified: JSON.stringify(result)
        });
        throw new Error('FAL API returned no data - this may indicate a service issue or invalid request');
      }

      // 🔍 检查data结构
      if (!result.data.images) {
        console.error('❌ FAL subscribe data has no images:', {
          dataKeys: Object.keys(result.data),
          dataStringified: JSON.stringify(result.data)
        });
        
        // 🔍 尝试查找其他可能的图片字段
        const possibleFields = ['image', 'output', 'result'];
        for (const field of possibleFields) {
          if ((result.data as any)[field]) {
            console.log(`🔍 Found potential images in data.${field}:`, (result.data as any)[field]);
            if (Array.isArray((result.data as any)[field])) {
              (result.data as any).images = (result.data as any)[field];
              break;
            } else if (typeof (result.data as any)[field] === 'string') {
              (result.data as any).images = [{ url: (result.data as any)[field] }];
              break;
            }
          }
        }
        
        if (!result.data.images) {
          throw new Error('FAL API returned data without images field');
        }
      }

      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("❌ Flux Max text-to-image error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          prompt: input.prompt?.substring(0, 100) + '...',
          aspect_ratio: input.aspect_ratio
        }
      });
      throw error;
    }
  }

  /**
   * Kontext [pro] - 多图像编辑（实验性）
   * Pro版本的多图像处理功能
   */
  static async editMultiImagePro(input: FluxKontextMultiImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 根据API文档，移除不支持的aspect_ratio参数
      const kontextInput = {
        prompt: input.prompt,
        image_urls: input.image_urls,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format
        // ❌ 移除 aspect_ratio - Kontext API不支持此参数
      };

      console.log(`🚀 Starting editMultiImagePro with input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        image_urls_count: input.image_urls?.length || 0,
        removed_aspect_ratio: input.aspect_ratio, // 记录被移除的参数
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        endpoint: FLUX_ENDPOINTS.KONTEXT_PRO_MULTI,
        cleanedInput: JSON.stringify(kontextInput).substring(0, 300) + '...'
      });

      const result = await fal.subscribe(FLUX_ENDPOINTS.KONTEXT_PRO_MULTI, {
        input: kontextInput, // 🔧 使用清理后的输入参数
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("❌ Flux Kontext Pro multi-image editing error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          prompt: input.prompt?.substring(0, 100) + '...',
          image_urls_count: input.image_urls?.length || 0,
          removed_aspect_ratio: input.aspect_ratio
        }
      });
      throw error;
    }
  }

  /**
   * Kontext [pro] - 文本生成图像
   * Pro版本的文本到图像生成
   */
  static async textToImagePro(input: FluxKontextTextToImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 转换参数格式：标准FLUX端点使用image_size而不是aspect_ratio
      const fluxInput = {
        prompt: input.prompt,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        sync_mode: input.sync_mode,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        // 🔧 将aspect_ratio转换为image_size格式
        image_size: this.convertAspectRatioToImageSize(input.aspect_ratio)
      };

      console.log(`🚀 Starting textToImagePro with converted input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        original_aspect_ratio: input.aspect_ratio,
        converted_image_size: fluxInput.image_size,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        endpoint: FLUX_ENDPOINTS.FLUX_PRO_TEXT_TO_IMAGE
      });

      console.log(`📡 Calling fal.subscribe for endpoint: ${FLUX_ENDPOINTS.FLUX_PRO_TEXT_TO_IMAGE}`);
      
      const result = await fal.subscribe(FLUX_ENDPOINTS.FLUX_PRO_TEXT_TO_IMAGE, {
        input: fluxInput,
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`📊 Queue update:`, {
            status: update.status,
            position: (update as any).queue_position,
            logs: (update as any).logs?.map((log: any) => log.message).join(", ")
          });
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", (update as any).logs?.map((log: any) => log.message).join("\n"));
          }
        },
      });

      console.log(`📋 FAL subscribe result:`, {
        hasData: !!result.data,
        dataType: typeof result.data,
        hasImages: !!result.data?.images,
        imagesCount: result.data?.images?.length || 0,
        requestId: (result as any).requestId,
        fullResultKeys: result ? Object.keys(result) : [],
        dataKeys: result.data ? Object.keys(result.data) : [],
        firstImageUrl: result.data?.images?.[0]?.url?.substring(0, 50) + '...' || 'N/A',
        resultStringified: JSON.stringify(result).substring(0, 500) + '...'
      });

      if (!result.data) {
        console.error('❌ FAL subscribe returned no data:', {
          fullResult: result,
          resultKeys: Object.keys(result),
          resultStringified: JSON.stringify(result)
        });
        throw new Error('FAL API returned no data - this may indicate a service issue or invalid request');
      }

      // 🔍 检查data结构
      if (!result.data.images) {
        console.error('❌ FAL subscribe data has no images:', {
          dataKeys: Object.keys(result.data),
          dataStringified: JSON.stringify(result.data)
        });
        
        // 🔍 尝试查找其他可能的图片字段
        const possibleFields = ['image', 'output', 'result'];
        for (const field of possibleFields) {
          if ((result.data as any)[field]) {
            console.log(`🔍 Found potential images in data.${field}:`, (result.data as any)[field]);
            if (Array.isArray((result.data as any)[field])) {
              (result.data as any).images = (result.data as any)[field];
              break;
            } else if (typeof (result.data as any)[field] === 'string') {
              (result.data as any).images = [{ url: (result.data as any)[field] }];
              break;
            }
          }
        }
        
        if (!result.data.images) {
          throw new Error('FAL API returned data without images field');
        }
      }

      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("❌ Flux Pro text-to-image error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          prompt: input.prompt?.substring(0, 100) + '...',
          aspect_ratio: input.aspect_ratio
        }
      });
      throw error;
    }
  }

  /**
   * 上传文件到存储服务
   * 🔧 同时上传到FAL和R2存储，优先使用FAL存储链接
   */
  static async uploadFile(file: File): Promise<string> {
    try {
      console.log("📤 Starting dual storage upload:", file.name);
      
      // 🔧 优先上传到FAL存储（确保API兼容性）
      let falUrl: string | null = null;
      let r2Url: string | null = null;
      
      try {
        console.log("📤 Uploading to FAL storage (primary):", file.name);
        falUrl = await fal.storage.upload(file);
        console.log("✅ FAL upload successful:", falUrl);
      } catch (falError) {
        console.error("❌ FAL upload failed:", falError);
      }
      
      // 🔧 同时尝试上传到R2存储（备份和用户查看）
      const isR2Enabled = process.env.NEXT_PUBLIC_ENABLE_R2 === "true";
      const hasR2Config = process.env.R2_ACCOUNT_ID && 
                         process.env.R2_ACCESS_KEY_ID && 
                         process.env.R2_SECRET_ACCESS_KEY &&
                         process.env.R2_BUCKET_NAME;

      if (isR2Enabled && hasR2Config) {
        try {
          console.log("📤 Uploading to R2 storage (backup):", file.name);
          r2Url = await r2Storage.uploadFile(file);
          console.log("✅ R2 upload successful:", r2Url);
        } catch (r2Error) {
          console.warn("⚠️ R2 upload failed (non-critical):", r2Error);
        }
      } else {
        console.log("ℹ️ R2 storage not configured, skipping R2 upload");
      }
      
      // 🔧 优先返回FAL URL，如果FAL失败则返回R2 URL
      if (falUrl) {
        console.log("🎯 Using FAL URL as primary:", falUrl);
        if (r2Url) {
          console.log("📋 R2 URL available as backup:", r2Url);
        }
        return falUrl;
      } else if (r2Url) {
        console.log("🎯 FAL failed, using R2 URL as fallback:", r2Url);
        return r2Url;
      } else {
        throw new Error("Both FAL and R2 storage uploads failed");
      }
      
    } catch (error) {
      console.error("❌ Dual storage upload failed:", error);
      throw error;
    }
  }

  /**
   * 将AI生成的图片保存到R2存储
   * @param imageUrl AI生成的图片URL
   * @param prompt 生成提示词
   */
  static async saveGeneratedImageToR2(imageUrl: string, prompt: string): Promise<string> {
    try {
      // 检查是否启用R2存储
      const isR2Enabled = process.env.NEXT_PUBLIC_ENABLE_R2 === "true";
      const hasR2Config = process.env.R2_ACCOUNT_ID && 
                         process.env.R2_ACCESS_KEY_ID && 
                         process.env.R2_SECRET_ACCESS_KEY &&
                         process.env.R2_BUCKET_NAME;

      if (!isR2Enabled || !hasR2Config) {
        console.log("ℹ️ R2 storage not configured, returning original URL");
        return imageUrl; // 如果R2未配置，返回原始URL
      }

      console.log("📤 Saving AI generated image to R2:", imageUrl);
      
      // 使用R2存储的uploadFromUrl方法
      const result = await r2Storage.uploadFromUrl(imageUrl, prompt);
      
      console.log("✅ AI generated image saved to R2 successfully:", result);
      return result;
      
    } catch (error) {
      console.error("❌ Failed to save AI generated image to R2:", error);
      // 如果保存失败，返回原始URL
      return imageUrl;
    }
  }

  /**
   * 队列提交（用于长时间运行的请求）
   */
  static async submitToQueue(endpoint: string, input: any): Promise<{ request_id: string }> {
    try {
      const result = await fal.queue.submit(endpoint, {
        input,
        webhookUrl: process.env.NEXT_PUBLIC_SITE_URL + "/api/webhooks/fal"
      });
      return result;
    } catch (error) {
      console.error("Queue submission error:", error);
      throw error;
    }
  }

  /**
   * 检查队列状态
   */
  static async checkQueueStatus(endpoint: string, requestId: string): Promise<any> {
    try {
      const status = await fal.queue.status(endpoint, {
        requestId,
        logs: true,
      });
      return status;
    } catch (error) {
      console.error("Queue status check error:", error);
      throw error;
    }
  }

  /**
   * 获取队列结果
   */
  static async getQueueResult(endpoint: string, requestId: string): Promise<FluxKontextResult> {
    try {
      const result = await fal.queue.result(endpoint, {
        requestId
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("Queue result retrieval error:", error);
      throw error;
    }
  }

  /**
   * FLUX.1 [schnell] - 文本生成图像
   * 超快速生成，1-4步完成
   */
  static async textToImageSchnell(input: FluxKontextTextToImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 转换参数格式：FLUX Schnell端点使用image_size而不是aspect_ratio
      const schnellInput = {
        prompt: input.prompt,
        seed: input.seed,
        sync_mode: input.sync_mode,
        num_images: input.num_images,
        output_format: input.output_format,
        // 🔧 将aspect_ratio转换为image_size格式
        image_size: this.convertAspectRatioToImageSize(input.aspect_ratio),
        // 🔧 Schnell模型使用较少的推理步骤
        num_inference_steps: 4
      };

      console.log(`🚀 Starting textToImageSchnell with converted input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        original_aspect_ratio: input.aspect_ratio,
        converted_image_size: schnellInput.image_size,
        endpoint: FLUX_ENDPOINTS.FLUX_SCHNELL
      });

      const result = await fal.subscribe(FLUX_ENDPOINTS.FLUX_SCHNELL, {
        input: schnellInput,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("Flux Schnell text-to-image error:", error);
      throw error;
    }
  }

  /**
   * FLUX.1 [dev] - 文本生成图像
   * 开发模型，平衡质量和速度
   */
  static async textToImageDev(input: FluxKontextTextToImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 转换参数格式：FLUX General端点使用image_size而不是aspect_ratio
      const fluxInput = {
        prompt: input.prompt,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        sync_mode: input.sync_mode,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        // 🔧 将aspect_ratio转换为image_size格式
        image_size: this.convertAspectRatioToImageSize(input.aspect_ratio)
      };

      console.log(`🚀 Starting textToImageDev with converted input:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        original_aspect_ratio: input.aspect_ratio,
        converted_image_size: fluxInput.image_size,
        endpoint: FLUX_ENDPOINTS.FLUX_GENERAL
      });

      const result = await fal.subscribe(FLUX_ENDPOINTS.FLUX_GENERAL, {
        input: fluxInput,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("Flux Dev text-to-image error:", error);
      throw error;
    }
  }

  /**
   * FLUX Realism - 文本生成图像
   * 照片级真实感图像生成
   */
  static async textToImageRealism(input: FluxKontextTextToImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 使用FLUX General端点和LoRA实现真实感风格
      const realismInput = {
        prompt: input.prompt,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        sync_mode: input.sync_mode,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        // 🔧 将aspect_ratio转换为image_size格式
        image_size: this.convertAspectRatioToImageSize(input.aspect_ratio),
        // 🔧 使用LoRA实现真实感风格
        loras: [
          {
            path: "https://huggingface.co/XLabs-AI/flux-RealismLora/resolve/main/lora.safetensors",
            scale: 0.8
          }
        ]
      };

      console.log(`🚀 Starting textToImageRealism with LoRA:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        endpoint: FLUX_ENDPOINTS.FLUX_GENERAL,
        loras: realismInput.loras
      });
      
      const result = await fal.subscribe(FLUX_ENDPOINTS.FLUX_GENERAL, {
        input: realismInput,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("Flux Realism text-to-image error:", error);
      throw error;
    }
  }

  /**
   * FLUX Anime - 文本生成图像
   * 动漫风格图像生成
   */
  static async textToImageAnime(input: FluxKontextTextToImageInput): Promise<FluxKontextResult> {
    try {
      // 🔧 使用FLUX General端点和LoRA实现动漫风格
      const animeInput = {
        prompt: input.prompt,
        seed: input.seed,
        guidance_scale: input.guidance_scale,
        sync_mode: input.sync_mode,
        num_images: input.num_images,
        safety_tolerance: input.safety_tolerance,
        output_format: input.output_format,
        // 🔧 将aspect_ratio转换为image_size格式
        image_size: this.convertAspectRatioToImageSize(input.aspect_ratio),
        // 🔧 使用LoRA实现动漫风格
        loras: [
          {
            path: "https://huggingface.co/Shakker-Labs/FLUX.1-dev-LoRA-AnimeStyle/resolve/main/FLUX-dev-lora-AnimeStyle.safetensors",
            scale: 0.9
          }
        ]
      };

      console.log(`🚀 Starting textToImageAnime with LoRA:`, {
        prompt: input.prompt?.substring(0, 100) + '...',
        endpoint: FLUX_ENDPOINTS.FLUX_GENERAL,
        loras: animeInput.loras
      });
      
      const result = await fal.subscribe(FLUX_ENDPOINTS.FLUX_GENERAL, {
        input: animeInput,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join("\n"));
          }
        },
      });
      return result.data as FluxKontextResult;
    } catch (error) {
      console.error("Flux Anime text-to-image error:", error);
      throw error;
    }
  }

  /**
   * 将aspect_ratio转换为image_size格式
   */
  static convertAspectRatioToImageSize(aspect_ratio?: string): "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | undefined {
    if (!aspect_ratio) return "landscape_4_3"; // 默认值

    // 将aspect_ratio转换为FAL API支持的image_size枚举
    switch (aspect_ratio) {
      case "1:1":
        return "square_hd";
      case "4:3":
        return "landscape_4_3";
      case "3:4":
        return "portrait_4_3";
      case "16:9":
        return "landscape_16_9";
      case "9:16":
        return "portrait_16_9";
      case "21:9":
        return "landscape_16_9"; // 21:9映射到16:9，因为FAL不支持21:9
      case "9:21":
        return "portrait_16_9"; // 9:21映射到9:16，因为FAL不支持9:21
      case "3:2":
        return "landscape_4_3"; // 3:2映射到4:3
      case "2:3":
        return "portrait_4_3"; // 2:3映射到3:4
      default:
        return "landscape_4_3"; // 默认横向4:3
    }
  }
}
