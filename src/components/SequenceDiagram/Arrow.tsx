import type { ArrowLayout } from '../../utils/layout';
import { WrapRhombus } from './WrapRhombus';

interface ArrowProps {
  layout: ArrowLayout;
  isHighlighted: boolean;
  onClick: () => void;
}

export function Arrow({ layout, isHighlighted, onClick }: ArrowProps) {
  const { step, fromX, toX, y, isSelfMessage } = layout;
  const color = isHighlighted ? '#60a5fa' : 'var(--text-tertiary)';
  const strokeWidth = isHighlighted ? 2 : 1.5;

  if (step.type === 'interrupt') {
    return (
      <g onClick={onClick} className="cursor-pointer">
        {/* Interrupt marker - zigzag line */}
        <line
          x1={Math.min(fromX, toX)}
          y1={y}
          x2={Math.max(fromX, toX)}
          y2={y}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="8 4"
        />
        <text
          x={(fromX + toX) / 2}
          y={y - 10}
          textAnchor="middle"
          fill="#ef4444"
          fontSize={11}
          fontWeight={600}
        >
          {step.interruptType === 'approval' ? '⏸ APPROVAL' : '⏸ INPUT'}
        </text>
      </g>
    );
  }

  if (step.type === 'resume') {
    return (
      <g onClick={onClick} className="cursor-pointer">
        <line
          x1={Math.min(fromX, toX)}
          y1={y}
          x2={Math.max(fromX, toX)}
          y2={y}
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="8 4"
        />
        <text
          x={(fromX + toX) / 2}
          y={y - 10}
          textAnchor="middle"
          fill="#22c55e"
          fontSize={11}
          fontWeight={600}
        >
          ▶ RESUME
        </text>
      </g>
    );
  }

  if (isSelfMessage) {
    const loopWidth = 30;
    const loopHeight = 20;
    return (
      <g onClick={onClick} className="cursor-pointer">
        <path
          d={`M ${fromX} ${y} h ${loopWidth} v ${loopHeight} h ${-loopWidth}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={fromX + loopWidth + 5}
          y={y + loopHeight / 2}
          style={{ fill: color }}
          fontSize={10}
          dominantBaseline="middle"
        >
          {step.label}
        </text>
      </g>
    );
  }

  const hasWrap = step.wrapModelCall || step.wrapToolCall;
  const wrapLabel = step.wrapModelCall ? 'wrapModelCall' : 'wrapToolCall';
  const wrapColor = step.wrapModelCall ? '#a78bfa' : '#fbbf24';

  if (hasWrap) {
    const rhombusX = fromX + (toX - fromX) * 0.4;
    const labelX = (fromX + toX) / 2;
    const labelY = y - 8;
    const dashArray = step.isAsync ? '6 3' : undefined;

    return (
      <g onClick={onClick} className="cursor-pointer">
        {/* Label */}
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          style={{ fill: color }}
          fontSize={10}
          fontWeight={isHighlighted ? 600 : 400}
        >
          {step.label}
        </text>
        {/* Segment 1: from → rhombus */}
        <line
          x1={fromX}
          y1={y}
          x2={rhombusX - 7}
          y2={y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          markerEnd="url(#arrowhead)"
        />
        {/* Rhombus */}
        <WrapRhombus x={rhombusX} y={y} label={wrapLabel} color={wrapColor} />
        {/* Segment 2: rhombus → to */}
        <line
          x1={rhombusX + 7}
          y1={y}
          x2={toX}
          y2={y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          markerEnd="url(#arrowhead)"
        />
      </g>
    );
  }

  const midX = (fromX + toX) / 2;
  const labelY = y - 8;

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Arrow line */}
      <line
        x1={fromX}
        y1={y}
        x2={toX}
        y2={y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={step.isAsync ? '6 3' : undefined}
        markerEnd="url(#arrowhead)"
      />
      {/* Label */}
      <text
        x={midX}
        y={labelY}
        textAnchor="middle"
        style={{ fill: color }}
        fontSize={10}
        fontWeight={isHighlighted ? 600 : 400}
      >
        {step.label}
      </text>
    </g>
  );
}
