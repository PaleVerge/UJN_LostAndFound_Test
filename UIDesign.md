
---

## 🛠️ 失物招领网站 UI 重构技术规范 (面向 AI 提示词版)

### 1. 全局样式变量 (Global Design Tokens)
请为网站定义以下全局变量，确保视觉一致性：
*   **Color System:**
    *   `--primary`: `#6366F1` (Indigo 500 - 现代感)
    *   `--accent`: `#F59E0B` (Amber 500 - 暖色调提示)
    *   `--bg-gradient`: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
    *   `--glass-bg`: `rgba(255, 255, 255, 0.7)`
*   **Border Radius:** 全局统一使用 `12px` 或 `16px` 的大圆角。
*   **Shadows:** 使用三层阴影（Soft Shadows）增加层级感：`0 10px 15px -3px rgba(0,0,0,0.1)`。

---

### 2. 登录页重构指令 (Login Page Refactor)
针对 **屏幕截图 2026-05-05 141942.png** 中的登录页：
*   **布局逻辑：** 将容器改为 `display: grid; grid-template-columns: 1fr 1fr;`。
*   **左侧装饰区：** 增加一个带 `background-color: var(--primary)` 的区块，中心放置一个“失物招领”主题的 SVG 矢量插画，并添加渐变叠加效果。
*   **表单卡片：** 
    *   应用 **Glassmorphism (玻璃拟态)**：`backdrop-filter: blur(12px)`。
    *   输入框添加 `transition: all 0.3s ease`，在 `focus` 状态下增加 `ring-offset` 效果。
    *   登录按钮改为宽度 100%，添加 `hover: translateY(-2px)` 的悬停动画。

---

### 3. 首页大厅重构指令 (Dashboard Refactor)
针对 **屏幕截图 2026-05-05 141957.jpg** 中的布局：
*   **Bento Grid (便当盒布局)：** 将“失物招领”和“寻物启事”两栏改为响应式栅格系统。在大屏下使用 `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`。
*   **物品卡片 (Item Card) 升级：**
    *   **图片比例：** 固定 `aspect-ratio: 16 / 9`，图片设置 `object-fit: cover`。
    *   **标签系统：** 使用不同颜色的 Badge（徽章）区分物品类型（如：电子产品-蓝色，生活用品-橙色）。
    *   **信息层级：** 物品名称加粗 (`font-weight: 600`)，位置和时间使用小尺寸灰色字体，并配以微型 Icon (📍, 🕒)。
*   **搜索栏 (Search Bar)：** 将搜索栏从侧边移至顶部中央。改为药丸型（Pill-shaped）设计，背景半透明，鼠标点击后宽度平滑伸展。

---

### 4. 空状态 (Empty State) 与 动画
*   **空状态处理：** 当没有数据时，不要只显示文字。使用一个 `flex-direction: column` 居中的容器，展示一个轻量级的 SVG 动效插画。
*   **微交互：** 为所有交互元素（按钮、卡片）添加 `cursor: pointer` 和 `active: scale(0.95)`。

---

## 📝 你可以直接发给 DeepSeek 的“终极提示词”

> **Prompt:**
> 我正在开发一个失物招领网站，目前已完成基本功能。请根据以下 UI 规范对前端代码进行美化升级：
> 1. **核心风格**：采用玻璃拟态 (Glassmorphism) 与极简 Bento Grid 布局。
> 2. **色彩**：主色 #6366F1，背景使用柔和的浅色渐变。
> 3. **组件重构**：
>    - **登录页**：改为左右分割布局，加入品牌插画区。
>    - **卡片组件**：提升投影深度，图片固定 16:9 比例，鼠标悬停时卡片上浮 5px。
>    - **导航与搜索**：顶部导航栏固定透明模糊效果，搜索框改为圆角胶囊状。
> 4. **技术栈要求**：请优先使用 CSS Flex/Grid 布局，若支持 Tailwind CSS 请直接使用其类名。
> 5. **交互**：为所有操作按钮添加 300ms 的平滑过渡效果。
> 
> 请基于我现有的 HTML/组件结构，给出完整的 CSS 样式表或美化后的组件代码。

---
