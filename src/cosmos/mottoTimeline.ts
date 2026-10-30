export const MOTTO_SWITCH_INTERVAL = 120;
export const MOTTO_MORPH_DURATION = 3.2;
export const MOTTO_TEXT = ['无限进步', 'NEVER STOP'] as const;

/** The interval is measured in active scene time, without browser timers. */
export function mottoTimeline(seconds: number, reducedMotion = false) {
  const elapsed = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const epoch = Math.floor(elapsed / MOTTO_SWITCH_INTERVAL);
  const target = (epoch % 2) as 0 | 1;
  const phase = elapsed - epoch * MOTTO_SWITCH_INTERVAL;
  const changing = epoch > 0 && phase < MOTTO_MORPH_DURATION && !reducedMotion;
  const progress = changing ? phase / MOTTO_MORPH_DURATION : 1;
  const source = (changing ? 1 - target : target) as 0 | 1;
  const visible = changing && progress < .5 - 1e-10 ? source : target;
  return { source, target, progress, changing, text: MOTTO_TEXT[visible] };
}
