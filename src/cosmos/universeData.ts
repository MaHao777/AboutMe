export interface ContentEntry {
  id: string;
  title: string;
  description: string;
  body: string[];
  detailId?: string;
}

export interface SatelliteData extends ContentEntry {
  radius: number;
  orbit: number;
  phase: number;
}

export interface OrbitOrientation {
  tilt: number;
  roll: number;
}

export interface PlanetData extends ContentEntry {
  index: string;
  subtitle: string;
  color: string;
  position: [number, number, number];
  radius: number;
  ring?: boolean;
  orbitOrientation: OrbitOrientation;
  satellites: SatelliteData[];
}

export const ROUTE_LENGTH = 328;
export const BLACK_HOLE_Z = -350;

// Travel is always along -Z. Safe orbit radius + satellite radius leaves |x| > 3.5.
// Build-time public content enriches these spatial entries in UniverseContent.astro.
export const universeData: PlanetData[] = [
  {
    id: 'growth', index: '01', title: '个人发展与成就', subtitle: 'GROWTH',
    description: '从一次尝试，到下一个里程碑。',
    body: ['学习经历、竞赛与科研成果，以及把想法做成作品的过程。'],
    color: '#e6b978', position: [-13, 4, -40], radius: 4.3, ring: true,
    orbitOrientation: { tilt: -1.04, roll: .18 },
    satellites: [
      { id: 'milestones', title: '成长里程碑', description: '学习、实践与新的出发。', body: ['从课程项目走向科研和工程实践。'], radius: .65, orbit: 6.7, phase: .5 },
      { id: 'awards', title: '竞赛与成果', description: '记录共同完成的作品。', body: ['科研、竞赛与学习中的阶段成果。'], radius: .8, orbit: 7.4, phase: 3.4 },
      { id: 'luminamind', title: 'LuminaMind', description: '让长期记忆可见、可编辑、可迁移。', body: ['桌面智能助手。'], radius: .7, orbit: 7.7, phase: 5.4 },
    ],
  },
  {
    id: 'research', index: '02', title: '科研经历', subtitle: 'RESEARCH',
    description: '探索我的科研项目与技术成果。',
    body: ['围绕光电与事件视觉，把研究问题变成可验证的软件与实验。', '三颗卫星分别代表波前复原、条纹锁定和目标检测。'],
    color: '#82c8eb', position: [14, -6, -94], radius: 4.8,
    orbitOrientation: { tilt: -.85, roll: -.58 },
    satellites: [
      { id: 'wavefront', title: '波前复原', description: '事件视觉与超高速波前感知。', body: ['波前数据平台与事件光学研究。'], radius: .8, orbit: 7.3, phase: .4 },
      { id: 'fringe', title: '条纹锁定', description: '条纹标定与循环控制。', body: ['相机采集、相位解调与压电补偿。'], radius: .65, orbit: 8.1, phase: 2.5 },
      { id: 'detection', title: '目标检测', description: '事件相机中的微小目标。', body: ['事件小目标检测模型及独立评测流程。'], radius: .9, orbit: 8.5, phase: 4.6 },
    ],
  },
  {
    id: 'internship', index: '03', title: '实习经历', subtitle: 'PRACTICE',
    description: '让代码进入真实的工程现场。',
    body: ['从通信测试工具到实际联调，在真实约束中学习交付。'],
    color: '#b3a1ec', position: [-13, 10, -148], radius: 4.1,
    orbitOrientation: { tilt: -1.15, roll: .72 },
    satellites: [
      { id: 'vehicle', title: '车辆通信实践', description: 'MQTT 测试工具与 ROS 2 中转节点。', body: ['网页端与车辆通信链路之间的消息处理、测试和联调实践。'], radius: .8, orbit: 7, phase: 1 },
      { id: 'engineering', title: '工程记录', description: '从实现到验证，再到交付。', body: ['实践中的问题、决策与学习记录。'], radius: .6, orbit: 7.8, phase: 3.8 },
    ],
  },
  {
    id: 'life', index: '04', title: '生活经历', subtitle: 'LIFE',
    description: '航道之外，也有值得停留的片刻。',
    body: ['音乐、运动与摄影，为日常留下一点空白。', '此处只使用已公开的兴趣主题，不引入私人日记或照片。'],
    color: '#8bcbb1', position: [13, -9, -202], radius: 4.4, ring: true,
    orbitOrientation: { tilt: -.55, roll: -.24 },
    satellites: [
      { id: 'music', title: '音乐与钢琴', description: '用旋律记录生活。', body: ['音乐、运动与生活中的片刻。'], radius: .7, orbit: 7, phase: 1.7 },
      { id: 'photography', title: '生活与文字', description: '观察光与容易被忽略的瞬间。', body: ['日常记录与公开文章。'], radius: .8, orbit: 7.7, phase: 4.7 },
      { id: 'wangdesk', title: 'WangDesk', description: '桌面宠物与日常工具。', body: ['开源 Windows 桌面工具。'], radius: .6, orbit: 7.3, phase: .35 },
    ],
  },
  {
    id: 'contact', index: '05', title: '联系方式', subtitle: 'CONTACT',
    description: '让下一次交流从这里开始。',
    body: ['这段航程的最后一颗主题星球，留给新的连接。继续前进将抵达黑洞并返回航道起点。'],
    color: '#df9b9c', position: [-13, 7, -256], radius: 3.8,
    orbitOrientation: { tilt: -1.2, roll: -.78 },
    satellites: [
      { id: 'hello', title: '打个招呼', description: '交流想法与合作方向。', body: ['邮件、GitHub 与个人简历。'], radius: .7, orbit: 6.5, phase: .8 },
    ],
  },
];
