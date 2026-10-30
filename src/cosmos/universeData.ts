import { satelliteContent, type SatelliteId } from '../data/portfolio.ts';

export interface ContentEntry {
  id: string;
  title: string;
  description: string;
  body: readonly string[];
  detailId?: string;
}
export interface SatelliteData extends ContentEntry { radius: number; orbit: number; phase: number; }
export interface OrbitOrientation { tilt: number; roll: number; }
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
function satellite(id: SatelliteId, radius: number, orbit: number, phase: number): SatelliteData {
  return { ...satelliteContent[id], id, detailId: id, radius, orbit, phase };
}
/** Five planets and seventeen satellites; travel follows the negative Z axis. */
export const universeData: PlanetData[] = [
  {
    id: 'profile', index: '01', title: '基本信息', subtitle: 'ABOUT ME',
    description: '关于我，从这里开始。', body: ['苏州大学 · 马浩 · 大三在读'],
    color: '#e6b978', position: [-13, 4, -40], radius: 4.3, ring: true,
    orbitOrientation: { tilt: -1.04, roll: .18 },
    satellites: [satellite('education', .65, 6.7, .4), satellite('awards', .8, 7.4, 1.97), satellite('languages', .7, 7.7, 3.54), satellite('skills', .65, 7.3, 5.11)],
  },
  {
    id: 'research', index: '02', title: '科研经历', subtitle: 'RESEARCH',
    description: '让一个问题，成为一次探索。', body: ['波前复原 · 条纹锁定 · 微弱目标检测'],
    color: '#82c8eb', position: [14, -6, -94], radius: 4.8,
    orbitOrientation: { tilt: -.85, roll: -.58 },
    satellites: [satellite('wavefront', .8, 7.3, .4), satellite('fringe', .65, 8.1, 2.5), satellite('detection', .9, 8.5, 4.6)],
  },
  {
    id: 'internship', index: '03', title: '实习经历', subtitle: 'PRACTICE',
    description: '让代码进入真实的工程现场。', body: ['程序配置 · 测试工具 · ROS 2 通信'],
    color: '#b3a1ec', position: [-13, 10, -148], radius: 4.1,
    orbitOrientation: { tilt: -1.15, roll: .72 },
    satellites: [satellite('configuration', .65, 7, .6), satellite('testing', .8, 7.8, 2.7), satellite('ros2', .7, 7.3, 4.8)],
  },
  {
    id: 'life', index: '04', title: '兴趣爱好', subtitle: 'OFF THE CLOCK',
    description: '旋律、球场，还有一些文字。', body: ['音乐和钢琴 · 篮球 · 写作'],
    color: '#8bcbb1', position: [13, -9, -202], radius: 4.4, ring: true,
    orbitOrientation: { tilt: -.55, roll: -.24 },
    satellites: [satellite('music', .7, 7, .4), satellite('basketball', .8, 7.7, 2.5), satellite('writing', .6, 7.3, 4.6)],
  },
  {
    id: 'contact', index: '05', title: '联系方式', subtitle: 'SAY HELLO',
    description: '下一次交流，从这里开始。', body: ['QQ · 微信 · GitHub · Gmail'],
    color: '#df9b9c', position: [-13, 7, -256], radius: 3.8,
    orbitOrientation: { tilt: -1.2, roll: -.78 },
    satellites: [satellite('qq', .65, 6.5, .3), satellite('wechat', .7, 7, 1.87), satellite('github', .75, 7.3, 3.44), satellite('gmail', .6, 6.8, 5.01)],
  },
];
