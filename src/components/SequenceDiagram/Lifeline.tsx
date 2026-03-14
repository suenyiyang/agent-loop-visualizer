import type { LifelineLayout } from '../../utils/layout';

interface LifelineProps {
  layout: LifelineLayout;
}

export function Lifeline({ layout }: LifelineProps) {
  const { actor, x, topY, bottomY } = layout;

  return (
    <g>
      {/* Header box */}
      <rect
        x={x - 50}
        y={topY - 40}
        width={100}
        height={32}
        rx={6}
        fill={actor.color}
        fillOpacity={0.15}
        stroke={actor.color}
        strokeOpacity={0.4}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={topY - 20}
        textAnchor="middle"
        fill={actor.color}
        fontSize={12}
        fontWeight={600}
      >
        {actor.label}
      </text>
      {/* Dashed lifeline */}
      <line
        x1={x}
        y1={topY}
        x2={x}
        y2={bottomY}
        stroke={actor.color}
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeDasharray="6 4"
      />
    </g>
  );
}
