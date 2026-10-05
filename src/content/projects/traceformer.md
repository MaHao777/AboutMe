---
title: TraceFormer · 微弱目标检测
description: 从稀疏事件流中识别微弱运动小目标，构建模型、后处理与可复现评测流程。
date: 2026-09-29
role: 模型设计、训练与后处理开发、对照实验和独立复评
category: 机器学习研究
outcome: 完整系统验证得分 0.9541
order: 3
technologies:
- Python
- PyTorch
- Transformer
- LightGBM
- 事件相机
cover: /images/traceformer-architecture.png
coverWidth: 4836
coverHeight: 1752
coverAlt: TraceFormer 模型结构图，展示时空分块、注意力池化、锥形 Transformer 编码器与事件解码
coverCaption: 模型结构图：从时空分块与注意力池化，经锥形 Transformer 编码器，解码为事件概率。图中展示神经网络部分，完整系统另含后处理。点击可查看原图。
github: https://github.com/MaHao777/TraceFormer
featured: true
status: ongoing
published: true
highlights:
- title: 完整系统
  description: 神经检测器、LightGBM 后处理与轨迹规则协同
- title: 独立复评
  description: 同一 24 序列验证集，全事件计分与预测映射核验
gallery:
- src: /images/traceformer-qualitative.png
  alt: 三个验证序列的输入事件、神经网络预测及完整系统预测对照
  caption: 实际验证片段：输入、选定网络（S）、参考网络（R）与完整系统的预测对照；仍可见漏检和误报。
- src: /images/traceformer-validation.png
  alt: PACT 公开权重、TraceFormer 神经网络与完整系统在 24 个验证序列上的得分
  caption: 同一 24 序列验证集的逐序列比较；训练与开发预算未匹配，不代表同训练协议比较或官方排名。
- src: /images/traceformer-competition.png
  alt: 比赛成绩列表局部截图，红框标出 2026 年 8 月 31 日提交记录及 0.9338 得分
  caption: 历史比赛成绩截图：红框标出 2026 年 8 月 31 日的提交记录，显示得分 0.9338。截图仅保留列表局部，不据此认定最终名次；该记录与本站报告的本地验证结果分开呈现。
---

## 成果

冻结完整系统在 **24 个验证序列**上取得 **验证得分 0.954117**，神经网络单独为 **0.915002**（2026 年 9 月 29 日独立复评）。

这是本地验证结果；验证集参与模型与阈值选择，**不代表官方隐藏测试成绩或比赛名次**。

## 问题与方法

微弱目标事件稀少，背景噪声密集。模型用占用块词元和双向时空锥注意力聚合运动邻域，再映射回原始事件；完整系统结合 LightGBM 后处理、轨迹规则与稠密场景补救。

## 我的贡献

完成 **模型设计、训练、推理和后处理**，组织消融实验与独立复评，并核对每个原始事件的预测数量、顺序和映射。

## 验证比较

| 比较对象 | 验证得分 |
| --- | ---: |
| PACT 公开权重 | 0.803205 |
| TraceFormer 神经网络 | 0.915002 |
| **TraceFormer 完整系统** | **0.954117** |

三者使用同一验证集、事件映射与全局计分；训练和开发预算未匹配，因此仅比较这些具体权重与配置。**0.954117 对应冻结历史系统**，不归因于后续所有模块。

## 交付

**可运行代码、保存的配置与权重、逐序列比较图及困难场景诊断**。神经网络与完整系统指标分别报告。
