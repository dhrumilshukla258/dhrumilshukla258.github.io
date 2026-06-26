export const MID = 0.48;

export const easeInOut = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
export const easeOut   = (t: number) => 1 - Math.pow(1 - t, 3);
export const clamp     = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const remap     = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

export const SKIN   = '#c8956c';
export const SKIN_D = '#a0704a';
