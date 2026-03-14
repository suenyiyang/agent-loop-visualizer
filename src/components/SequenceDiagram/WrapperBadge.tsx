interface WrapperBadgeProps {
  label: string;
  x: number;
  y: number;
  color: string;
}

export function WrapperBadge({ label, x, y, color }: WrapperBadgeProps) {
  const textWidth = label.length * 5.5 + 12;
  const height = 16;
  const badgeY = y + 4;

  return (
    <g>
      <rect
        x={x - textWidth / 2}
        y={badgeY - height / 2}
        width={textWidth}
        height={height}
        rx={height / 2}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <text
        x={x}
        y={badgeY}
        textAnchor="middle"
        dominantBaseline="central"
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
