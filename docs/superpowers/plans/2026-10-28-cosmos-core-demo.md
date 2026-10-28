# COSMOS Core Demo Implementation Plan

**Goal:** 验证第三人称飞船沿笔直 Z 轴航道探索五组星球、打开详情并经黑洞返回起点的完整体验。

**Architecture:** 复用现有 Astro 静态路由、TypeScript 和已安装的 Three.js。独立 `/cosmos/` 页面及 `src/cosmos/` 模块，不加载正式页面的布局或交互。纯航行状态机是位置唯一来源，Three.js 对象和 DOM 面板只消费该状态。

**Tech Stack:** Astro 7 / TypeScript / Three.js 0.186，无新增运行时依赖。

## Execution

- [x] 检查目录、依赖、路由、部署、现有未提交改动；建立 `codex/cosmos-core-demo` 分支。
- [x] 在 `src/cosmos/universeData.ts` 定义星球顺序、位置和卫星归属；所有球体避开中央航道。
- [x] 在 `FlightController.ts` 实现 deltaMode 归一化、双向速度、平滑减速、边界、暂停、黑洞淡出/重置/淡入状态机。
- [x] 建立 `Spaceship.ts`、`CameraController.ts`、`Planet.ts`、`Satellite.ts`、`PlanetSystem.ts`、`BlackHole.ts`，分别管理模型及每帧更新。
- [x] `UniverseScene.ts` 组合渲染、星点、航道标记、射线点击、HTML 标签、资源清理、窗口变化和 WebGL 失败状态。
- [x] `PlanetInfoPanel.ts` 管理对话框、内容、安全 DOM 写入、关闭/Esc/焦点恢复及卫星入口。
- [x] `src/pages/cosmos.astro` 与 `cosmos.css` 提供独立全屏入口、帮助、导航进度、重新出发及无 WebGL 提示。
- [x] 添加纯航行测试，执行 `node --test`、`npm run check`、`npm run build` 和变更文件 ESLint。
- [x] 浏览器验证：初始第三人称画面、正反滚轮、停止、五颗星球与十颗卫星、悬停、聚焦、阅读滚动隔离、Esc/关闭、边界、黑洞循环及回到原站。截图检查 1440×900 与 1024×768。
- [x] 在 `docs/COSMOS.md` 记录本地启动、配置扩展、简化内容与验证结果；Git 仅保存本次新增文件。

## QA risks

- 快速反向输入、刚关闭面板时输入不能造成瞬移。
- 过渡期间输入不得残留，黑洞复位后不能再次触发。
- 后台恢复与 resize 不能引入大 delta 或伸缩错误。
- 导航离开时移除 RAF、监听器、标签、几何体、材质及 WebGL 上下文。

用户要求直接开发，计划在当前会话逐项执行，不另设设计审批步骤，不部署。

## Follow-up: browser feedback

- [x] 移除底部控制台、左上介绍、右上坐标，只保留一行操作提示，并删除对应 DOM 事件与样式。
- [x] 主星高度改为 4 / -6 / 10 / -9 / 7，保持原有左右交错和 Z 轴直线航道。
- [x] 以恒定半径的倾斜圆轨道替换压扁的椭圆；按主星 / 星环外缘计算安全半径，轨道线共用位置函数。
- [x] 添加全圈几何回归测试，检查主星、星环、卫星相互避让和航道安全。
- [x] 复测 528×704 与桌面视图、全部星球 / 卫星、面板隔离和黑洞循环，完成构建与提交。
