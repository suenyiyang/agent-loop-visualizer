interface WrapRhombusProps {
  x: number;
  y: number;
  label: string;
  color: string;
}

const SIZE = 12;
const HALF = SIZE / 2;

export function WrapRhombus({ x, y, label, color }: WrapRhombusProps) {
  const points = [
    `${x},${y - HALF}`,
    `${x + HALF},${y}`,
    `${x},${y + HALF}`,
    `${x - HALF},${y}`,
  ].join(' ');

  return (
    <g>
      <polygon
        points={points}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + HALF + 10}
        textAnchor="middle"
        fill={color}
        fontSize={8}
        fontWeight={600}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}
