/** Public portfolio content; spatial settings live in cosmos/universeData.ts. */
export const satelliteContent = {
  education: { title: '教育信息', description: '苏州大学 · 集萃行本班 · 大三在读', body: ['光电科学与工程学院', '把课堂里的光电知识，带到科研与工程现场。'] },
  awards: { title: '获奖信息', description: '学习、竞赛与实践中的阶段成果', body: ['学习优秀特等奖学金 · 苏州大学三好学生 · 集萃奖学金', '蓝桥杯江苏省一等奖 · OPC 优秀项目奖 · 光电设计竞赛东部区赛一等奖'] },
  languages: { title: '语言能力', description: 'CET-4 623 · CET-6 606', body: ['高考英语 141 分。', '用英语阅读技术资料，也为更广阔的交流做准备。'] },
  skills: { title: '综合能力', description: '从编程实现，到实验验证与表达', body: ['Python · C / C++ · MATLAB · Qt', '研究数据工具、嵌入式竞赛、通信联调与开源软件。'] },
  wavefront: { title: '波前复原', description: '事件视觉与超高速波前感知', body: ['问题｜怎样为高速波前感知提供可复现的数据？', '方法｜串联湍流波前、哈特曼光斑和事件响应。', '成果｜交付数据平台；团队获光电设计竞赛东部区赛一等奖，相关课题入选莙政基金。'] },
  fringe: { title: '条纹锁定', description: '从相位变化，到压电补偿', body: ['问题｜环境扰动让干涉条纹发生漂移。', '方法｜相机采集、相位解调与 PZT 反馈控制。', '成果｜完成整体标定与循环控制验证，持续推进 Qt / C++ 集成。'] },
  detection: { title: '微弱目标检测', description: 'TraceFormer · 在稀疏事件中寻找目标', body: ['问题｜目标事件微弱，背景噪声密集。', '方法｜时空注意力检测器，结合 LightGBM 与轨迹后处理。', '成果｜完整系统在 24 个序列上独立复评，验证得分 0.954117。'] },
  configuration: { title: '自动配置功能', description: '面向不同机型的程序适配', body: ['问题｜新增机型需要适配既有遥控程序。', '方法｜围绕机型差异修改配置与程序，结合日志排查和联调。', '成果｜参与不同机型的程序适配与升级。'] },
  testing: { title: '自动化测试软件', description: '把通信问题提前暴露在调试之前', body: ['问题｜远程现场联调耗时，基础问题反复出现。', '方法｜用 Python / Tkinter 开发双向 MQTT 模拟测试工具。', '成果｜支持连接、模拟发送、订阅接收与日志查看。'] },
  ros2: { title: 'ROS2 通讯节点', description: '连接网页端与 CAN 通信端', body: ['问题｜自主作业业务需要打通中间通信层。', '方法｜基于 ROS 2 开发消息处理与转发节点。', '成果｜参与现场联调，节点完成实测并上线。'] },
  music: { title: '音乐和钢琴', description: '大二开始自学钢琴', body: ['练过《Merry Christmas, Mr. Lawrence》等曲目。', '在代码和实验之外，给旋律留一点时间。'] },
  basketball: { title: '篮球', description: '八年球龄，仍然喜欢下一场球', body: ['球场是日常的一部分。', '从一次投篮、一次配合，到和朋友一起打完一场。'] },
  writing: { title: '写作', description: '微信公众号 · 把经历写成自己的文字', body: ['写日常，也写工具、知识管理和实践。', '关于日记、原子笔记与智能助手的一些分享。'] },
  qq: { title: 'QQ', description: '2030985558', body: ['QQ 邮箱：2030985558@qq.com', '欢迎通过邮件交流。'] },
  wechat: { title: '微信', description: 'enthusiastic8888', body: ['聊研究、软件，也聊音乐和篮球。', '展开详情，一键复制微信号。'] },
  github: { title: 'GitHub', description: 'MaHao777 · Maaaaa', body: ['把想法写成代码，也把过程留在仓库里。', '开源项目与持续的实践记录。'] },
  gmail: { title: 'Gmail', description: 'haoma5171@gmail.com', body: ['另一种联系我的方式。', '期待新的想法与合作。'] },
} as const;
export type SatelliteId = keyof typeof satelliteContent;

export const awardRecords = [
  { title: '苏州大学学习优秀特等奖学金', type: '奖学金', description: '大一学习阶段。' },
  { title: '苏州大学三好学生', type: '荣誉', description: '学习与综合表现的阶段记录。' },
  { title: '集萃奖学金', type: '实践', description: '两次集萃实习一等奖学金。' },
  { title: '蓝桥杯江苏省一等奖', type: '竞赛', description: '第十六届蓝桥杯，单片机设计与开发大学组。', image: '/images/certificates/lanqiao-first.png', alt: '蓝桥杯江苏省一等奖证书，证件与证书号码已遮盖' },
  { title: 'OPC 大赛优秀项目奖', type: '竞赛', description: '2026 金鸡湖创新创业大赛 OPC 专场赛，作品 LuminaMind。', image: '/images/certificates/opc.jpg', alt: 'LuminaMind 项目获得 OPC 创新大赛优秀项目奖的证书' },
  { title: '光电设计竞赛东部区赛一等奖', type: '竞赛', description: '第十四届全国大学生光电设计竞赛，团队作品《极速视界》。', image: '/images/certificates/optoelectronics.jpg', alt: '极速视界团队获得全国大学生光电设计竞赛东部区赛一等奖的证书' },
] as const;
export const languageScores = [
  { code: 'CET-4', title: '大学英语四级', score: 623, date: '2024 年 12 月', image: '/images/certificates/cet4.png' },
  { code: 'CET-6', title: '大学英语六级', score: 606, date: '2025 年 6 月', image: '/images/certificates/cet6.png' },
] as const;
export const contacts = [
  { id: 'qq', title: 'QQ', value: '2030985558@qq.com', href: 'mailto:2030985558@qq.com', action: '发送邮件', description: 'QQ 号 2030985558，也可以直接通过 QQ 邮箱联系。' },
  { id: 'wechat', title: '微信', value: 'enthusiastic8888', description: '添加时欢迎简单介绍一下自己，期待新的交流。' },
  { id: 'github', title: 'GitHub', value: 'MaHao777 (Maaaaa)', href: 'https://github.com/MaHao777', action: '访问 GitHub', description: '我的开源项目、工具和代码记录。' },
  { id: 'gmail', title: 'Gmail', value: 'haoma5171@gmail.com', href: 'mailto:haoma5171@gmail.com', action: '发送邮件', description: '关于研究、开发与合作，欢迎来信。' },
] as const;
export const skillEvidence = [
  { title: 'Python · 数据与工具', description: 'PySide6 波前数据生成平台、PyTorch 检测模型，以及 Tkinter 通信测试工具。', detail: '波前数据平台运行界面', image: '/images/event-optics-interface.png', alt: 'Python 与 PySide6 开发的波前数据平台运行界面' },
  { title: 'C / C++ · 嵌入式与实验软件', description: '单片机设计与开发竞赛；Qt / C++ 相机采集、串口压电控制集成。', detail: '蓝桥杯江苏省一等奖证书', image: '/images/certificates/lanqiao-first.png', alt: '蓝桥杯单片机设计与开发省一等奖证书' },
  { title: 'MATLAB · 标定与闭环验证', description: '相位解调、整体标定与采集—补偿循环控制。', detail: '条纹锁定实验记录', image: '/images/fringe-lock-experiment.jpg', alt: '条纹锁定实验中的参考条纹、相位误差与控制曲线' },
  { title: '工程协作与表达', description: '日志溯源、接口联调、模型评测、项目演示与答辩。', detail: '车辆通信业务架构', image: '/images/project-vehicle.png', alt: 'MQTT 和 ROS 2 车辆通信业务架构图' },
] as const;
export const internshipDetails = [
  { id: 'configuration', title: '自动配置功能', subtitle: '不同机型的程序适配与配置', result: '参与机型适配、调试与升级',
    problem: '遥控业务支持的机型逐渐增加，既有程序需要根据不同机型进行适配。',
    method: ['围绕机型差异参与程序配置与代码适配。', '结合日志追踪问题，在联调中检查不同机型的运行情况。', '参与缺陷排查、修复和程序升级。'],
    outcome: '完成相关机型的程序适配工作。这里展示目前已有记录的实践；自动配置的具体触发流程与交付界面将在补充材料后展开。' },
  { id: 'testing', title: '自动化测试软件', subtitle: '双向 MQTT 模拟测试工具', result: '连接、模拟发送、订阅与日志',
    problem: '远程联调需要现场同事等待；如果基础通信问题只能在现场暴露，会增加调试成本。',
    method: ['使用 Python / Tkinter 构建桌面测试界面，显示连接状态与日志。', '连接 MQTT 服务端，模拟上位机向对应机型发送遥控消息。', '订阅下位机消息，完成双向通信检查，让基础问题提前暴露。'],
    outcome: '交付可用于正式联调前的通信测试工具。现有记录支持模拟发送、接收和日志查看，尚未给出自动化用例覆盖率或量化提效数据。' },
  { id: 'ros2', title: 'ROS2 通讯节点', subtitle: '网页端与 CAN 端之间的消息中转', result: '完成实测并上线',
    problem: '自主作业业务推进时，需要在网页端与 CAN 通信端之间建立消息处理与转发链路。',
    method: ['基于 ROS 2 编写通信中转节点。', '完成上下游消息的处理与转发。', '配合现场测试，结合日志排查和修复通信问题。'],
    outcome: '节点经过实际测试并上线，打通自主作业业务中的中间通信层。' },
] as const;
