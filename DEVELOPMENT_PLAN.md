# 校园失物招领平台 — 0→1 开发计划

---

## 如何使用本计划

1. 按阶段顺序执行，每阶段完成后打勾标记
2. 每个阶段末尾的 **&#128214; 文档对照** 列出了当前阶段应回顾的原文段落，确保实现不偏离需求
3. **&#9888; 对齐提醒** 列出了需要与产品方确认的模糊点，建议在写代码前明确

---

## 第 0 阶段：项目脚手架搭建

**目标：** 初始化前后端项目骨架，安装全部依赖，让项目能启动。

### 任务清单

- [ ] **0.1** 创建顶层目录结构
  ```
  /server   — 后端 Express
  /client   — 前端 React (Vite)
  ```
- [ ] **0.2** 初始化后端项目
  - `server/package.json`：安装 express, sequelize, mysql2, jsonwebtoken, bcryptjs, multer, cors, dotenv
  - 入口文件 `server/app.js`
- [ ] **0.3** 初始化前端项目
  - `npm create vite@latest client -- --template react`
  - 安装 antd, axios, react-router-dom
  - 安装 tailwindcss + @tailwindcss/vite
- [ ] **0.4** 配置 Tailwind CSS
  - `client/vite.config.js` 中注册 tailwind 插件
  - `client/src/index.css` 中引入 `@tailwind base/components/utilities`
- [ ] **0.5** 配置环境变量
  - `server/.env`：DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT
  - `server/.env.example`：不含敏感值的模板

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| UI.md | **二、技术框架与组件选型** — 前端 React+Vite+Tailwind+Antd，后端 Express+Sequelize |
| development.md | **1. 技术栈选型** — 完整技术选型表，核验依赖是否有遗漏 |
| development.md | **4.1 环境配置** — `.env` 管理敏感信息，后端 CORS 中间件 |

### &#9888; 对齐提醒

> **Q0-A：** 数据库是使用本地 MySQL 还是已有远程数据库？如果是本地，需要确认 MySQL 已安装且版本 ≥ 8.0。
>
> **Q0-B：** 前端端口默认 5173，后端端口默认 3001，是否需要调整？

---

## 第 1 阶段：数据库与模型定义

**目标：** 建立 MySQL 连接，用 Sequelize 定义 User 和 Item 模型并建表。

### 任务清单

- [ ] **1.1** 数据库连接配置 `server/config/database.js`
  - 读取 `.env` 各变量
  - 创建 Sequelize 实例
  - 导出 sequelize 实例，供全局使用
- [ ] **1.2** User Model `server/models/User.js`
  - id (INT, PK, AUTO_INCREMENT)
  - username (VARCHAR, unique, not null)
  - password (VARCHAR, not null)
  - avatar (VARCHAR, 默认空)
  - contact (VARCHAR, 默认空)
  - role (ENUM: 'user'/'admin', 默认 'user')
  - 挂载 bcrypt 密码加密 hook（beforeCreate, beforeUpdate）
- [ ] **1.3** Item Model `server/models/Item.js`
  - id, title, description, type (ENUM: 'lost'/'found'), category, image_url, location, contact_info
  - status (TINYINT, 默认 0：展示中，1：已结案)
  - userId (FK → users.id)
  - create_time (DATETIME, 默认 NOW)
- [ ] **1.4** 关联关系
  - `server/models/index.js` 统一加载并建立关联
  - User.hasMany(Item, { foreignKey: 'userId' })
  - Item.belongsTo(User, { foreignKey: 'userId' })
- [ ] **1.5** `sync()` 建表
  - 在 `app.js` 中首次启动时自动同步
  - 确认数据库中出现 `users` 和 `items` 两张表

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| PRDs.md | **3.1 用户表** / **3.2 帖子表** — 每个字段的类型和描述 |
| development.md | **2. 数据库逻辑模型** — 补充字段（category, image_url, location），与 PRD 不完全一致，需确认以哪个为准 |
| development.md | **1. 技术栈选型** — Sequelize ORM 防止 SQL 注入 |

### &#9888; 对齐提醒

> **Q1-A：** PRDs.md 中 Item 表字段名为 `desc`、`img`，而 development.md 中使用 `description`、`image_url`、`location`。**以哪份文档为准？** 建议统一为 development.md 的命名（更规范）。
>
> **Q1-B：** Item 的 `category` 枚举值是否固定为：证件、电子产品、生活用品、其他？是否需要扩展？

---

## 第 2 阶段：后端核心 — 认证与中间件

**目标：** 实现注册登录，JWT 签发与验证，角色控制。

### 任务清单

- [ ] **2.1** 统一响应工具 `server/utils/response.js`
  - `success(res, data, msg)` → `{ code: 200, data, msg }`
  - `error(res, msg, code)` → `{ code, data: null, msg }`
  - 整个项目所有接口统一使用此格式
- [ ] **2.2** `POST /api/auth/register`
  - 校验 username 不为空、password 长度 ≥ 6
  - 查重：username 已存在则返回 409
  - bcrypt 加密后存入数据库
  - 返回 JWT token（含 id, role）
- [ ] **2.3** `POST /api/auth/login`
  - 查用户是否存在，不存在返回 401
  - bcrypt 比对密码，失败返回 401
  - 返回 JWT token
- [ ] **2.4** JWT 认证中间件 `server/middleware/auth.js`
  - 从 Authorization header 提取 Bearer token
  - jwt.verify 解析，将 `{ id, role }` 挂载到 `req.user`
  - 无 token 或解析失败返回 401
- [ ] **2.5** 管理员中间件 `server/middleware/admin.js`
  - 必须在 auth 中间件之后使用
  - 检查 `req.user.role === 'admin'`，否则返回 403
- [ ] **2.6** 全局错误处理中间件
  - 包裹异步路由的 try/catch
  - 捕获 Sequelize 校验错误并转成友好提示

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| UI.md | **2.3 状态管理与认证** — JWT 选型说明 |
| development.md | **3. 核心 API 规范** — Auth 接口路径定义，返回格式 `{ code, data, msg }` |
| development.md | **5. 给 Claude 的最终指令** — 明确要求 JWT + bcrypt |

### &#9888; 对齐提醒

> **Q2-A：** JWT 过期时间建议设为 7 天（`expiresIn: '7d'`），是否有其他要求？
>
> **Q2-B：** 是否需要 refresh token 机制？当前设计仅使用单一 access token。

---

## 第 3 阶段：后端 API — 业务 CRUD

**目标：** 实现所有业务接口，后端 API 层全部完成。

### 任务清单

#### 3-A：帖子相关路由 `server/routes/items.js`

- [ ] **3.1** `GET /api/items` — 公开，查询帖子列表
  - 支持分页：`page`（默认 1）、`limit`（默认 10）
  - 支持筛选：`type` (lost/found)、`category`、`keyword`（模糊搜索 title、description、location）
  - 返回：分页数据 + 总条数
  - 仅返回 status=0 的活跃帖子（首页展示用）；管理员可看全部
- [ ] **3.2** `POST /api/items` — 需登录，发布帖子
  - Multer 处理图片上传（`/public/uploads` 目录）
  - contact_info 默认取 `req.user.contact`，允许前端覆盖（单次修改）
  - userId 自动取自 `req.user.id`
- [ ] **3.3** `PUT /api/items/:id` — 需登录，编辑帖子
  - 校验：req.user.id === item.userId OR req.user.role === 'admin'
  - 否则返回 403
- [ ] **3.4** `DELETE /api/items/:id` — 需登录，删除帖子
  - 校验同上
- [ ] **3.5** `PUT /api/items/:id/status` — 需登录，切换解决状态
  - 校验同上，把 status 从 0 改 1 或反操作
- [ ] **3.6** `GET /api/items/my` — 需登录，查看我的发布
  - 等同于 `GET /api/items` 但限定 userId = req.user.id

#### 3-B：用户相关路由 `server/routes/users.js`

- [ ] **3.7** `GET /api/users/profile` — 需登录，获取个人资料
  - 返回 username, avatar, contact, role（不返回 password）
- [ ] **3.8** `PUT /api/users/profile` — 需登录，更新个人资料
  - 可更新：avatar（需支持图片替换上传）、contact、password（旧密码校验）
- [ ] **3.9** `GET /api/users/items` — 需登录，获取我的帖子
  - 同上 3.6，放在 user 路由下作为快捷入口

#### 3-C：管理后台路由 `server/routes/admin.js`

- [ ] **3.10** `GET /api/admin/items` — 管理员，查看全站帖子（含已结案）
- [ ] **3.11** `DELETE /api/admin/items/:id` — 管理员，强制删除违规帖子
- [ ] **3.12** `GET /api/admin/users` — 管理员，查看用户列表
- [ ] **3.13** `PUT /api/admin/users/:id/ban` — 管理员，封禁/解封
  - 可通过增加状态字段或软删除实现

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| PRDs.md | **4. 业务规则与逻辑** — 访问权限（游客仅浏览，操作需登录），"认领"和"联系"仅展示方式 |
| UI.md | **2.3 状态管理与认证** — 图片存储先本地 `public/uploads`，后续迁移云 |
| development.md | **3. 核心 API 规范** — 全部接口路径和参数定义 |

### &#9888; 对齐提醒

> **Q3-A：** 首页是否需要区分"仅看活跃帖"和"管理员可看全部"？当前设计是首页 API 默认过滤 status=0。
>
> **Q3-B：** 图片上传文件大小限制建议 5MB，允许的格式：jpg/png/webp，是否需要调整？
>
> **Q3-C：** 封禁用户是否影响其已有帖子展示？建议封禁后帖子自动隐藏（status 改为隐藏状态或软删除）。

---

## 第 4 阶段：前端基础 — 路由、布局、状态

**目标：** 前端脚手架搭好路由、全局布局、认证状态管理。

### 任务清单

- [ ] **4.1** 路由配置 `client/src/router.jsx`
  - `/` → 首页（HomePage）
  - `/login` → 登录页
  - `/register` → 注册页
  - `/post` → 发布页（需登录守卫）
  - `/user` → 个人中心（需登录守卫）
  - `/admin` → 管理后台（需登录 + admin 角色守卫）
- [ ] **4.2** Axios 封装 `client/src/api/request.js`
  - baseURL 指向后端地址
  - 请求拦截器：自动从 localStorage 读取 token 附加到 Authorization
  - 响应拦截器：code !== 200 时提示错误；401 时清除 token 并跳转登录
- [ ] **4.3** AuthContext `client/src/contexts/AuthContext.jsx`
  - 存储：user（id, username, role, avatar）、token、isLoggedIn
  - 方法：login(), register(), logout(), fetchProfile()
  - 初始化时从 localStorage 恢复 token
- [ ] **4.4** 路由守卫组件 `client/src/components/ProtectedRoute.jsx`
  - 未登录 → 重定向到 `/login`
  - 需管理员 → 检查 role === 'admin'，否则提示无权限
- [ ] **4.5** 全局布局组件 `client/src/components/AppLayout.jsx`
  - 顶部 Sticky 导航栏（带 blur 效果）
  - `<Outlet />` 内容区
- [ ] **4.6** 导航栏组件 `client/src/components/NavBar.jsx`
  - 左侧：Logo + 平台名称
  - 中间：搜索框（首页显示，其他页面隐藏）
  - 右侧："我要挂失"按钮、"我发现了失物"按钮、用户头像（登录后）/ 登录入口（未登录）
- [ ] **4.7** 登录页 `client/src/pages/LoginPage.jsx`
  - Ant Design Form，username + password
  - 调用 `/api/auth/login`，成功后存 token + 跳转首页
- [ ] **4.8** 注册页 `client/src/pages/RegisterPage.jsx`
  - Ant Design Form，username + password + confirmPassword + contact
  - 调用 `/api/auth/register`，成功后自动登录 + 跳转首页

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| PRDs.md | **2.1 首页顶部导航栏** — 导航栏各部分元素定义 |
| PRDs.md | **4. 业务规则与逻辑** — 游客访问限制 |
| UI.md | **1.2 页面结构细节** — 导航栏固定顶部、Sticky、背景半透明高斯模糊 |
| UI.md | **1.1 视觉风格** — 主色调 `#3B82F6`，圆角 8/12px，字体 PingFang SC / Microsoft YaHei |

### &#9888; 对齐提醒

> **Q4-A：** Logo 目前有现成的图片吗？还是先用纯文字占位？
>
> **Q4-B：** 导航栏中间的搜索框是始终可见，还是仅在首页展示？PRD 描述为"首页"，暂定为仅首页可见。

---

## 第 5 阶段：前端页面 — 核心业务

**目标：** 所有页面的 UI 和完整交互实现。

### 任务清单

#### 5-A：首页 `client/src/pages/HomePage.jsx`

- [ ] **5.1** 双栏布局
  - 左侧：失物招领栏（Found Items），标题 Badge 绿色
  - 右侧：失物寻物栏（Lost Items），标题 Badge 蓝色
  - 响应式：移动端下单列堆叠
- [ ] **5.2** ItemCard 组件 `client/src/components/ItemCard.jsx`
  - 物品图片（或占位图）、标题、时间（相对时间/绝对时间）、地点
  - 右上角状态标签："待认领"(绿) / "寻找中"(蓝) / "已结案"(灰)
  - 底部按钮："我要认领"（Found 卡） / "联系失主"（Lost 卡）
  - Hover 效果：阴影加深 + 微上移 2px
- [ ] **5.3** ContactModal 组件 `client/src/components/ContactModal.jsx`
  - Ant Design Modal，遮罩背景
  - 显示联系电话/微信
  - "一键复制"按钮（navigator.clipboard.writeText），复制后即时提示
- [ ] **5.4** 搜索功能  `client/src/components/SearchBar.jsx`
  - 防抖（debounce 300ms）发送搜索请求
  - 或保留搜索按钮，点击后触发
  - 搜索关键词高亮结果（可选）
- [ ] **5.5** 加载与空状态
  - 列表加载时 Ant Design Spin/Skeleton
  - 数据为空时使用 Ant Design Empty

#### 5-B：发布页 `client/src/pages/PostPage.jsx`

- [ ] **5.6** 发布表单
  - Ant Design Form + Upload 组件
  - 字段：信息类型（Radio: 招领/挂失）、物品分类（Select）、标题、描述（TextArea）、图片（Upload，选填但建议必填）、地点、联系方式（默认显示个人资料中的联系方式但可修改）
  - 提交前表单校验

#### 5-C：个人中心 `client/src/pages/UserCenterPage.jsx`

- [ ] **5.7** 资料编辑 tab
  - 头像上传、联系方式修改、密码修改（旧密码 + 新密码 + 确认新密码）
- [ ] **5.8** 我的发布 tab
  - 帖子列表（卡片或表格形式）
  - 每项可：编辑（跳转发布页回填）、删除（二次确认）、标记已解决

#### 5-D：管理后台 `client/src/pages/AdminPage.jsx`

- [ ] **5.9** 内容管理 tab
  - 全站帖子表格（Ant Design Table）
  - 操作列：强制删除（red text，二次确认）
- [ ] **5.10** 用户管理 tab
  - 用户列表表格
  - 操作列：封禁/解封按钮

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| PRDs.md | **2.1 首页主体内容区** — 左右栏卡片结构 + 按钮交互 |
| PRDs.md | **2.2 发布页面** — 表单字段详细定义 |
| PRDs.md | **2.3 用户中心** — 资料编辑 + 我的发布功能点 |
| PRDs.md | **2.4 管理后台** — 内容管理 + 用户管理 |
| UI.md | **1.2 页面结构细节** — ItemCard Hover 效果、Status Badge 颜色、Modal 一键复制 |
| UI.md | **1.3 页面草图** — ASCII 布局图，可对照检查实现 |

### &#9888; 对齐提醒

> **Q5-A：** 物品图片是否必填？PRD 写"(必填/选填)"括号里有两种说法。**建议必填**，否则卡片视觉效果差。
>
> **Q5-B：** 帖子编辑是原地编辑还是跳转到发布页回填表单？**建议跳转发布页回填**，复用表单组件。
>
> **Q5-C：** 管理员强制删除是否需要填写删除理由？当前设计为直接删除+二次确认弹窗。

---

## 第 6 阶段：集成联调与打磨

**目标：** 前后端联调、边界情况处理、体验优化。

### 任务清单

- [ ] **6.1** 全流程走通
  - 注册 → 登录 → 发布失物 → 首页看到 → 点击认领 → 查看联系方式
  - 游客浏览首页 → 点击认领 → 跳转登录 → 登录后回来
  - 我的发布 → 编辑帖子 → 标记已解决
  - 管理员登录 → 查看全站 → 删除违规帖 → 封禁用户
- [ ] **6.2** 登录态过期处理
  - JWT 过期后，任何需要登录的操作 → 自动跳转登录页，toast 提示 "登录已过期，请重新登录"
- [ ] **6.3** 图片处理
  - 上传时显示缩略图预览
  - 上传进度（Ant Upload 内置）
  - 未上传图片的卡片显示默认占位图
- [ ] **6.4** 错误提示
  - 网络错误：toast "网络异常，请稍后重试"
  - 表单校验：字段级红色提示
  - 权限不足：403 toast "无权限执行此操作"
- [ ] **6.5** 移动端适配
  - 双栏布局 → 单列 Tab 切换（Tab 切换"招领" / "寻物"）
  - 导航栏简化：搜索框缩为图标，点击展开
  - 卡片占满宽度

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| UI.md | **1.1 视觉风格** — 色调、圆角、字体规范实现回顾 |
| UI.md | **1.2 页面结构细节** — 弹窗遮罩、一键复制交互 |
| PRDs.md | **4. 业务规则** — 游客引导登录流程 |

### &#9888; 对齐提醒

> **Q6-A：** 移动端是否需要作为 MVP 的一部分？还是可以放到后续迭代？建议至少做基础适配。
>
> **Q6-B：** 联系方式展示时是否需要记录查看次数（防恶意滥用）？当前设计无此功能。

---

## 第 7 阶段：部署准备

**目标：** 生产构建脚本，配置模板，可交付产物。

### 任务清单

- [ ] **7.1** `.env.example` 生成
  - 所有环境变量名 + 说明注释，不含真实值
- [ ] **7.2** 前端构建
  - `vite build` 输出到 `client/dist`
  - Express 托管静态资源：`app.use(express.static('client/dist'))`
- [ ] **7.3** 生产路由处理
  - SPA fallback：非 `/api/*` 的 GET 请求统一返回 `index.html`
- [ ] **7.4** CORS 收紧
  - 开发环境：允许 localhost:5173
  - 生产环境：读取环境变量 ALLOWED_ORIGIN
- [ ] **7.5** 启动脚本
  - `server/package.json` 中 `"start": "node app.js"`
  - 可选的 `ecosystem.config.js`（PM2 部署模板）
- [ ] **7.6** README
  - 项目简介、技术栈、本地启动步骤、部署说明

### &#128214; 文档对照

| 文档 | 相关段落 |
|:---|:---|
| development.md | **4. 部署方案** — 环境配置、跨域处理、云迁移路径 |
| development.md | **4.2 云端迁移路径** — 本地 → 云数据库/云存储的切换预留 |

### &#9888; 对齐提醒

> **Q7-A：** 是否有目标部署平台（阿里云 ECS / 腾讯云轻量 / Docker）？影响包管理器选择和启动脚本。
>
> **Q7-B：** 是否需要 CI/CD 流水线（GitHub Actions / 手动部署）？

---

## 附录：文件清单预估

| 目录 | 文件 | 数量 |
|:---|:---|:---|
| `server/config/` | database.js | 1 |
| `server/models/` | User.js, Item.js, index.js | 3 |
| `server/middleware/` | auth.js, admin.js | 2 |
| `server/routes/` | auth.js, items.js, users.js, admin.js | 4 |
| `server/utils/` | response.js | 1 |
| `server/` | app.js, .env, .env.example, package.json | 4 |
| `client/src/contexts/` | AuthContext.jsx | 1 |
| `client/src/components/` | NavBar.jsx, AppLayout.jsx, ItemCard.jsx, ContactModal.jsx, SearchBar.jsx, ProtectedRoute.jsx | 6 |
| `client/src/pages/` | HomePage.jsx, LoginPage.jsx, RegisterPage.jsx, PostPage.jsx, UserCenterPage.jsx, AdminPage.jsx | 6 |
| `client/src/api/` | request.js, items.js, auth.js, user.js, admin.js | 5 |
| `client/src/` | router.jsx, App.jsx, main.jsx, index.css | 4 |
| `client/` | vite.config.js, tailwind.config.js, package.json | 3 |

**合计预估：约 43 个核心文件**

---

## 执行节奏建议

| 节奏 | 包含阶段 | 预计主要产出 |
|:---|:---|:---|
| **第一轮**（后端骨架） | 0 + 1 + 2 | API 全部可用，Postman 可验证 |
| **第二轮**（前端骨架） | 4 | 可登录注册，路由跳转正常 |
| **第三轮**（核心页面） | 5 | 首页 + 发布 + 个人 + 管理全部可用 |
| **第四轮**（联调打磨） | 6 + 7 | 交付级质量 |

每轮结束都是一个天然的中断/回顾点。
