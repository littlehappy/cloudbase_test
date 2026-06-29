# CloudBase 云托管 + Next.js 部署踩坑记录

> 项目：cloudbase_test  
> 框架：Next.js 14 (App Router) + Tailwind CSS  
> 日期：2026-06-30

---

## 环境
- **代码仓库**：GitHub `littlehappy/cloudbase_test`
- **分支策略**：`test` → `dev` → `main`（main 变动触发自动部署）
- **部署平台**：腾讯云 CloudBase 云托管（容器型服务）
- **访问端口**：80 → 服务端口 3000

---

## 问题 1：本地开发在错误目录运行

**现象**：
```
Error: > Couldn't find any `pages` or `app` directory.
```
在 `.next/standalone` 目录下运行了 `npm run dev`。

**原因**：`standalone` 是构建产物目录，不含源码。

**解决**：在项目根目录（有 `src/app` 的目录）运行 `npm run dev`。

---

## 问题 2：`output: 'standalone'` 导致 server.js 找不到

**现象**：
```
Error: Cannot find module '/app/server.js'
```
启动命令设为 `node server.js`。

**原因**：`standalone` 模式下 `server.js` 在 `.next/standalone/` 里，不在根目录。

**尝试**：改为 `node .next/standalone/server.js`，仍然找不到 — CloudBase 无 Dockerfile 模式下构建阶段的 `.next` 目录没有保留到运行阶段。

**最终放弃 standalone 方案。**

---

## 问题 3：去掉 standalone 后 .next 构建产物丢失

**现象**：
```
Error: Could not find a production build in the '.next' directory.
```
启动命令改为 `npm start`，构建命令 `npm install && npm run build`。

**原因**：CloudBase 云托管的「无 Dockerfile」模式，构建与运行是两个隔离阶段。`next build` 产出的 `.next` 目录在构建阶段存在，但运行阶段容器里没有。

**根因**：云托管是通用容器平台，不像 Vercel 那样识别 Next.js 框架并自动保留构建产物。无 Dockerfile 模式只适用于简单 Node.js 服务（不需要构建步骤的那种）。

---

## 问题 4：Docker 构建报 `public` 目录不存在

**现象**：
```
ERROR: failed to calculate checksum: "/app/public": not found
```
Dockerfile 第 19 行：`COPY --from=builder /app/public ./public`

**原因**：项目脚手架没有 `public` 目录（Next.js 默认可选）。

**解决**：
1. 创建 `public/.gitkeep` 占位文件
2. Dockerfile 构建阶段添加 `mkdir -p /app/public` 双保险

---

## 问题 5：自动部署未触发

**现象**：推送 main 后 CloudBase 没有自动构建。

**原因**：之前全部部署尝试都失败，自动部署可能被平台挂起。

**解决**：手动点击「部署」按钮触发。

---

## 最终可行配置

### next.config.js
```js
const nextConfig = {};
module.exports = nextConfig;
```
> 不需要 `output: 'standalone'`

### Dockerfile（多阶段构建）
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p /app/public && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### CloudBase 控制台配置
| 配置项 | 值 |
|--------|-----|
| 分支 | `main` |
| Dockerfile | 有 |
| 访问端口 | `80` |
| 服务端口 | `3000` |
| 语言 | Node.js-LTS |

### 环境变量
```dotenv
NEXT_PUBLIC_APP_NAME=CloudBase 自动化部署测试
NEXT_PUBLIC_API_BASE=https://api.example.com
NEXT_PUBLIC_ENV_TAG=production
SECRET_KEY=prod-secret-abc123
DATABASE_URL=https://cloudbase-db.example.com
```

---

## 核心教训

1. **CloudBase 云托管 ≠ Vercel**：它是通用容器平台，不会自动识别 Next.js，必须提供 Dockerfile
2. **无 Dockerfile 模式不适用于有构建步骤的框架**（Next.js、Nuxt 等），只适合直接 `node index.js` 的简单服务
3. **多阶段 Dockerfile 是官方推荐路径**：构建阶段编译，运行阶段只保留必要产物
4. **`public` 目录不可省略**：即使为空也要创建，Docker COPY 不存在的目录会报错
5. **首次部署失败后自动部署可能挂起**：需手动触发一次，成功后后续自动部署恢复正常
