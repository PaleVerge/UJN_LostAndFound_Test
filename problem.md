1.失物的图片显示不出来，检查了数据库发现是压根没有上传上去 ✅ 已解决
   原因：PostPage.jsx 中 beforeUpload 存储的是原始 File 对象，但提交时检查 file.originFileObj（不存在）
   修复：改为 file instanceof File 检查，直接使用 file。AdminPage 同问题一并修复。

2.个人中心的头像也无法更换 ✅ 已解决
   原因：UserCenterPage.jsx 使用 setFieldValue 方式管理头像文件，File 对象存取不稳定
   修复：改为 useState 管理 avatarFile（与 PostPage 同模式），Upload beforeUpload 直接 setAvatarFile，提交时直接 append

3.登录注册页面和失物大厅页面应当是两个独立的页面,要求开发一个独立的登录注册页面 ✅ 已解决
   修复：将 /login 和 /register 路由从 AppLayout 中移出，登录/注册页面不再显示导航栏

4.失物大厅的搜索功能不可用 ✅ 已解决
   原因：SearchBar 组件未被 HomePage 引入使用；NavBar 中的搜索 Input 无事件绑定
   修复：HomePage 中引入 SearchBar 并关联 handleSearch；NavBar 搜索输入通过自定义事件与 HomePage 联动

5.在导航栏上增加一个大厅按钮（点击就能返回大厅） ✅ 已解决
   修复：NavBar 中在非首页时显示"大厅"按钮，点击 navigate 回 /
6.设置拦截器，防止直接使用网页上方的url跳过登录注册和后台权限进入网页 ✅ 已解决
   未登录用户通过URL访问受保护页面时弹出"请先登录"提示并重定向到登录页；非管理员访问后台时弹出"你没有权限"
   修复：ProtectedRoute 重定向前弹出 message.warning 提示，LoginPage/RegisterPage 已登录自动重定向首页，AppLayout 添加 404 兜底

7.在大厅中的card组件增加点击卡片可以查看具体信息，包括查看完整图片的功能 ✅ 已解决
   修复：ItemCard 添加 onClick 点击卡片弹出详情 Modal，展示完整图片（支持预览）、分类、状态、描述、地点、时间、发布者

8.点击退出登录后直接返回到登录页面 ✅ 已解决
   修复：NavBar 退出登录 navigate 目标从 / 改为 /login
9.登录时账号密码不匹配应当弹窗提醒 ✅ 已解决
   原因：拦截器对所有 401 统一处理为"登录已过期"，覆盖了服务端返回的真实错误消息
   修复：拦截器区分 auth 端点（/auth/login、/auth/register），401 时显示服务端消息（如"用户名或密码错误"）而非硬编码提示

10.UI美化 ✅ 已解决
   按 UI.md 设计规范全面美化：
   - 登录/注册页：渐变背景 + logo 品牌区 + 圆角卡片 + 版权信息
   - 首页：双栏标题区图标背景色区分（绿色/蓝色），精致排版
   - 发布页：Radio.Button 按钮样式、卡片圆角阴影、表单微文案
   - 个人中心：头像+号叠加区、统计数字、列表项悬停底色
   - ItemCard：渐变封面图、缩放 hover、圆角卡片、阴影加深
   - ContactModal：蓝色渐变联系方式区、头像首字母
   - 全局：主背景渐变、间距增大
11.大厅点击我要挂失和我发现了后，表单里面对应的信息类型没有发生变化 ✅ 已解决
   原因：Form initialValues 仅在首次挂载时生效，React Router 同一组件内复用时不更新
   修复：添加 useEffect 监听 defaultType 变化，通过 setFieldValue 同步更新表单 type 字段

12.处理报错 ✅ 已解决
   - message static function 警告：App.jsx 包裹 antd <App> 组件
   - destroyOnClose 废弃：ContactModal/ItemCard/AdminPage 全部替换为 destroyOnHidden
   - 空字符串 src 警告：UserCenterPage 头像 src 改为 user?.avatar || undefined

13.UIDesignPro 活泼校园版重构 ✅ 已解决
   按 UIDesignPro.md 设计规范全面重构视觉系统：
   - 弥散呼吸背景：六色 radial-gradient，20s 呼吸位移动效，明暗双模配色
   - 玻璃拟态卡片：24px 圆角, rgba 半透明背景, 2px 白边, hover rotate(1deg)+上浮
   - 多巴胺色彩：寻物粉红 #FB7185 / 招领薄荷绿 #16A34A / 已结案灰白
   - 暗黑模式：ThemeContext 驱动 data-theme, CSS 变量全量覆盖, antd darkAlgorithm
   - 暗黑切换：NavBar Sun/Moon 按钮, 0.5s cubic-bezier 动效
   - Bento Grid：搜主栏双列 + 右侧"丢拾趋势"看板, 图片默认灰度 hover 去灰+缩放
   - 空状态 SVG：浮动小章鱼 + 肢体动画 + 随机校园幽默文案
   - 防闪烁脚本：index.html 内联读取 localStorage 预设 data-theme
14.处理报错：client:510 Warning: [antd: message] Static function can not consume context like dynamic theme. Please use 'App' component instead. ✅ 已解决
   原因：LoginPage/RegisterPage/PostPage/UserCenterPage/AdminPage/ContactModal/ProtectedRoute 等多处使用静态 import { message } from 'antd'，无法消费 ConfigProvider 动态主题上下文
   修复：全部改为 import { App } from 'antd' + const { message } = App.useApp() 使用 context-aware 实例。api/request.js 保留静态导入用于拦截器场景。
15.在我要挂失和我发现了页面填表完成后，既没有提示发布成功，又没有自动跳转到大厅。 ✅ 已解决
   原因1：api/items.js、api/user.js、api/admin.js 中 createItem/updateItem/updateProfile 手动设置了 Content-Type: multipart/form-data，但缺少 boundary 参数，导致服务端无法正确解析 FormData（字段为空，触发"标题、类型和分类为必填项"）
   修复1：移除手动 Content-Type 头，由 axios 自动设置（axios 发送 FormData 时会自动添加正确的 boundary）
   原因2：PostPage.jsx 的 onFinish 中 catch 块为空，API 失败时既不显示错误消息也不跳转，用户无任何反馈
   修复2：catch 块改为 message.error(err?.response?.data?.msg || err?.message || '发布失败，请稍后重试')，确保失败时也有明确提示
