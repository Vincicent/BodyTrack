import { MEASUREMENT_SITES, type MeasurementSite } from '@/shared/lib/measurementSites';

/**
 * Closed smooth curve through `points` (Catmull-Rom spline, written as SVG cubic Béziers): the drawing passes through
 * every point, with no corners.
 */
export function smoothClosedPath(points: readonly (readonly [number, number])[]): string {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n]!;
  const f = (v: number) => Number(v.toFixed(1));
  let d = `M${f(at(0)[0])} ${f(at(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0]!)} ${f(c1[1]!)} ${f(c2[0]!)} ${f(c2[1]!)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

/**
 * Half of the body, as [distance from the centre line, height], from the top of the head down the outside of the
 * arm, back up its inside to the armpit, down the side and the outside of the leg, then up its inside to the crotch.
 * Realistic adult proportions: the head is ~1/7.5 of the height, the crotch at half height, elbows at the waist,
 * wrists at the crotch, knees a quarter of the way up.
 */
const HALF_BODY: readonly (readonly [number, number])[] = [
  // head (jaw, then a neck narrower than the head)
  [0, 2],
  [6, 2.5],
  [10, 6],
  [11.5, 12],
  [11.5, 18],
  [10.5, 24],
  [9, 28.5],
  [6.5, 32],
  [5, 35],
  [5, 40],
  [6, 43],
  // trapezius slope, rounded shoulder, outside of the arm: biceps, elbow, forearm, narrow wrist, hand
  [12, 45],
  [20, 47.5],
  [26, 50],
  [29.5, 54],
  [31, 60],
  [31.5, 66],
  [31.5, 74],
  [31, 82],
  [30.5, 88],
  [31.5, 96],
  [31, 106],
  [29.5, 116],
  [30.5, 120],
  [31, 126],
  [30, 132],
  [28, 135.5],
  // inside of the hand and arm, back up to the armpit
  [26, 134],
  [25.5, 128],
  [26, 120],
  [25.5, 112],
  [25, 100],
  [24.5, 90],
  [24, 80],
  [23, 70],
  [22, 63],
  // side: ribcage tapering to the waist, then the hips
  [21, 68],
  [20.5, 78],
  [18, 90],
  [16, 99],
  [16.5, 104],
  [18.5, 111],
  [20.5, 117],
  [21, 124],
  // outside of the leg: thigh, knee, calf (higher outside), ankle, foot
  [20.5, 132],
  [19.5, 145],
  [18, 158],
  [16, 168],
  [15.5, 174],
  [16.5, 180],
  [17.5, 188],
  [16, 198],
  [13, 210],
  [10.5, 221],
  [11, 226],
  [12, 231],
  [14, 236],
  [12, 239],
  [5, 239],
  // inside of the leg, back up: ankle, calf (lower inside), knee, thigh, crotch
  [4, 235],
  [4.5, 228],
  [5, 222],
  [6.5, 210],
  [7.5, 196],
  [6.5, 184],
  [5, 176],
  [4.5, 168],
  [4, 155],
  [3, 138],
  [1.5, 128],
  [0, 126],
];

/**
 * A neutral, realistic front-view silhouette in one line (head included), in its own 120 × 242 coordinates: no
 * gender, no "ideal" body, and it never changes shape with the measurements (a drawing of someone's body built from a
 * few numbers would be wrong, and hurt). The right half is the left half mirrored: symmetric by construction.
 */
export const BODY = {
  width: 120,
  height: 242,
  outline: smoothClosedPath([
    ...HALF_BODY.map(([dx, y]) => [60 + dx, y] as const),
    // [...].reverse(), not toReversed(): Hermes, the engine on iOS/Android, lacks it (like toSorted)
    ...[...HALF_BODY.slice(1, -1)].reverse().map(([dx, y]) => [60 - dx, y] as const),
  ]),
} as const;

type Side = 'left' | 'right';

/**
 * Where each site sits on the silhouette, and on which side of the screen its label goes. Front view: the person's
 * RIGHT arm is on the viewer's LEFT, so right-side sites have their label on the left (and their name says "R").
 */
export const SITE_ANCHORS: Record<MeasurementSite, { x: number; y: number; side: Side }> = {
  neck: { x: 60, y: 38, side: 'left' }, // its base
  chest: { x: 60, y: 72, side: 'right' }, // just under the armpits
  armR: { x: 32.5, y: 74, side: 'left' }, // biceps: halfway up the upper arm, at its widest
  armL: { x: 87.5, y: 74, side: 'right' },
  waist: { x: 60, y: 99, side: 'left' }, // the narrowest point
  hips: { x: 60, y: 117, side: 'right' }, // the widest point
  thighR: { x: 48.5, y: 138, side: 'left' }, // the widest point, just below the crotch (not near the knee)
  thighL: { x: 71.5, y: 138, side: 'right' },
  calfR: { x: 47.8, y: 190, side: 'left' }, // the widest point, just below the knee
  calfL: { x: 72.2, y: 190, side: 'right' },
};

/**
 * Moves labels apart so none overlaps the next: each keeps its wanted position when it can, otherwise it's pushed
 * down to `gap` below the previous one; if the last ones then overflow `bottom`, they're pushed back up. Same order out.
 */
export function spreadLabels(wanted: number[], gap: number, top: number, bottom: number): number[] {
  const order = wanted.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const ys = order.map((o) => o.y);
  for (let k = 0; k < ys.length; k++) ys[k] = Math.max(ys[k]!, k === 0 ? top : ys[k - 1]! + gap);
  for (let k = ys.length - 1; k >= 0; k--) {
    ys[k] = Math.min(ys[k]!, k === ys.length - 1 ? bottom : ys[k + 1]! - gap);
  }
  const out = new Array<number>(wanted.length);
  order.forEach((o, k) => (out[o.i] = ys[k]!));
  return out;
}

export const LABEL = { width: 84, height: 40, gap: 42 };
const MAX_SCALE = 1.5; // on a tablet, the body stops growing: the labels would drift far from it
const PADDING = 12;

export type BodyMapLayout = {
  width: number;
  height: number;
  /** Silhouette position and size on screen. */
  figure: { x: number; y: number; scale: number };
  sites: {
    site: MeasurementSite;
    side: Side;
    /** The dot, on the body. */
    dot: { x: number; y: number };
    /** The label's vertical centre; its box is LABEL.width wide, on the left or right edge. */
    labelY: number;
    /** Where the leader line from the dot meets the label. */
    lineEnd: { x: number; y: number };
  }[];
};

/** Everything BodyMap needs to draw, for a given screen width. Pure: no React, easy to test. */
export function bodyMapLayout(width: number): BodyMapLayout {
  const scale = Math.max(0.6, Math.min((width - 2 * LABEL.width) / BODY.width, MAX_SCALE));
  const figure = { x: (width - BODY.width * scale) / 2, y: PADDING, scale };
  const height = BODY.height * scale + 2 * PADDING;
  const toScreen = (p: { x: number; y: number }) => ({
    x: figure.x + p.x * scale,
    y: figure.y + p.y * scale,
  });

  const placed = new Map<MeasurementSite, number>();
  for (const side of ['left', 'right'] as const) {
    const sites = MEASUREMENT_SITES.filter((s) => SITE_ANCHORS[s].side === side);
    const ys = spreadLabels(
      sites.map((s) => toScreen(SITE_ANCHORS[s]).y),
      LABEL.gap,
      LABEL.height / 2,
      height - LABEL.height / 2,
    );
    sites.forEach((s, i) => placed.set(s, ys[i]!));
  }

  return {
    width,
    height,
    figure,
    sites: MEASUREMENT_SITES.map((site) => {
      const { side } = SITE_ANCHORS[site];
      const labelY = placed.get(site)!;
      return {
        site,
        side,
        dot: toScreen(SITE_ANCHORS[site]),
        labelY,
        lineEnd: { x: side === 'left' ? LABEL.width : width - LABEL.width, y: labelY },
      };
    }),
  };
}
