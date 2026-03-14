import type { GroupBoxLayout } from '../../utils/layout';

interface GroupBoxProps {
  layout: GroupBoxLayout;
}

export function GroupBox({ layout }: GroupBoxProps) {
  const { group, x, y, width, height } = layout;
  if (width === 0 || height === 0) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={group.color}
        fillOpacity={0.05}
        stroke={group.color}
        strokeOpacity={0.3}
        strokeWidth={1.5}
        strokeDasharray="8 4"
      />
      {/* Label tab */}
      <rect
        x={x}
        y={y}
        width={group.label.length * 8 + 20}
        height={20}
        rx={4}
        fill={group.color}
        fillOpacity={0.15}
      />
      <text
        x={x + 10}
        y={y + 14}
        fill={group.color}
        fontSize={11}
        fontWeight={600}
      >
        {group.label}
      </text>
    </g>
  );
}
