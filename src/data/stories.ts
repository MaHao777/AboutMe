import { translator, type Locale } from '../lib/i18n';

// Public project summaries: preserve contribution boundaries and result scope.
export function getProjectStories(locale: Locale) {
  const t = translator(locale);
  return [
    {
      slug: 'event-optics', number: '01', label: 'EVENT VISION / OPTICS',
      question: t('让事件相机，\n看见变化的波前。', 'Making changing\nwavefronts visible.'),
      description: t('光的变化，如何变成可以研究的数据？从湍流波前、哈特曼光斑到事件响应，我把一条物理链路写进了桌面软件。', 'How does changing light become research data? I built a desktop platform connecting turbulent wavefronts, Hartmann spots, and event responses.'),
      contribution: t('我负责数据生成、录制与回放软件，并参与团队展示与答辩。', 'I developed the data generation, recording, and playback software, and contributed to the team presentation.'),
      result: t('团队获光电设计竞赛东部区赛一等奖', 'Team award · Eastern Region First Prize'),
      image: '/images/event-optics-interface.png', width: 2879, height: 1654,
      caption: t('真实软件运行界面 · 数据生成页，重构未启用', 'Actual software interface · data generation, reconstruction disabled'),
    },
    {
      slug: 'traceformer', number: '02', label: 'MACHINE LEARNING / EVENT STREAM',
      question: t('在噪声之中，\n寻找微弱的轨迹。', 'Finding faint traces\ninside the noise.'),
      description: t('当目标只有稀疏的几个事件，怎样把它从背景中找出来？从模型设计到后处理，再用独立复评核对每个事件。', 'How do you find a target made of only a few events? From model design to postprocessing, I verify predictions down to each original event.'),
      contribution: t('我完成模型、训练、后处理与对照实验。', 'I developed the model, training, postprocessing, and controlled comparisons.'),
      result: t('0.9541 · 完整系统本地验证得分 / 24 序列', '0.9541 · complete-system local validation / 24 sequences'),
      image: '/images/traceformer-qualitative.png', width: 1298, height: 1141,
      caption: t('实际验证片段 · 输入与预测对照，仍有漏检与误报', 'Actual validation excerpts · inputs and predictions, with remaining errors'),
    },
    {
      slug: 'vehicle-communication', number: '03', label: 'ENGINEERING / IN THE FIELD',
      question: t('从一条消息，\n到真正运行的车辆。', 'From a message\nto a working vehicle.'),
      description: t('软件写完，离现场运行还有多远？在约四个月的企业实践里，让网页、MQTT 与 CAN 之间的通信真正连起来。', 'What does it take to move from code to the field? During an industry internship of about four months, I connected web, MQTT, and CAN communication.'),
      contribution: t('我开发双向测试工具、ROS 2 中转节点，并参与现场联调。', 'I built the bidirectional test tool and ROS 2 relay, and joined field integration.'),
      result: t('ROS 2 通信中转节点 · 实测上线', 'ROS 2 communication relay · tested and deployed'),
      image: '/images/project-vehicle.png', width: 1602, height: 833,
      caption: t('实习期间绘制的通信业务架构图', 'Communication architecture drawn during the internship'),
    },
  ];
}
