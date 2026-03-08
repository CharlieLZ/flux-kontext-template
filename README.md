# Flux Kontext Template

An open-source Next.js starter for AI image-generation products.

一句人话：
这不是“炫技 demo”，而是一套能让你把 AI 图像产品更快搭起来的基础盘。
它已经把登录、积分、支付、图片生成、对象存储、多语言这些高频脏活先铺好了。

许可证先说在前面：
- 当前仓库就是标准 [MIT License](./LICENSE)
- 可以商用、可以修改、可以二次分发
- 但你要保留原始许可证声明

如果把做网站比作开店：
- `Next.js` 是门店主体
- `Supabase` 是账本和会员系统
- `NextAuth` 是门禁
- `fal / KIE / WaveSpeed` 是后厨出图引擎
- `Stripe / Creem` 是收银台
- `Cloudflare R2` 是仓库

你不需要从地基开始浇。
你只需要决定：这家店卖什么、给谁卖、定价多少、视觉长什么样。

## 1. 这仓库适合谁

适合：
- 想做 AI 图像生成站的人
- 想做 AI 图片编辑站的人
- 想要“可登录、可收费、可上线”的模板，而不是只会本地跑的玩具项目的人
- 想基于 `fal`，同时保留以后切 `KIE / WaveSpeed` 能力的人

不太适合：
- 完全不想碰环境变量、不想注册第三方服务的人
- 只想写一个纯静态落地页的人

## 2. 你能得到什么

开箱就有：
- `Next.js 15 + React 18 + TypeScript`
- Google 登录
- 积分系统
- AI 图像生成 / 编辑入口
- `fal / KIE / WaveSpeed` provider 适配层
- `Stripe / Creem` 支付接入
- Supabase 数据库
- Cloudflare Turnstile 防滥用
- Cloudflare R2 文件存储
- 多语言页面骨架
- 基础 SEO、Analytics、部署脚手架

## 2.1 支付和数据库现状

### 支付现在到底支持几个

当前**真正接好的支付提供商是 2 个**：
- `Stripe`
- `Creem`

另外有个容易误会的点：
- 仓库里有个通用 webhook 路由提到了 `paypal`
- 但它现在还是预留分支，不是完整生产接入
- 所以最终口径按 **2 个已支持支付** 来算，不按 3 个写

大白话：
- 真正在营业的收银台有两台：`Stripe` 和 `Creem`
- `PayPal` 现在更像“柜台上留了个插座”，不是已经通电的机器

### 数据库现在到底是什么

当前数据库主方案是：
- `Supabase PostgreSQL`

再拆开说：
- 认证：`Supabase Auth` + `NextAuth`
- 业务数据：`Supabase PostgreSQL`
- 代码访问层：自己写的一层 **Prisma 风格适配器**

关键提醒：
- [src/lib/database.ts](./src/lib/database.ts) 里导出了一个叫 `prisma` 的对象
- 但它**不是 Prisma ORM**
- 它只是“长得像 Prisma”的 Supabase 适配层

这点一定要记住，不然后面很容易误判成：
- “是不是少装了 Prisma”
- “是不是还缺 `schema.prisma`”

答案是：
- 不是
- 这仓库当前主路就是 `Supabase`

### 数据库里大概有哪些核心表

初始化 SQL 在：
- [setup-database.sql](./scripts/setup-database.sql)

核心表主要是：
- `users`
- `orders`
- `credit_transactions`
- `subscriptions`
- `payment_configs`

可以把它理解成：
- `users` 是会员表
- `orders` 是订单表
- `credit_transactions` 是积分流水
- `subscriptions` 是订阅关系
- `payment_configs` 是收银台配置表

## 3. 先看最短上手版

如果你就想先把项目跑起来，看这一段就够。

### 3.1 准备环境

你本机至少需要：
- Node.js `20+`
- npm
- Git

### 3.2 拉代码并安装依赖

```bash
git clone https://github.com/CharlieLZ/flux-kontext-template.git
cd flux-kontext-template
npm ci
```

### 3.3 复制环境变量模板

```bash
cp env.example .env.local
```

### 3.4 至少填这几个变量

如果你想让站点“真正能登录、能生成”，最少先填：

```env
FAL_KEY=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
DATABASE_URL=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""
```

### 3.5 启动开发环境

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

### 3.6 做一次基础检查

```bash
npm run lint
npm run build
```

如果这两步都过，说明这套站点骨架是完整的。

## 4. 这项目到底怎么工作

先讲大图，不讲代码细枝末节。

### 4.1 用户看到的路径

1. 用户打开首页或 `/generate`
2. 用户登录
3. 用户输入 prompt，或者上传参考图
4. 前端把请求发到 `/api/flux-kontext`
5. 服务端检查：
   - 有没有登录
   - 有没有积分
   - 是否需要 Turnstile
   - 参数是否合法
6. 服务端把请求交给统一的 provider facade
7. 当前 provider 再去调用 `fal / KIE / WaveSpeed`
8. 返回结果后，图片可选保存到 R2
9. 前端展示结果，并允许继续编辑或下载

### 4.2 你真正要改的地方在哪

最常改的是这些：

- 页面和视觉：
  - `src/app/`
  - `src/components/`
- 生成器 UI：
  - `src/components/FluxKontextGenerator.tsx`
  - `src/components/flux-kontext/`
- 服务端生成入口：
  - `src/app/api/flux-kontext/route.ts`
- provider 适配层：
  - `src/lib/flux-kontext.ts`
  - `src/lib/image-generation/providers/`
- 用户和积分逻辑：
  - `src/lib/user-tiers.ts`
  - `src/api/user/*`

## 5. 项目结构怎么读

```text
src/
├── app/                         # 页面和 API 路由入口
├── components/                  # React 组件
│   ├── flux-kontext/            # 生成器拆分后的子模块
│   └── ui/                      # 基础 UI 组件
├── lib/
│   ├── flux-kontext.ts          # 统一生成服务门面
│   ├── image-generation/        # provider 适配层
│   │   └── providers/
│   │       ├── fal-provider.ts
│   │       ├── kie-provider.ts
│   │       └── wavespeed-provider.ts
│   ├── payment/                 # 支付相关
│   ├── services/                # R2 / 内容安全等服务
│   └── user-tiers.ts            # 用户等级与限制
└── hooks/                       # 自定义 hooks
```

## 6. 环境变量怎么理解

很多新手卡在这，不是不会写代码，是不知道“每个钥匙是开哪扇门的”。

把环境变量想成一串钥匙。

### 6.1 必需钥匙

这些不填，项目核心功能跑不起来：

- `FAL_KEY`
  作用：默认 AI 生成 provider 的 API key

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
  作用：数据库和用户数据

补一句容易误解的：
- 运行时主要还是通过 `Supabase client / admin client` 在读写数据
- `DATABASE_URL` 仍然建议配好，因为数据库工具链、连通性检查和排错都可能用到它

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
  作用：登录态和 cookie 安全

- `GOOGLE_ID`
- `GOOGLE_SECRET`
  作用：Google 登录

### 6.2 重要但可后补

- `R2_*`
  作用：把图片存到 Cloudflare R2
  不填会怎样：
  页面能开，某些生成后存储链路会降级或报提示

- `STRIPE_*`
  作用：收费
  不填会怎样：
  不能收款，但不影响你先做产品原型

- `NEXT_PUBLIC_ENABLE_TURNSTILE`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
  作用：防刷、防滥用

### 6.3 provider 选择

```env
IMAGE_GENERATION_PROVIDER="fal"
```

可选值：
- `fal`
- `kie`
- `wavespeed`

建议新手先用：

```env
IMAGE_GENERATION_PROVIDER="fal"
```

原因很简单：
- 这仓库默认主路径已经按 `fal` 打磨过
- `KIE / WaveSpeed` 更适合你后面要接 webhook、任务队列时再打开

## 7. 三种上手路径

### 路线 A：最快把站点跑起来

适合：
- 先想看到页面
- 先不急着收钱

你只做这些：
1. 配 `Supabase`
2. 配 `Google OAuth`
3. 配 `FAL_KEY`
4. `npm run dev`

### 路线 B：做一个能收钱的产品

适合：
- 你已经准备上线

你要再补：
1. `Stripe` 或 `Creem`
2. `R2`
3. `Turnstile`
4. 正式域名
5. 生产环境变量

### 路线 C：做自己的 provider 平台

适合：
- 你想在 `fal / KIE / WaveSpeed` 之间切换

你要看：
- `src/lib/flux-kontext.ts`
- `src/lib/image-generation/types.ts`
- `src/lib/image-generation/providers/`

## 8. 本地开发怎么做

### 8.1 常用命令

```bash
npm run dev
```

开发模式，默认端口 `3000`

```bash
npm run dev:clean
```

先清 3000-3010 端口，再启动开发环境。
适合“端口被占了，我懒得自己查”的时候。

```bash
npm run lint
```

跑 ESLint + TypeScript 类型检查。

```bash
npm run build
```

生产构建检查。

```bash
npm run start
```

跑生产模式。

```bash
npm run check
```

检查配置是否缺项。

```bash
npm run check:supabase
```

检查 Supabase 连通性。

### 8.2 一个稳的本地自检顺序

```bash
npm ci
cp env.example .env.local
npm run check
npm run lint
npm run build
npm run dev
```

## 9. 第三方服务怎么配

### 9.1 Supabase

你可以把 Supabase 理解成“数据库 + 账号系统 + 后台面板”。

操作步骤：
1. 去 Supabase 创建项目
2. 拿到：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. 在数据库面板里拿 `DATABASE_URL`
4. 写入 `.env.local`
5. 在 SQL 编辑器里执行：
   - [setup-database.sql](./scripts/setup-database.sql)

如果你漏了第 5 步，最常见结果就是：
- 页面能开
- 登录表面上像成功了
- 但用户、订单、积分流水这些业务表其实没建好

大白话：
门店门锁装好了，但账本和收银小票机还没搬进来。

### 9.2 Google 登录

你可以把 Google OAuth 理解成“让用户用 Google 直接刷脸进门”。

操作步骤：
1. 去 Google Cloud Console
2. 创建 OAuth Client
3. 回调地址本地填：

```text
http://localhost:3000/api/auth/callback/google
```

4. 把 `GOOGLE_ID` 和 `GOOGLE_SECRET` 写入 `.env.local`

### 9.3 fal

最简单的一条出图路。

步骤：
1. 去 `https://fal.ai/dashboard`
2. 创建 API key
3. 写入：

```env
FAL_KEY=""
IMAGE_GENERATION_PROVIDER="fal"
```

### 9.4 KIE

适合后面做任务型生成或 webhook。

步骤：
1. 拿 `KIE_API_KEY`
2. 如需 webhook，再配 `KIE_WEBHOOK_SIGNING_SECRET`
3. 把 provider 改成：

```env
IMAGE_GENERATION_PROVIDER="kie"
```

### 9.5 WaveSpeed

和 KIE 类似，更偏任务式接口。

步骤：
1. 拿 `WAVESPEED_API_KEY`
2. 如需 webhook，再配 `WAVESPEED_WEBHOOK_SECRET`
3. 把 provider 改成：

```env
IMAGE_GENERATION_PROVIDER="wavespeed"
```

### 9.6 支付怎么配

当前真实已支持支付：
- `Stripe`
- `Creem`

环境变量开关是：

```env
NEXT_PUBLIC_ENABLE_STRIPE="true"
NEXT_PUBLIC_ENABLE_CREEM="false"
NEXT_PUBLIC_DEFAULT_PAYMENT_PROVIDER="stripe"
```

主要代码位置：
- [stripe.ts](./src/lib/payment/stripe.ts)
- [creem.ts](./src/lib/payment/creem.ts)
- [payment router](./src/lib/payment/router.ts)
- [payment config service](./src/lib/services/payment-config.ts)

最简单的建议：
- 先把 `Stripe` 跑通
- 之后如果你确实需要双支付，再把 `Creem` 打开

再强调一次：
- [webhooks/payments route](./src/app/api/webhooks/payments/route.ts) 里虽然提到了 `paypal`
- 但现在只是预留，不算完整支持

## 10. 新手最容易踩的坑

### 坑 1：页面能开，但生成不工作

通常是：
- `FAL_KEY` 没填
- provider 选了 `kie / wavespeed`，但对应 key 没填

### 坑 2：能打开站，但登录失败

通常是：
- `NEXTAUTH_URL` 错
- `NEXTAUTH_SECRET` 太短
- `GOOGLE_ID / GOOGLE_SECRET` 没配好
- Google OAuth 回调地址没填对

### 坑 3：能登录，但数据库报错

通常是：
- `DATABASE_URL` 错
- Supabase service role key 错

### 坑 4：构建时看到 R2 提示

如果日志里出现：

```text
R2 storage not configured - missing environment variables
```

这不一定表示整个项目坏了。
它的意思通常是：
- 页面能跑
- 但对象存储这条链路还没配

### 坑 5：你照着别的仓库习惯想用 pnpm

这仓库当前是：
- `package-lock.json`
- `npm ci`

所以默认请用 `npm`。
不要一上来混着 `npm` 和 `pnpm` 用，不然锁文件会打架。

## 11. 这仓库当前的开发规则

为了不把代码越改越乱，建议坚持下面这套流程：

1. `master` 只做同步，不直接开发
2. 每次都从最新 `origin/master` 切新分支
3. 最好配一个独立 worktree
4. 一个分支只做一个主题
5. 本地先跑 `npm run lint` 和 `npm run build`
6. 推远端后开 PR
7. 等 GitHub checks
8. 自己看一遍本地或 Preview
9. 没问题再合并
10. 合并后删远端分支和本地 worktree

## 12. 如果你想继续扩展，优先级怎么排

最稳的顺序通常是：

1. 先跑通登录、生成、支付三件套
2. 再做 UI 优化
3. 再做 provider 扩展
4. 最后再做内容安全和更多自动化

不要反过来。

大白话讲：
先把店开起来，再装修，再扩仓库，再装更多安保系统。
顺序反了，你会很累。

## 13. 对代码结构的硬建议

别一味加文件，也别一味把所有东西塞回一个文件。

最好的状态是：
- 页面只负责编排
- API route 只做入口校验和 orchestrate
- provider 细节放 adapter
- 支付逻辑单独放 service
- 大组件继续往子模块拆

一句话：
前台、后厨、收银台、仓库要分房间，不要堆在一张桌子上。

## 14. 许可证

本仓库使用 [MIT License](./LICENSE)。

这意味着：
- 你可以商用
- 你可以修改
- 你可以二次分发
- 但你需要保留原始许可证声明

如果你打算基于这个模板做收费产品，MIT 对你是友好的。

当前检查结果：
- [LICENSE](./LICENSE) 是标准 MIT 文本
- 没有发现“文件名写 MIT，但正文不是标准 MIT”的问题
- README 和 LICENSE 的口径现在是一致的

## 15. 最后给新手一句建议

先别急着做“最强版本”。

最靠谱的路线永远是：
- 先跑起来
- 再跑通一条完整业务链
- 再做视觉
- 再做扩展

不要一开始就想同时做：
- 多 provider
- 多支付
- 多语言
- 多角色
- 多主题
- 多套内容安全

那样最容易把自己绕进去。

先让产品像一辆能开动的车，再考虑换轮毂、贴膜和改涡轮。
