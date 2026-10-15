export const SIZES = {
  small:  { fontSize: 18, lineHeight: 28, badge: 16, emote: 24 },
  medium: { fontSize: 28, lineHeight: 44, badge: 24, emote: 36 },
  large:  { fontSize: 40, lineHeight: 60, badge: 32, emote: 52 },
  xlarge: { fontSize: 52, lineHeight: 76, badge: 40, emote: 68 },
} as const;

export type TextSize = keyof typeof SIZES;

export function getStroke(s: string): string {
  const w: Record<string, number> = { thin: 1, medium: 2, thick: 3, thicker: 4 };
  const px = w[s] ?? 0;
  if (!px) return "";
  return `${px}px ${px}px 0 black,-${px}px ${px}px 0 black,${px}px -${px}px 0 black,-${px}px -${px}px 0 black`;
}

export function getMsgShadow(s: string): string {
  const a: Record<string, number> = { small: 0.35, medium: 0.55, large: 0.75 };
  const o = a[s] ?? 0;
  return o ? `drop-shadow(2px 2px 3px rgba(0,0,0,${o}))` : "";
}
