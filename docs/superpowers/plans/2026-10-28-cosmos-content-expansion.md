# COSMOS Content Expansion Implementation Plan

**Goal:** 平滑有刻度滚轮的公转输入，将原站公开内容接入 COSMOS，并支持简介点击后向左展开详情。

**Architecture:** 保留现有 Astro / Three.js 场景和独立分支。轨道控制器把累计滚轮位移在 120 ms 内连续插值到明确终点，不增加吸附；内容进度仍由实际角度驱动。Astro 在构建时复用公开项目 Markdown、图片和个人数据，输出简介配置与惰性克隆的详情模板；浏览器负责两级状态、焦点和滚轮分流。

**Tech Stack:** Astro 7、TypeScript、Three.js、Node 内置测试、Playwright；无新增依赖。直接在本会话执行，不部署。

## Task 1: finite wheel interpolation

- [x] 在 `scripts/cosmos-orbit-control.test.mjs` 先验证离散输入不会立即跳角，120 ms 后到达输入指定终点，临界位置不吸附；连续、反向输入和 frame rate 保持一致。
- [x] 在 `src/cosmos/SatelliteOrbitController.ts` 增加有限时长输入插值，使用 `1 - (1 - t) ** 3`；反向输入取消旧余量，`stop()` 丢弃队列。
- [x] 运行三组 `node --test`，23 项全部通过。

## Task 2: reuse public content

- [x] 在 `src/cosmos/UniverseContent.astro` 通过 `getPublicProjects()` / `getPublicNotes()` 复用已发布中文内容，`render(project)` 构建完整正文；保留原图片说明、贡献范围和评测限定。
- [x] 复用 `src/data/profile.ts`、`achievements.ts`、`resume.ts`、`links.ts`，生成成长、奖项、工程经历、生活和联系方式详情。
- [x] 在 `src/cosmos/universeData.ts` 增加 LuminaMind、WangDesk 卫星及 `detailId`，保持每颗主题星球 1～3 颗卫星。发布标记继续作为内容过滤条件。
- [x] `src/pages/cosmos.astro` 注入构建期模板与 JSON，`UniverseScene.ts` 使用同一份内容配置生成标签和面板。保留旧路由，不变更正式首页或部署。

## Task 3: two-level presentation

- [x] 在 `PlanetInfoPanel.ts` 实现简介点击 / Enter 展开详情、返回简介、Esc 分级退出与焦点恢复；详情只克隆当前模板。中间进度可点击正经过画面的简介，不必先自动吸附。
- [x] 展开时调用轨道 `stop()`；详情内滚轮只阅读，外部滚轮和方向键不切换项目；返回后恢复相同角度和文字进度。
- [x] `cosmos.css` 下移项目导航并增加内容区高度；宽面板向左展开，详情正文独立滚动，保留玻璃背景与减少动态效果支持。

## Task 4: verification and delivery

- [x] 运行控制 / 几何 / 航行测试、`npm run check`、变更文件 ESLint、`npm run build`。
- [x] 浏览器检查单刻度逐帧平滑、连续输入、反向与临界暂停、导航下移、六个项目和个人内容、详情打开 / 阅读 / 返回 / Esc、位置保留和退出航行。
- [x] 桌面 1096×704 与 1440×900 截图复核，528×704 检查边界；额外测试半途打开详情、快速反向与减少动态效果。修正隐藏阅读器保留旧滚动偏移、矮窗口高位行星标签消失的问题。
- [x] 更新 `docs/COSMOS.md`，仅提交本轮相关文件，恢复 4321 开发预览并实测。浏览器历史返回后可重新探索与展开详情；所有正常流程脚本错误为 0。
