import { MEASUREMENT_SITES } from '@/shared/lib/measurementSites';
import {
  BODY,
  bodyMapLayout,
  LABEL,
  LABEL_ROWS,
  SITE_ANCHORS,
  smoothClosedPath,
  spreadLabels,
} from './bodyMap';

describe('spreadLabels', () => {
  it('keeps labels where they want to be when they don’t overlap', () => {
    expect(spreadLabels([10, 100, 200], 40, 0, 300)).toEqual([10, 100, 200]);
  });

  it('pushes a label down when it would overlap the one above', () => {
    expect(spreadLabels([100, 110, 300], 40, 0, 400)).toEqual([100, 140, 300]);
  });

  it('pushes the last ones back up when they would overflow the bottom', () => {
    expect(spreadLabels([280, 290, 295], 40, 0, 300)).toEqual([220, 260, 300]);
  });

  it('keeps each value at its index, whatever the input order', () => {
    expect(spreadLabels([300, 100], 40, 0, 400)).toEqual([300, 100]);
  });
});

/** The outline's on-curve points (each cubic's end point), read back from the SVG path (control points can be < 0). */
const outlinePoints = (d: string) =>
  [...d.matchAll(/C[-\d. ]+? (-?[\d.]+) (-?[\d.]+)(?= C| Z)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);

/** Ray casting: is the point inside the polygon? (The curve stays close to its points: good enough here.) */
function inside([x, y]: number[], polygon: number[][]) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi! > y! !== yj! > y! && x! < ((xj! - xi!) * (y! - yi!)) / (yj! - yi!) + xi!) hit = !hit;
  }
  return hit;
}

describe('smoothClosedPath', () => {
  it('draws a closed curve through every point, in order', () => {
    const square = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ] as const;
    const d = smoothClosedPath(square);
    expect(d.startsWith('M0 0 C')).toBe(true);
    expect(d.endsWith(' Z')).toBe(true);
    expect(outlinePoints(d)).toEqual([
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ]);
  });
});

describe('BODY', () => {
  const points = outlinePoints(BODY.outline);

  it('is symmetric: every point has its mirror on the other side', () => {
    const key = ([x, y]: number[]) => `${x!.toFixed(1)},${y!.toFixed(1)}`;
    const all = new Set(points.map(key));
    for (const [x, y] of points) expect(all.has(key([120 - x!, y!]))).toBe(true);
  });

  it('fits its 120 × 242 box, head to feet', () => {
    const ys = points.map(([, y]) => y!);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(BODY.height);
  });

  it('puts every measurement dot inside the body', () => {
    for (const site of MEASUREMENT_SITES) {
      const { x, y } = SITE_ANCHORS[site];
      expect([site, inside([x, y], points)]).toEqual([site, true]);
    }
  });
});

describe('SITE_ANCHORS', () => {
  it('places every site on the body', () => {
    for (const site of MEASUREMENT_SITES) {
      const { x, y } = SITE_ANCHORS[site];
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(BODY.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(BODY.height);
    }
  });

  it('front view: the person’s right side is on the viewer’s left, with its label on the left', () => {
    for (const [right, left] of [
      ['armR', 'armL'],
      ['thighR', 'thighL'],
      ['calfR', 'calfL'],
    ] as const) {
      expect(SITE_ANCHORS[right].x).toBeLessThan(BODY.width / 2);
      expect(SITE_ANCHORS[left].x).toBeGreaterThan(BODY.width / 2);
      expect(SITE_ANCHORS[right].side).toBe('left');
      expect(SITE_ANCHORS[left].side).toBe('right');
    }
  });
});

describe('bodyMapLayout', () => {
  it.each([320 - 32, 390 - 32, 1024 - 32])(
    'at %ipx: labels never overlap and stay inside the map',
    (width) => {
      const layout = bodyMapLayout(width);
      for (const side of ['left', 'right'] as const) {
        const ys = layout.sites
          .filter((s) => s.side === side)
          .map((s) => s.labelY)
          .sort((a, b) => a - b);
        ys.slice(1).forEach((y, i) => expect(y - ys[i]!).toBeGreaterThanOrEqual(LABEL.gap));
        expect(ys[0]).toBeGreaterThanOrEqual(LABEL.height / 2);
        expect(ys.at(-1)).toBeLessThanOrEqual(layout.height - LABEL.height / 2);
      }
    },
  );

  it('puts each pair on one row: neck and chest, both arms, waist and hips, both thighs, both calves', () => {
    const layout = bodyMapLayout(358);
    const y = (site: string) => layout.sites.find((s) => s.site === site)!.labelY;
    for (const [left, right] of LABEL_ROWS) expect(y(left)).toBe(y(right));
    // rows in body order, top to bottom
    const rowYs = LABEL_ROWS.map(([left]) => y(left));
    expect(rowYs).toEqual([...rowYs].sort((a, b) => a - b));
  });

  it('has every site in exactly one row, the left one on the left', () => {
    expect(LABEL_ROWS.flat().sort()).toEqual([...MEASUREMENT_SITES].sort());
    for (const [left, right] of LABEL_ROWS) {
      expect(SITE_ANCHORS[left].side).toBe('left');
      expect(SITE_ANCHORS[right].side).toBe('right');
    }
  });

  it('keeps each dot where it is on the body: only the label moves', () => {
    const layout = bodyMapLayout(358);
    const { x, y, scale } = layout.figure;
    for (const s of layout.sites) {
      expect(s.dot).toEqual({
        x: x + SITE_ANCHORS[s.site].x * scale,
        y: y + SITE_ANCHORS[s.site].y * scale,
      });
    }
  });

  it('fits the body between the two label columns on a small phone', () => {
    const { figure } = bodyMapLayout(320 - 32); // 320 px screen minus the 16 px gutters
    expect(figure.x).toBeGreaterThanOrEqual(LABEL.width);
    expect(figure.x + BODY.width * figure.scale).toBeLessThanOrEqual(320 - 32 - LABEL.width);
  });

  it('stops growing on a tablet, so labels stay near the body', () => {
    expect(bodyMapLayout(1024).figure.scale).toBe(1.5);
  });

  it('draws each leader line from the dot to the inner edge of its label', () => {
    const layout = bodyMapLayout(358);
    const waist = layout.sites.find((s) => s.site === 'waist')!;
    const hips = layout.sites.find((s) => s.site === 'hips')!;
    expect(waist.lineEnd).toEqual({ x: LABEL.width, y: waist.labelY });
    expect(hips.lineEnd).toEqual({ x: 358 - LABEL.width, y: hips.labelY });
    expect(layout.sites.map((s) => s.site)).toEqual([...MEASUREMENT_SITES]);
  });
});
