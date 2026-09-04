/**
 * A 12-point trend line for the metric cards. Hand-drawn SVG rather than a
 * chart library: four of these render on every Overview load, and none of them
 * need axes, tooltips or a responsive container.
 *
 * The history sits in a de-emphasised ink and only the latest segment and end
 * marker take the accent, so the eye lands on "now" first.
 */
export function Sparkline({
  values,
  className,
}: {
  values: readonly number[];
  className?: string;
}) {
  if (values.length < 2) return <div className={className} />;

  const width = 100;
  const height = 28;
  const padding = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y =
      height - padding - ((value - min) / span) * (height - padding * 2);
    return [x, y] as const;
  });

  const toPath = (slice: readonly (readonly [number, number])[]) =>
    slice.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

  const last = points[points.length - 1];

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden
    >
      <polyline
        points={toPath(points)}
        fill="none"
        stroke="var(--fg-subtle)"
        strokeOpacity={0.55}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={toPath(points.slice(-2))}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Zero-length round-capped strokes stay circular even though the
          viewBox is stretched horizontally — a <circle> would render as an
          ellipse. The wider surface-coloured dot underneath is the 2px ring. */}
      <line
        x1={last[0]}
        y1={last[1]}
        x2={last[0]}
        y2={last[1]}
        stroke="var(--surface)"
        strokeWidth={9}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={last[0]}
        y1={last[1]}
        x2={last[0]}
        y2={last[1]}
        stroke="var(--accent)"
        strokeWidth={5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
