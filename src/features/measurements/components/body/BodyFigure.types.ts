import type { BodyMapLayout } from '../../domain/bodyMap';

export type BodyFigureProps = {
  layout: BodyMapLayout;
  /** Sites with at least one measurement: a filled dot. The others get an empty one. */
  measured: ReadonlySet<string>;
};
