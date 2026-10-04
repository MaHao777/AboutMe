import { profile, experiences, featuredResults, interests, timeline } from './profile';
import { presentation } from './presentation';
import { achievements } from './achievements';
import { skillGroups } from './skills';
import { scholarships, languageScores } from './resume';
import type { Locale } from '../lib/i18n';

const chinese = { profile, experiences, featuredResults, interests, timeline, presentation, achievements, skillGroups, scholarships, languageScores };

// Translations describe the same public facts; publication flags stay in the source records.
const english = {
  profile: { ...profile, name: 'Ma Hao', role: 'Optics & Software / Research & Development', location: 'Suzhou, China', school: 'Undergraduate · Soochow University', introduction: 'An undergraduate at Soochow University working across optics and software: wavefront simulation, fringe control, event-based detection, and vehicle communication.', personalIntroduction: 'I play piano, enjoy basketball and photography, and turn everyday ideas into useful tools.' },
  presentation: { ...presentation, home: { caption: 'Optics · Software · Life', work: 'Research & Projects', life: 'Life & Writing' }, work: { heading: ['Research,', 'then create.'], caption: 'Optics × Software', projects: 'Selected projects' }, life: { heading: 'Pages of everyday life.', caption: 'Music · Sport · Photography', notes: 'A few words' } },
  experiences: experiences.map((item, i) => ({ ...item, ...[
    { title: 'Junzheng Fund research project', place: 'School of Optoelectronic Science and Engineering · Soochow University', description: 'Neuromorphic vision for ultrafast wavefront sensing.', outcomes: ['Selected for the 2026 Junzheng Fund', 'Event-based vision and wavefront sensing'] },
    { title: 'Research and optical engineering', place: 'Soochow University', description: 'Built tools for wavefront data, fringe control, and small-target detection.', outcomes: ['Delivered a physics-based data platform', 'Validated calibration and cyclic control', 'Built a detector and independent evaluation pipeline'] },
    { period: 'Internship', title: 'Software development', place: 'Company associated with the Suzhou Automotive Research Institute, Tsinghua University', description: 'Developed MQTT test tools and a ROS 2 relay for smart work vehicles.', outcomes: ['About four months of industry practice', 'Delivered a bidirectional MQTT simulator', 'ROS 2 relay tested and deployed'] },
  ][i] })),
  featuredResults: featuredResults.map((item, i) => ({ ...item, ...[
    { value: 'First Prize', label: 'Optoelectronic Design Competition · Eastern Region', detail: 'Team award; developed the training-data software' },
    { value: '0.9541', label: 'Event-based detection · validation score', detail: 'Frozen complete system, 24 validation sequences; not an official test score' },
    { value: 'Deployed', label: 'Smart vehicles · ROS 2 relay', detail: 'Message processing and forwarding between web and CAN interfaces' },
  ][i] })),
  interests: interests.map((item, i) => ({ ...item, ...[
    { title: 'Music & Piano', description: 'A little space in a busy day, made of melody.' },
    { title: 'Sport', description: 'Basketball and running keep body and mind moving.' },
    { title: 'Photography', description: 'Looking for light, mood, and overlooked moments.' },
    { title: 'Knowledge Management', description: 'Taking notes, connecting ideas, and building tools for my workflow.' },
  ][i] })),
  timeline: timeline.map((item, i) => ({ ...item, ...[
    { year: 'Now', title: 'Between research and development', description: 'Exploring event-based vision, personal tools, and AI agents.' },
    { year: '2026', title: 'Turning ideas into projects', description: 'Optoelectronic design competitions and LuminaMind.' },
    { year: 'Earlier', title: 'Learning by doing', description: 'Building working systems through coursework, competitions, and internships.' },
  ][i] })),
  achievements: achievements.map((item, i) => ({ ...item, ...[
    { label: 'Junzheng Fund', result: 'Research project selected', title: '2026 Junzheng Fund · Soochow University', detail: 'Neuromorphic vision for ultrafast wavefront sensing' },
    { label: 'Optoelectronic Design Competition', result: 'Eastern Region First Prize', title: '14th National Undergraduate Optoelectronic Design Competition', detail: 'Team project: physics-informed, event-based aero-optical characterization' },
    { label: 'OPC Innovation Competition', result: 'Outstanding Project Award', title: 'AISpeech OPC Innovation Competition', detail: 'Project: LuminaMind' },
    { label: '16th Lanqiao Cup', result: 'Jiangsu First Prize', title: '16th Lanqiao Cup · Microcontroller category', detail: 'Jiangsu First Prize and National Excellence Award' },
  ][i] })),
  skillGroups: skillGroups.map((item, i) => ({ ...item, ...[
    { title: 'Languages & Development', items: [...item.items] },
    { title: 'Research & Engineering', items: ['Event cameras', 'PyTorch', 'Wavefront reconstruction', 'MATLAB', 'Closed-loop control', 'ROS 2 / MQTT / CAN'] },
    { title: 'Tools & Workflow', items: [...item.items] },
  ][i] })),
  scholarships: scholarships.map((item, i) => ({ ...item, ...[
    { period: 'Year 1', title: 'Academic Excellence Scholarship · highest tier' },
    { period: 'Year 1', title: 'Comprehensive Scholarship' },
    { period: 'Year 1', title: 'Civic Conduct Scholarship' },
    { period: 'Internship', title: 'JITRI First-Class Internship Scholarship × 2' },
  ][i] })),
  languageScores: languageScores.map((item, i) => ({ ...item, title: i === 0 ? 'College English Test · Band 4' : 'College English Test · Band 6', dateLabel: i === 0 ? 'December 2024' : 'June 2025' })),
};

export function getSiteData(locale: Locale) {
  return locale === 'zh' ? chinese : english;
}
