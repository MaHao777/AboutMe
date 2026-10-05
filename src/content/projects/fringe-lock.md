---
title: 干涉条纹闭环锁定
description: 面向全息光栅制备，把线阵相机采集、相位解调与压电补偿串成闭环。
date: 2026-07-21
role: 相机接入、标定测试、控制程序开发与实验联调
category: 精密控制
outcome: 完成标定与循环控制验证
order: 2
technologies:
- MATLAB
- C++
- Qt
- Sapera SDK
- PZT
- 闭环控制
cover: /images/fringe-lock-experiment.jpg
coverWidth: 1706
coverHeight: 1280
coverAlt: 条纹锁定实验界面照片，显示参考与当前条纹、相位误差、压电位置及控制指令曲线
coverCaption: 2026 年 7 月 21 日实验界面照片：记录条纹对照、相位误差、PZT 位置与控制指令。单次运行记录不作为锁定精度或长期稳定性的完整评估。点击可查看原图。
featured: true
status: ongoing
published: true
highlights:
- title: 实验闭环
  description: 2026 年 7 月完成整体标定与循环控制
- title: 软件工程化
  description: 持续推进 Qt/C++ 相机采集与压电控制集成
---

## 成果

**2026 年 7 月完成整体标定与循环控制验证**，打通相机采集、相位解调和压电补偿的实验闭环。

## 问题与方法

全息光栅制备中的环境扰动会使干涉条纹漂移。系统记录参考条纹、提取固定载频，通过标定建立相位变化与压电位移的关系，再根据实时误差反馈补偿。

## 我的贡献

- **接入线阵相机**，调试采集流程并参与标定测试。
- 开发 MATLAB 控制程序，串联采集、解调与补偿循环，参与实验联调。
- 推进 **Qt/C++ 桌面程序**，集成相机与串口压电驱动。

## 当前进展

MATLAB 实验闭环已验证，Qt/C++ 迁移与硬件测试仍在推进。锁定精度、响应时间及长期稳定性尚待实测评估。
