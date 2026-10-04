export const profile = {
  published: true,
  name: '马浩',
  englishName: 'Ma Hao',
  monogram: 'MH.',
  role: '光电 × 软件 / Research & Development',
  location: '苏州 · 中国',
  school: '苏州大学 · 本科在读',
  introduction:
    '苏州大学本科在读，关注光电与软件的交叉。做过波前数据生成、干涉条纹闭环锁定、事件流微弱目标检测，也在企业实习中开发过车辆通信与测试工具。',
  personalIntroduction:
    '喜欢弹琴、打篮球、拍照，也喜欢把日常里冒出的想法做成真正能用的小工具。',
  email: null as string | null,
  resumeUrl: null as string | null,
} as const;

if (!profile.published) {
  throw new Error('Profile is not marked public. Refusing to build the site.');
}

export const experiences = [
  {
    published: true,
    period: '2026',
    title: '科研助理与光电项目实践',
    place: '苏州大学',
    description: '围绕高速感知、精密控制与智能探测，开发波前数据平台、条纹锁定程序和事件小目标检测模型。',
    outcomes: ['完成物理链路数据生成软件', '完成条纹标定与循环控制', '构建检测模型与独立评测流程'],
    href: '/projects/event-optics/',
  },
  {
    published: true,
    period: '实习经历',
    title: '软件开发实践',
    place: '清华大学苏州汽车研究院相关企业',
    description: '参与智慧作业车辆项目，开发 MQTT 通信测试工具和 ROS 2 消息中转节点，协助联调与问题排查。',
    outcomes: ['约四个月企业实践', '交付双向 MQTT 模拟测试工具', 'ROS 2 中转节点实测上线'],
    href: '/projects/vehicle-communication/',
  },
] as const;

export const featuredResults = [
  { published: true, value: '一等奖', label: '光电设计竞赛 · 东部区赛', detail: '团队作品「极速视界」，承担训练数据软件开发', href: '/projects/event-optics/' },
  { published: true, value: '0.9541', label: '事件小目标检测 · 验证 Score', detail: '冻结完整系统，24 序列验证，非官方测试成绩', href: '/projects/traceformer/' },
  { published: true, value: '实测上线', label: '智慧车辆 · ROS 2 通信节点', detail: '网页端与 CAN 端之间的消息处理与转发', href: '/projects/vehicle-communication/' },
] as const;

export const interests = [
  { published: true, number: '01', title: '音乐与钢琴', description: '用旋律给高密度的日常留一点空白。' },
  { published: true, number: '02', title: '运动', description: '篮球、跑步，享受身体和思绪一起动起来。' },
  { published: true, number: '03', title: '摄影与影像', description: '观察光、情绪和那些容易被忽略的瞬间。' },
  { published: true, number: '04', title: '知识管理', description: '持续记录、整理，也尝试为自己的工作流写工具。' },
] as const;

export const timeline = [
  { published: true, year: '现在', title: '在研究与开发之间', description: '围绕事件视觉、个人工具和 AI Agent 持续探索。' },
  { published: true, year: '2026', title: '把想法做成作品', description: '参与光电设计竞赛与 LuminaMind 项目。' },
  { published: true, year: '此前', title: '从动手开始', description: '在课程、竞赛与实习中学习把问题落到可运行的系统里。' },
] as const;
