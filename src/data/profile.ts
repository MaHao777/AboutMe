export const profile = {
  published: true,
  name: '马浩',
  englishName: 'Ma Hao',
  monogram: 'MH.',
  role: '光电 × 软件 / 研究与开发',
  location: '苏州 · 中国',
  school: '苏州大学 · 本科在读',
  introduction:
    '苏州大学本科在读，专注光电与软件：波前数据生成、条纹控制、事件小目标检测及车辆通信。',
  personalIntroduction:
    '喜欢钢琴、篮球和摄影，也把日常想法做成实用的小工具。',
  email: '2030985559@qq.com' as string | null,
  resumeUrl: null as string | null,
} as const;

if (!profile.published) {
  throw new Error('Profile is not marked public. Refusing to build the site.');
}

export const experiences = [
  {
    published: true,
    period: '2026',
    title: '莙政基金科研项目',
    place: '苏州大学 · 光电科学与工程学院',
    description: '基于神经形态视觉的超高速波前感知技术。',
    outcomes: ['入选 2026 年苏州大学「莙政基金」', '研究方向：事件视觉与超高速波前感知'],
    href: '/projects/event-optics/#junzheng-fund',
  },
  {
    published: true,
    period: '2026',
    title: '科研助理与光电项目实践',
    place: '苏州大学',
    description: '开发波前数据平台、条纹控制程序与事件小目标检测模型。',
    outcomes: ['完成物理链路数据生成软件', '完成条纹标定与循环控制', '构建检测模型与独立评测流程'],
    href: '/projects/event-optics/',
  },
  {
    published: true,
    period: '实习经历',
    title: '软件开发实践',
    place: '清华大学苏州汽车研究院相关企业',
    description: '开发 MQTT 测试工具与 ROS 2 中转节点，参与车辆联调。',
    outcomes: ['约四个月企业实践', '交付双向 MQTT 模拟测试工具', 'ROS 2 中转节点实测上线'],
    href: '/projects/vehicle-communication/',
  },
] as const;

export const featuredResults = [
  { published: true, value: '一等奖', label: '光电设计竞赛 · 东部区赛', detail: '团队作品「极速视界」，承担训练数据软件开发', href: '/projects/event-optics/' },
  { published: true, value: '0.9541', label: '事件小目标检测 · 验证得分', detail: '冻结完整系统，24 序列验证，非官方测试成绩', href: '/projects/traceformer/' },
  { published: true, value: '实测上线', label: '智慧车辆 · ROS 2 通信节点', detail: '网页端与 CAN 端之间的消息处理与转发', href: '/projects/vehicle-communication/' },
] as const;

export const interests = [
  { published: true, number: '01', title: '音乐与钢琴', description: '用旋律给高密度的日常留一点空白。' },
  { published: true, number: '02', title: '运动', description: '篮球、跑步，享受身体和思绪一起动起来。' },
  { published: true, number: '03', title: '摄影与影像', description: '观察光、情绪和那些容易被忽略的瞬间。' },
  { published: true, number: '04', title: '知识管理', description: '持续记录、整理，也尝试为自己的工作流写工具。' },
] as const;

export const timeline = [
  { published: true, year: '现在', title: '在研究与开发之间', description: '持续探索事件视觉、个人工具与人工智能助手。' },
  { published: true, year: '2026', title: '把想法做成作品', description: '参与光电设计竞赛与 LuminaMind 项目。' },
  { published: true, year: '此前', title: '从动手开始', description: '在课程、竞赛与实习中学习把问题落到可运行的系统里。' },
] as const;
