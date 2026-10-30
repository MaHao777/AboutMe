const LIGHT_LEVELS = [0, 1, 0, 4, 1, 5, 2, 7, 2, 9] as const;

/** 外缘到内缘的明暗峰谷，节点之间保持零切线的连续过渡。 */
export function accretionLight(inward: number) {
  const position = Math.max(0, Math.min(1, inward)) * (LIGHT_LEVELS.length - 1);
  const index = Math.floor(position);
  const fraction = position - index;
  const eased = fraction * fraction * (3 - 2 * fraction);
  const from = LIGHT_LEVELS[index];
  const to = LIGHT_LEVELS[Math.min(index + 1, LIGHT_LEVELS.length - 1)];
  return (from + (to - from) * eased) / 9;
}

/** 实际半厚度，单位与场景一致；内侧隆起，外缘接近薄片。 */
export function accretionHalfThickness(inward: number) {
  return .055 + 3.9 * Math.max(0, Math.min(1, inward)) ** 2.6;
}

export const LENS_RADIUS = 1.38;
export const LENS_JOIN_START = LENS_RADIUS * .8;
export const LENS_JOIN_END = 2.15;
const span = LENS_JOIN_END - LENS_JOIN_START;
const startHeight = Math.sqrt(LENS_RADIUS ** 2 - LENS_JOIN_START ** 2);
const startTangent = -LENS_JOIN_START / startHeight * span;
const endHeight = .12;

// 三次曲线在圆弧端保持原切线，在盘面端切线水平，消除平切断口。
export const LENS_SHOULDER_COEFFICIENTS = [
  2 * startHeight - 2 * endHeight + startTangent,
  -3 * startHeight + 3 * endHeight - 2 * startTangent,
  startTangent,
  startHeight,
] as const;

export function lensShoulder(x: number, side = 1) {
  const distance = Math.abs(x);
  if (distance <= LENS_JOIN_START) {
    const height = Math.sqrt(LENS_RADIUS ** 2 - distance ** 2);
    return { height: side * height, slope: -side * distance / height };
  }
  const t = Math.min(1, (distance - LENS_JOIN_START) / span);
  const [a, b, c, d] = LENS_SHOULDER_COEFFICIENTS;
  return {
    height: side * (((a * t + b) * t + c) * t + d),
    slope: distance >= LENS_JOIN_END ? 0 : side * ((3 * a * t + 2 * b) * t + c) / span,
  };
}
