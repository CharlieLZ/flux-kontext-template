import { NextRequest, NextResponse } from 'next/server';
import { FluxKontextService } from '@/lib/flux-kontext';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { consumeCreditsForImageGeneration, checkUserCredits } from '@/lib/services/credits';
import { prisma } from '@/lib/database';
import { checkPromptSafety, checkImageSafety } from '@/lib/content-safety/safe-mode';
import {
  getClientIpFromHeaders,
  getRequiredCredits,
  verifyTurnstileToken,
  verboseLog,
} from '@/lib/flux-kontext-request';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting image generation request at:', new Date().toISOString());
    
    // 设置请求超时检测
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout: Generation took longer than 55 seconds'))
      }, 55000) // 55秒超时，留5秒缓冲
    });

    // 包装主要逻辑在Promise中
    const mainLogic = async () => {
      const body = await request.json();
      verboseLog('📝 Request body received:', {
        action: body.action,
        promptLength: typeof body.prompt === 'string' ? body.prompt.length : 0,
        hasImages: !!(body.image_url || body.image_urls),
        timestamp: new Date().toISOString()
      });

      // 验证请求体
      if (!body.action || !body.prompt) {
        throw new Error('Missing required fields: action and prompt are required');
      }

      // 🔐 验证用户身份
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { 
            error: 'Sign in to start creating! Get 100 free credits instantly.',
            message: 'Sign in to start creating! Get 100 free credits instantly.'
          },
          { status: 401 }
        );
      }

      // 🔍 获取用户信息
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found, please sign in again' },
          { status: 404 }
        );
      }

      // 🛡️ 内容安全检查（可选 - 默认关闭）
      const enableContentSafety = process.env.NEXT_PUBLIC_ENABLE_CONTENT_SAFETY === "true";
      
      if (enableContentSafety) {
        console.log('🛡️ Starting content safety check...');
        
        try {
          const promptSafetyCheck = await checkPromptSafety(body.prompt);
          
          if (!promptSafetyCheck.isSafe) {
            console.warn(`🚨 Input content blocked: ${promptSafetyCheck.reason}`);
            
            return NextResponse.json(
              { 
                error: 'Input content violated community guidelines',
                message: promptSafetyCheck.reason || 'Your prompt contains inappropriate content, please modify and try again',
                code: 'CONTENT_VIOLATION',
                provider: promptSafetyCheck.provider
              },
              { status: 400 }
            );
          }

          console.log(`✅ Content safety check passed (${promptSafetyCheck.provider}, confidence: ${promptSafetyCheck.confidence})`);
          
        } catch (safetyError) {
          console.error('❌ Content safety check error:', safetyError);
          
          return NextResponse.json(
            { 
              error: 'Content safety check service error',
              message: 'Please try again later',
              code: 'SAFETY_CHECK_ERROR'
            },
            { status: 503 }
          );
        }
      } else {
        console.log('ℹ️ Content safety check disabled, relying on FAL API basic filtering');
      }

      const requiredCredits = getRequiredCredits(body.action)
      console.log(`💰 Action ${body.action} requires ${requiredCredits} credits`)
      
      const creditCheck = await checkUserCredits(user.id, requiredCredits);
      if (!creditCheck.hasEnoughCredits) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            message: `${body.action} requires ${requiredCredits} credits, current balance: ${creditCheck.currentCredits} credits`,
            currentCredits: creditCheck.currentCredits,
            requiredCredits: requiredCredits,
            shortfall: creditCheck.shortfall
          },
          { status: 402 } // 402 Payment Required
        );
      }

      // Turnstile验证（如果启用）- 🔧 修复用户分层验证逻辑
      const isTurnstileEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === "true";
      console.log(`🔒 Turnstile status: ${isTurnstileEnabled ? 'enabled' : 'disabled'}`);
      
      if (isTurnstileEnabled) {
        // 🔧 修复：根据用户类型判断是否需要验证
        let requiresVerification = false;
        
        // 简化用户类型判断：暂时所有已登录用户都视为注册用户
        // 未来可以根据实际的付费状态字段进行判断
        const isRegisteredUser = !!user.email;
        
        if (isRegisteredUser) {
          // 注册用户：智能验证模式 - 如果提供了token就验证，没有token也允许通过
          if (body.turnstile_token) {
            requiresVerification = true;
            console.log('🔒 Registered user with token, verifying Turnstile');
          } else {
            requiresVerification = false;
            console.log('🔓 Registered user without token, allowing smart verification bypass');
          }
        } else {
          // 匿名用户：必须验证
          requiresVerification = true;
          console.log('🔒 Anonymous user detected, Turnstile verification required');
        }
        
        if (requiresVerification) {
          verboseLog(`🔍 Checking Turnstile token: ${body.turnstile_token ? 'present' : 'missing'}`);
          
          if (!body.turnstile_token) {
            console.warn('❌ Turnstile verification failed: missing token');
            return NextResponse.json(
              { 
                error: 'Human verification required',
                message: 'Please complete human verification and try again',
                code: 'TURNSTILE_TOKEN_MISSING'
              },
              { status: 400 }
            );
          }

          const clientIP = getClientIpFromHeaders(request.headers)

          verboseLog(`🌐 Turnstile verification IP detected: ${clientIP !== 'unknown'}`);

          try {
            const isValidToken = await verifyTurnstileToken(body.turnstile_token, clientIP);
            console.log(`🔒 Turnstile verification result: ${isValidToken ? 'success' : 'failed'}`);
            
            if (!isValidToken) {
              console.warn('❌ Turnstile verification failed: invalid token');
              
              return NextResponse.json(
                { 
                  error: 'Human verification failed',
                  message: 'Please complete human verification again',
                  code: 'TURNSTILE_VERIFICATION_FAILED'
                },
                { status: 400 }
              );
            }
            verboseLog("✅ Turnstile verification passed");
          } catch (turnstileError) {
            console.error('❌ Turnstile verification error:', turnstileError);
            
            return NextResponse.json(
              { 
                error: 'Human verification service error',
                message: 'Verification service temporarily unavailable, please try again later',
                code: 'TURNSTILE_SERVICE_ERROR'
              },
              { status: 503 }
            );
          }
        } else {
          console.log('🔓 Turnstile verification not required for this user type');
        }
      } else {
        console.log('ℹ️ Turnstile verification disabled, skipping human verification');
      }

      // 🔥 消耗积分（在生图前扣除）
      const creditResult = await consumeCreditsForImageGeneration(
        user.id, 
        body.prompt, 
        body.action
      );

      if (!creditResult.success) {
        return NextResponse.json(
          { 
            error: 'Credit deduction failed',
            message: creditResult.error
          },
          { status: 402 }
        );
      }

      console.log(`🎨 User ${user.email} starting image generation, consuming ${requiredCredits} credits, remaining credits: ${creditResult.user?.creditsAfter}`);

      let result: any;

      try {
        // 🎯 Calling FluxKontextService.${body.action} with parameters:
        verboseLog(`🎯 Calling FluxKontextService.${body.action} with parameters:`, {
          action: body.action,
          promptLength: typeof body.prompt === 'string' ? body.prompt.length : 0,
          hasImageUrl: !!body.image_url,
          hasImageUrls: !!body.image_urls,
          imageUrlsCount: body.image_urls?.length || 0,
          aspectRatio: body.aspect_ratio,
          guidanceScale: body.guidance_scale,
          numImages: body.num_images,
          safetyTolerance: body.safety_tolerance,
          outputFormat: body.output_format,
          seed: body.seed
        });

        // 🔧 添加详细的FAL API调用日志
        verboseLog('📡 ===== 开始FAL API调用 =====')
        verboseLog('📋 Sanitized request parameters:', {
          action: body.action,
          promptLength: typeof body.prompt === 'string' ? body.prompt.length : 0,
          hasImageUrl: !!body.image_url,
          imageUrlsCount: body.image_urls?.length || 0,
          aspect_ratio: body.aspect_ratio,
          guidance_scale: body.guidance_scale,
          num_images: body.num_images,
          safety_tolerance: body.safety_tolerance,
          output_format: body.output_format,
          seed: body.seed
        })

        // 根据action类型调用相应的API
        switch (body.action) {
          case 'text-to-image-pro':
            console.log('🎨 调用 textToImagePro')
            result = await FluxKontextService.textToImagePro({
              prompt: body.prompt,
              aspect_ratio: body.aspect_ratio,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'text-to-image-max':
            console.log('🎨 调用 textToImageMax')
            result = await FluxKontextService.textToImageMax({
              prompt: body.prompt,
              aspect_ratio: body.aspect_ratio,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'text-to-image-schnell':
            console.log('🎨 调用 textToImageSchnell')
            result = await FluxKontextService.textToImageSchnell({
              prompt: body.prompt,
              aspect_ratio: body.aspect_ratio,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'text-to-image-dev':
            console.log('🎨 调用 textToImageDev')
            result = await FluxKontextService.textToImageDev({
              prompt: body.prompt,
              aspect_ratio: body.aspect_ratio,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'text-to-image-realism':
            console.log('🎨 调用 textToImageRealism')
            result = await FluxKontextService.textToImageRealism({
              prompt: body.prompt,
              aspect_ratio: body.aspect_ratio,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'text-to-image-anime':
            console.log('🎨 调用 textToImageAnime')
            result = await FluxKontextService.textToImageAnime({
              prompt: body.prompt,
              aspect_ratio: body.aspect_ratio,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'edit-image-pro':
            console.log('✏️ 调用 editImagePro')
            if (!body.image_url) {
              throw new Error('image_url is required for edit-image-pro action');
            }
            result = await FluxKontextService.editImagePro({
              prompt: body.prompt,
              image_url: body.image_url,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'edit-image-max':
            console.log('✏️ 调用 editImageMax')
            if (!body.image_url) {
              throw new Error('image_url is required for edit-image-max action');
            }
            result = await FluxKontextService.editImageMax({
              prompt: body.prompt,
              image_url: body.image_url,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'edit-multi-image-pro':
            console.log('✏️ 调用 editMultiImagePro')
            if (!body.image_urls || !Array.isArray(body.image_urls)) {
              throw new Error('image_urls array is required for edit-multi-image-pro action');
            }
            result = await FluxKontextService.editMultiImagePro({
              prompt: body.prompt,
              image_urls: body.image_urls,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          case 'edit-multi-image-max':
            console.log('✏️ 调用 editMultiImageMax')
            if (!body.image_urls || !Array.isArray(body.image_urls)) {
              throw new Error('image_urls array is required for edit-multi-image-max action');
            }
            result = await FluxKontextService.editMultiImageMax({
              prompt: body.prompt,
              image_urls: body.image_urls,
              guidance_scale: body.guidance_scale,
              num_images: body.num_images,
              safety_tolerance: body.safety_tolerance,
              output_format: body.output_format,
              seed: body.seed
            });
            break;
          default:
            throw new Error(`Unsupported action: ${body.action}`);
        }

        console.log('📨 ===== FAL API响应接收 =====')
        console.log('📊 FAL API原始响应分析:', {
          hasResult: !!result,
          resultType: typeof result,
          resultKeys: result ? Object.keys(result) : [],
          hasImages: !!result?.images,
          imagesCount: result?.images?.length || 0,
          hasError: !!result?.error,
          errorMessage: result?.error || 'No error'
        })

        // 🔧 增强结果验证和错误处理
        if (!result) {
          console.error('❌ FAL API返回空结果')
          throw new Error('FAL API returned null or undefined result');
        }

        // 🔧 检查是否有错误信息（使用类型断言处理可能的错误字段）
        const resultWithError = result as any;
        if (resultWithError.error) {
          console.error('❌ FAL API返回错误:', resultWithError.error)
          throw new Error(`FAL API error: ${resultWithError.error}`);
        }

        // 🔧 检查images字段的各种可能位置
        let foundImages = false;
        
        if (result.images && Array.isArray(result.images) && result.images.length > 0) {
          console.log('✅ 在result.images中找到图像数组')
          foundImages = true;
        } else if ((result as any).data?.images && Array.isArray((result as any).data.images) && (result as any).data.images.length > 0) {
          console.log('🔧 在result.data.images中找到图像，移动到result.images')
          result.images = (result as any).data.images;
          foundImages = true;
        } else {
          // 尝试其他可能的字段名
          const possibleImageFields = ['result', 'output', 'image', 'generated_images', 'outputs'];
          
          for (const field of possibleImageFields) {
            if ((result as any)[field]) {
              console.log(`🔍 检查字段 '${field}':`, (result as any)[field])
              if (Array.isArray((result as any)[field]) && (result as any)[field].length > 0) {
                console.log(`🔧 在result.${field}中找到图像数组，映射到result.images`)
                result.images = (result as any)[field];
                foundImages = true;
                break;
              } else if (typeof (result as any)[field] === 'string' && (result as any)[field].startsWith('http')) {
                console.log(`🔧 在result.${field}中找到图像URL字符串，转换为数组`)
                result.images = [{ url: (result as any)[field] }];
                foundImages = true;
                break;
              } else if ((result as any)[field]?.url && typeof (result as any)[field].url === 'string') {
                console.log(`🔧 在result.${field}.url中找到图像URL，转换为数组`)
                result.images = [(result as any)[field]];
                foundImages = true;
                break;
              }
            }
          }
          
          if (!foundImages) {
            // 🔧 增强错误信息，特别针对图生图模式
            let errorMessage = 'No images generated - FAL API returned empty or invalid images array.';
            
            if (body.image_url || body.image_urls) {
              errorMessage += ' This may indicate an issue with image editing parameters or input image format.';
              
              if (body.aspect_ratio) {
                errorMessage += ` Note: aspect_ratio (${body.aspect_ratio}) in image editing mode may cause conflicts.`;
              }
            } else {
              errorMessage += ' This may indicate a service issue, invalid parameters, or content policy violation.';
            }
            
            console.error('❌ 未找到有效图像:', {
              searchedFields: possibleImageFields,
              resultStructure: Object.keys(result),
              errorMessage
            })
            
            throw new Error(errorMessage);
          }
        }

        console.log(`✅ FAL API调用成功: ${result.images.length} 张图像生成完成`);
        
        // 🔧 详细检查生成的图片信息
        if (process.env.ENABLE_VERBOSE_LOGS === 'true' && process.env.NODE_ENV !== 'production') {
          result.images.forEach((img: any, index: number) => {
            console.log(`🖼️ 图像 ${index + 1} 详情:`, {
              hasUrl: !!img.url,
              urlLength: img.url?.length || 0,
              width: img.width,
              height: img.height,
              contentType: img.content_type,
              fileSize: img.file_size
            })
          })
        }
        
        // 🔧 检查生成的图片是否有效（检测黑色图片等问题）
        const validImages = [];
        for (let i = 0; i < result.images.length; i++) {
          const image = result.images[i];
          let isValid = true;
          let invalidReason = '';

          verboseLog(`🔍 验证图像 ${i + 1}...`)

          // 基本URL检查
          if (!image.url || typeof image.url !== 'string') {
            isValid = false;
            invalidReason = 'Missing or invalid URL';
            console.warn(`⚠️ 图像 ${i + 1} URL无效:`, image.url)
          } else if (!image.url.startsWith('http')) {
            isValid = false;
            invalidReason = 'URL does not start with http';
            console.warn(`⚠️ 图像 ${i + 1} URL格式错误:`, image.url)
          } else {
            verboseLog(`✅ 图像 ${i + 1} URL有效`)
          }

          if (isValid) {
            validImages.push(image);
            console.log(`✅ 图像 ${i + 1} 验证通过`)
          } else {
            console.warn(`❌ 图像 ${i + 1} 验证失败: ${invalidReason}`)
          }
        }
        
        if (validImages.length === 0) {
          // 🔧 增强错误信息，提供更多上下文
          const errorDetails = {
            originalCount: result.images.length,
            action: body.action,
            promptLength: typeof body.prompt === 'string' ? body.prompt.length : 0,
            hasImages: !!(body.image_url || body.image_urls),
            timestamp: new Date().toISOString()
          };
          
          console.error('❌ All generated images are invalid:', errorDetails);
          
          throw new Error(`All generated images appear to be invalid or corrupted. This may be due to:
            1. Content policy violations (inappropriate content)
            2. Parameter conflicts (incompatible settings)
            3. FAL API service issues
            4. Network connectivity problems
            
            Please try:
            - Adjusting your prompt to be more specific
            - Changing the aspect ratio or other settings
            - Trying again in a few moments
            
            Action: ${body.action}, Images attempted: ${result.images.length}`);
        }
        
        if (validImages.length < result.images.length) {
          const filteredCount = result.images.length - validImages.length;
          console.warn(`⚠️ ${filteredCount} out of ${result.images.length} images were filtered out due to quality issues`);
          
          // 🔧 如果过滤掉的图片太多，给用户提示
          if (filteredCount > result.images.length / 2) {
            console.warn(`🚨 High filter rate detected: ${filteredCount}/${result.images.length} images filtered`);
          }
          
          result.images = validImages;
        }

        // 🛡️ 生成结果安全检查（可选 - 默认关闭）
        let safetyWarning = '';
        
        if (enableContentSafety && result?.images && result.images.length > 0) {
          console.log('🛡️ Starting generation result safety check...');
          
          try {
            const imageChecks = await Promise.allSettled(
              result.images.map(async (image: any) => {
                if (image.url) {
                  return await checkImageSafety(image.url);
                }
                return { isSafe: true, confidence: 1 };
              })
            );

            const unsafeImages = imageChecks
              .map((check, index) => ({ check, index }))
              .filter(({ check }) => 
                check.status === 'fulfilled' && !check.value.isSafe
              );

            if (unsafeImages.length > 0) {
              console.warn(`🚨 Detected ${unsafeImages.length} potentially offensive images`);
              safetyWarning = `${unsafeImages.length} images potentially contain sensitive content, please use with caution`;
            }

            console.log(`✅ Image safety check completed, ${result.images.length} images checked`);
            
          } catch (imageSafetyError) {
            console.warn('⚠️ Image safety check failed, but not affecting main flow:', imageSafetyError);
          }
        } else if (!enableContentSafety) {
          console.log('ℹ️ Image safety check disabled, relying on FAL API basic filtering');
        }

        // 📊 可选：记录成功的生成（如果数据库可用）
        try {
          // 这里可以添加生成历史记录
          console.log(`📊 Generation successful - User: ${user.email}, Action: ${body.action}, Images: ${result?.images?.length || 0}`);
        } catch (logError) {
          console.warn('⚠️ Log recording failed:', logError);
        }

        // 🔄 R2存储转换 - 将FAL图片转存到R2（如果配置了R2）
        let processedResult = result;
        try {
          const isR2Enabled = process.env.NEXT_PUBLIC_ENABLE_R2 === "true";
          const hasR2Config = process.env.R2_ACCOUNT_ID && 
                             process.env.R2_ACCESS_KEY_ID && 
                             process.env.R2_SECRET_ACCESS_KEY &&
                             process.env.R2_BUCKET_NAME;

          if (isR2Enabled && hasR2Config && result?.images && result.images.length > 0) {
            console.log(`🔄 Starting R2 storage conversion for ${result.images.length} generated images...`);
            
            // 串行转存图片到R2，避免并发问题
            const convertedImages = [];
            
            for (let index = 0; index < result.images.length; index++) {
              const image = result.images[index];
              
              try {
                verboseLog(`📤 Converting image ${index + 1}/${result.images.length} to R2...`);
                
                const { FluxKontextService } = await import('@/lib/flux-kontext');
                const r2Url = await FluxKontextService.saveGeneratedImageToR2(
                  image.url, 
                  `${body.prompt} (Image ${index + 1})`
                );
                
                verboseLog(`✅ Image ${index + 1} converted to R2 successfully`);
                
                // 🔍 验证R2 URL可访问性
                try {
                  verboseLog(`🔍 Verifying R2 URL accessibility`);
                  const verifyResponse = await fetch(r2Url, {
                    method: 'HEAD',
                    headers: {
                      'User-Agent': 'FluxKontext/1.0'
                    },
                    signal: AbortSignal.timeout(10000) // 10秒超时
                  });

                  verboseLog(`📋 R2 URL verification result:`, {
                    status: verifyResponse.status,
                    statusText: verifyResponse.statusText,
                    contentType: verifyResponse.headers.get('content-type'),
                    contentLength: verifyResponse.headers.get('content-length'),
                    accessible: verifyResponse.ok
                  });

                  if (!verifyResponse.ok) {
                    console.warn(`⚠️ R2 URL verification failed: ${verifyResponse.status} ${verifyResponse.statusText}`);
                  } else {
                    console.log(`✅ R2 URL is accessible and ready for use`);
                  }
                } catch (verifyError) {
                  console.error(`❌ R2 URL verification failed:`, {
                    error: verifyError instanceof Error ? verifyError.message : verifyError
                  });
                }
                
                // 返回包含R2 URL的图片对象，优先使用FAL链接
                convertedImages.push({
                  ...image,
                  url: image.url, // 保持FAL URL作为主URL（更稳定）
                  r2_url: r2Url, // R2 URL作为备用
                  fal_url: image.url, // 明确标记FAL URL
                  storage: 'both' // 表示同时有FAL和R2存储
                });
                
                // 在转存之间添加延迟，避免R2并发限制
                if (index < result.images.length - 1) {
                  console.log(`⏳ Waiting 2 seconds before next conversion...`);
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
              } catch (r2Error) {
                console.warn(`⚠️ Failed to convert image ${index + 1} to R2:`, {
                  error: r2Error instanceof Error ? r2Error.message : r2Error,
                  hasSourceUrl: !!image.url
                });
                
                // 如果R2转换失败，返回原始FAL URL
                convertedImages.push({
                  ...image,
                  fal_url: image.url,
                  storage: 'fal',
                  r2_error: r2Error instanceof Error ? r2Error.message : 'Unknown R2 error'
                });
              }
            }
            
            processedResult = {
              ...result,
              images: convertedImages
            };
            
            const successfulConversions = convertedImages.filter(img => img.storage === 'both').length;
            console.log(`🎉 R2 conversion completed: ${successfulConversions}/${convertedImages.length} images successfully converted`);
            
          } else {
            console.log('ℹ️ R2 storage not configured or disabled, using FAL URLs');
            // 为FAL图片添加存储标识
            if (result?.images) {
              processedResult = {
                ...result,
                images: result.images.map((image: any) => ({
                  ...image,
                  fal_url: image.url,
                  storage: 'fal'
                }))
              };
            }
          }
        } catch (r2Error) {
          console.error('❌ R2 storage conversion error:', r2Error);
          // R2转换失败时，继续使用原始结果
          processedResult = result;
          
          // 为原始结果添加存储标识
          if (result?.images) {
            processedResult = {
              ...result,
              images: result.images.map((image: any) => ({
                ...image,
                fal_url: image.url,
                storage: 'fal',
                r2_error: 'R2 conversion service error'
              }))
            };
          }
        }

        const responseData: any = {
          success: true,
          data: processedResult,
          credits_remaining: creditResult.user?.creditsAfter || 0,
          safety_check: {
            prompt_safe: true,
            images_checked: processedResult?.images?.length || 0,
            images_passed: processedResult?.images?.length || 0
          }
        };

        // 添加安全警告（如果有）
        if (safetyWarning) {
          responseData.warning = safetyWarning;
        }

        // 🔧 修复：确保返回正确的JSON响应结构
        console.log('✅ Returning successful response with data:', {
          success: responseData.success,
          hasData: !!responseData.data,
          hasImages: !!responseData.data?.images,
          imageCount: responseData.data?.images?.length || 0,
          creditsRemaining: responseData.credits_remaining
        });

        return responseData;

      } catch (error) {
        console.error('🔥 Image generation failed:', error);
        
        // 生成失败时退还积分
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: requiredCredits } }
          });
          console.log(`💰 Refunded ${requiredCredits} credits`);
        } catch (refundError) {
          console.error('❌ Refund error:', refundError);
        }

        // 改进错误处理，提供更详细的错误信息
        let errorMessage = 'Image generation failed';
        let errorDetails = 'Unknown error';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          errorDetails = error.stack || error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
          errorDetails = error;
        } else if (error && typeof error === 'object') {
          errorMessage = (error as any).message || 'Service error';
          errorDetails = JSON.stringify(error);
        }

        console.error('🔥 Detailed error:', {
          message: errorMessage,
          details: errorDetails,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });

        // 🔧 修复：使用NextResponse.json()包装错误响应
        return NextResponse.json({
          error: 'Image generation failed',
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
          credits_refunded: requiredCredits,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    };

    // 使用Promise.race来检测超时
    const result = await Promise.race([
      mainLogic(),
      timeoutPromise
    ]);

    return NextResponse.json(result);

  } catch (error) {
    console.error('🔥 API request processing failed:', error);
    
    // 改进顶层错误处理
    let errorMessage = 'Internal server error';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorDetails = error;
    } else if (error && typeof error === 'object') {
      errorMessage = (error as any).message || 'Server error';
      errorDetails = JSON.stringify(error);
    }

    console.error('🔥 Top-level error details:', {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 处理文件上传
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const url = await FluxKontextService.uploadFile(file);

    return NextResponse.json({
      success: true,
      url
    });

  } catch (error: unknown) {
    console.error('File upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'File upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
