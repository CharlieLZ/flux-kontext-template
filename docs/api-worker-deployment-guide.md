# 🚀 API子域名Worker部署完整指南

## 🎯 目标：将 api.your-domain.example 部署到 Cloudflare Workers

### 📋 **部署前准备**

#### 1. 确认域名配置
```bash
# 确保你的域名已经在Cloudflare管理
✅ your-domain.example 已添加到 Cloudflare
✅ DNS 记录可以编辑
✅ SSL/TLS 设置为 "Full" 或 "Full (strict)"
```

#### 2. 准备Worker代码
```javascript
// api-proxy-worker.js - 完整的Worker代码
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 🎯 只处理 api.your-domain.example 的请求
    if (url.hostname !== 'api.your-domain.example') {
      return new Response('Not Found', { status: 404 });
    }
    
    // 🔄 构建目标URL - 代理到主域名
    const targetUrl = `https://your-domain.example${url.pathname}${url.search}`;
    
    // 📋 复制请求头，移除可能冲突的头部
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('cf-ray');
    headers.delete('cf-connecting-ip');
    headers.delete('cf-visitor');
    
    // 🚀 创建代理请求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });
    
    try {
      // 📡 发送代理请求
      const response = await fetch(proxyRequest);
      
      // 📦 创建响应副本
      const proxyResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      // 🌐 添加CORS头部
      proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
      proxyResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      proxyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
      // ⚡ 处理OPTIONS预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
          }
        });
      }
      
      return proxyResponse;
      
    } catch (error) {
      console.error('🚨 代理请求失败:', error);
      return new Response(JSON.stringify({
        error: 'Proxy Error',
        message: 'API代理服务暂时不可用',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
```

---

## 🛠️ **详细部署步骤**

### 步骤1：登录Cloudflare Dashboard

1. **访问控制台**
   ```
   🌐 打开 https://dash.cloudflare.com
   🔐 登录你的Cloudflare账户
   ✅ 确认 your-domain.example 域名在列表中
   ```

2. **检查域名状态**
   ```
   ✅ 状态应该是 "Active"
   ✅ SSL/TLS 设置为 "Full" 或 "Full (strict)"
   ✅ DNS 记录可以编辑
   ```

### 步骤2：创建Worker

1. **进入Workers控制台**
   ```
   📍 左侧菜单 → Workers & Pages
   🆕 点击 "Create application"
   ⚡ 选择 "Create Worker"
   ```

2. **配置Worker基本信息**
   ```
   📝 Worker名称: api-proxy-fluxkontext
   🌍 选择数据中心: 自动 (推荐)
   💾 点击 "Deploy" 创建基础Worker
   ```

3. **编辑Worker代码**
   ```
   ✏️ 点击 "Edit code"
   🗑️ 删除默认代码
   📋 粘贴上面的完整Worker代码
   💾 点击 "Save and deploy"
   ```

### 步骤3：测试Worker功能

1. **获取Worker URL**
   ```bash
   # Worker会分配一个临时URL，类似：
   https://api-proxy-fluxkontext.your-subdomain.workers.dev
   ```

2. **测试代理功能**
   ```bash
   # 测试基本连接
   curl -I https://api-proxy-fluxkontext.your-subdomain.workers.dev
   
   # 测试API代理 (应该返回404，因为hostname不匹配)
   curl https://api-proxy-fluxkontext.your-subdomain.workers.dev/api/test
   ```

### 步骤4：配置自定义域名

1. **添加自定义域名**
   ```
   🔧 Worker设置页面 → Triggers
   🌐 Custom Domains → Add Custom Domain
   📝 输入: api.your-domain.example
   ✅ 点击 "Add Domain"
   ```

2. **等待SSL证书生成**
   ```
   ⏳ 通常需要1-5分钟
   🔒 Cloudflare会自动生成SSL证书
   ✅ 状态变为 "Active" 即可使用
   ```

### 步骤5：配置DNS记录

1. **进入DNS管理**
   ```
   🌐 Cloudflare Dashboard → 你的域名 → DNS → Records
   ```

2. **添加CNAME记录**
   ```
   Type: CNAME
   Name: api
   Target: api-proxy-fluxkontext.your-subdomain.workers.dev
   Proxy status: ✅ Proxied (橙色云朵图标)
   TTL: Auto
   ```

3. **验证DNS配置**
   ```bash
   # 检查DNS解析
   nslookup api.your-domain.example
   
   # 应该返回Cloudflare的IP地址
   ```

### 步骤6：全面测试

1. **测试基本连接**
   ```bash
   # 测试HTTPS连接
   curl -I https://api.your-domain.example
   
   # 应该返回200状态码
   ```

2. **测试API代理**
   ```bash
   # 测试主页代理
   curl https://api.your-domain.example/
   
   # 测试API端点代理
   curl -X POST https://api.your-domain.example/api/flux-kontext \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test"}'
   ```

3. **测试CORS功能**
   ```bash
   # 测试OPTIONS请求
   curl -X OPTIONS https://api.your-domain.example/api/flux-kontext \
     -H "Origin: https://example.com" \
     -v
   
   # 应该返回CORS头部
   ```

---

## 🔧 **高级配置选项**

### 1. 添加请求日志

```javascript
// 在Worker代码中添加日志功能
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const url = new URL(request.url);
    
    // 记录请求信息
    console.log(`📡 [${new Date().toISOString()}] ${request.method} ${url.pathname}`);
    
    // ... 代理逻辑 ...
    
    // 记录响应时间
    const endTime = Date.now();
    console.log(`⚡ 响应时间: ${endTime - startTime}ms`);
    
    return response;
  }
}
```

### 2. 添加缓存优化

```javascript
// 为GET请求添加缓存
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 对静态资源启用缓存
    if (request.method === 'GET' && (
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg')
    )) {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        console.log('💾 返回缓存内容');
        return cachedResponse;
      }
    }
    
    // ... 代理逻辑 ...
    
    // 缓存成功的GET响应
    if (request.method === 'GET' && response.status === 200) {
      const responseToCache = response.clone();
      ctx.waitUntil(cache.put(cacheKey, responseToCache));
    }
    
    return response;
  }
}
```

### 3. 添加安全限制

```javascript
// 添加基本的安全检查
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 检查User-Agent
    const userAgent = request.headers.get('User-Agent') || '';
    if (userAgent.includes('bot') && !userAgent.includes('Googlebot')) {
      return new Response('Forbidden', { status: 403 });
    }
    
    // 限制请求大小
    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      return new Response('Request Too Large', { status: 413 });
    }
    
    // ... 代理逻辑 ...
  }
}
```

---

## 🚨 **故障排除指南**

### 常见问题1：DNS未生效

```bash
# 症状：api.your-domain.example 无法访问
# 解决方案：
1. 检查DNS记录是否正确配置
2. 等待DNS传播 (最多24小时)
3. 清除本地DNS缓存: ipconfig /flushdns (Windows)
```

### 常见问题2：SSL证书错误

```bash
# 症状：HTTPS连接失败
# 解决方案：
1. 确认自定义域名状态为 "Active"
2. 检查SSL/TLS设置为 "Full" 或 "Full (strict)"
3. 等待SSL证书生成完成
```

### 常见问题3：代理返回404

```bash
# 症状：所有请求都返回404
# 解决方案：
1. 检查Worker代码中的hostname判断
2. 确认目标URL构建正确
3. 测试主域名是否可以正常访问
```

### 常见问题4：CORS错误

```bash
# 症状：浏览器报CORS错误
# 解决方案：
1. 确认Worker代码包含CORS头部设置
2. 检查OPTIONS请求处理逻辑
3. 验证Access-Control-Allow-Origin设置
```

---

## 📊 **监控和维护**

### 1. 查看Worker指标

```
🌐 Cloudflare Dashboard → Workers → 你的Worker → Metrics
📊 可以查看：
- 请求数量
- 错误率
- 响应时间
- CPU使用时间
```

### 2. 设置告警

```
🔔 Cloudflare Dashboard → Notifications
⚠️ 可以设置：
- 错误率超过5%时发送邮件
- 请求量异常时发送通知
- Worker离线时立即通知
```

### 3. 查看实时日志

```bash
# 使用Wrangler CLI查看实时日志
npm install -g wrangler
wrangler login
wrangler tail api-proxy-fluxkontext
```

---

## 💡 **最佳实践建议**

1. **定期备份Worker代码**
2. **监控Worker性能指标**
3. **设置合理的缓存策略**
4. **实施基本的安全检查**
5. **保持Worker代码简洁高效**

完成这些步骤后，你的 `api.your-domain.example` 就会完美代理到主域名了！ 