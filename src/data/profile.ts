export const profile = {
  published: true,
  name: '马浩',
  englishName: 'Ma Hao',
  monogram: 'MH.',
  role: '光电 × 软件 / Research & Development',
  location: '苏州 · 中国',
  school: '苏州大学 · 本科在读',
  introduction:
    '我关注光电与软件的交叉点，在事件视觉研究、工程开发和个人工具项目中持续动手解决问题。',
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
    title: '光电与事件视觉项目实践',
    place: '苏州大学',
    description: '参与事件相机与波前重构相关项目，负责训练数据生成软件开发，并参与展示与答辩。',
  },
  {
    published: true,
    period: '实习经历',
    title: '软件开发实践',
    place: '清华大学苏州汽车研究院相关企业',
    description: '参与智慧作业车辆项目，开发 MQTT 通信测试工具和 ROS 2 消息中转节点，协助联调与问题排查。',
  },
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
