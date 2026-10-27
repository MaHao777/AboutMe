import { translator, type Locale } from '../lib/i18n';

export function getProjectStories(locale: Locale) {
  const t = translator(locale);
  return [
    {
      slug: 'event-optics',
      title: t('事件视觉与波前数据平台', 'Event vision & wavefront data'),
      description: t('从物理仿真到事件响应，构建可生成、录制与回放的数据系统。', 'A complete data workflow, from optical simulation to event generation, recording, and playback.'),
      contribution: t('我负责训练数据软件开发，并参与团队展示与答辩。', 'I developed the training-data software and contributed to the team presentation.'),
      result: t('东部区赛一等奖 · 团队作品', 'Eastern Region First Prize · team project'),
      honors: [t('光电设计竞赛东部区赛一等奖', 'Optoelectronic Design Competition · Eastern Region First Prize'), t('2026 年莙政基金项目入选', 'Selected for the 2026 Junzheng Fund')],
      cover: '/images/cover-wavefront.svg',
      coverAlt: t('波前相位与事件光斑的概念可视化，非实测数据', 'Concept artwork of a wavefront phase field and event spots; not measured data'),
      image: '/images/event-optics-interface.png', width: 2879, height: 1654,
      evidenceLabel: t('软件实图', 'Software interface'),
      caption: t('实际软件界面：数据生成页；重构未启用。', 'Actual software interface: data generation, reconstruction disabled.'),
    },
    {
      slug: 'traceformer',
      title: 'TraceFormer',
      description: t('从稀疏事件流中检测微弱目标，完成模型、后处理与独立复评。', 'Detecting faint targets in sparse event streams, with a model, postprocessing, and independent evaluation.'),
      contribution: t('模型设计、训练、后处理与对照实验。', 'Model design, training, postprocessing, and controlled comparisons.'),
      result: t('0.9541 · 完整系统本地验证 / 24 序列', '0.9541 · complete-system local validation / 24 sequences'),
      honors: [],
      cover: '/images/cover-traceformer.svg',
      coverAlt: t('稀疏事件点与目标运动轨迹的概念可视化，非模型预测结果', 'Concept artwork of sparse events and a target trajectory; not model predictions'),
      image: '/images/traceformer-qualitative.png', width: 1298, height: 1141,
      evidenceLabel: t('验证实图', 'Validation excerpts'),
      caption: t('实际验证片段：输入与预测对照，仍有漏检与误报。', 'Actual validation excerpts: inputs and predictions, including remaining errors.'),
    },
    {
      slug: 'vehicle-communication',
      title: t('车辆通信与测试', 'Vehicle communication'),
      description: t('在约四个月的企业实践中，连接网页、MQTT 与 CAN，交付测试工具和 ROS 2 中转节点。', 'Connecting web, MQTT, and CAN during an industry internship of about four months, delivering a test tool and ROS 2 relay.'),
      contribution: t('测试工具开发、节点实现与现场联调。', 'Test tooling, relay implementation, and field integration.'),
      result: t('ROS 2 中转节点 · 实测上线', 'ROS 2 relay · tested and deployed'),
      honors: [],
      cover: '/images/cover-vehicle.svg',
      coverAlt: t('网页、MQTT、ROS 2 与车辆的通信概念插画，非实际车辆照片', 'Concept illustration of web, MQTT, ROS 2, and vehicle communication; not a vehicle photograph'),
      image: '/images/project-vehicle.png', width: 1602, height: 833,
      evidenceLabel: t('业务架构图', 'System architecture'),
      caption: t('实习期间绘制的实际通信业务架构。', 'Actual communication architecture drawn during the internship.'),
    },
  ];
}
