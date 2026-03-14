import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { computeLayout } from '../../utils/layout';
import { useSvgPanZoom } from '../../hooks/useSvgPanZoom';
import { Lifeline } from './Lifeline';
import { Arrow } from './Arrow';
import { GroupBox } from './GroupBox';

export function SvgCanvas() {
  const actors = useAppStore((s) => s.actors);
  const steps = useAppStore((s) => s.steps);
  const groups = useAppStore((s) => s.groups);
  const selectedStepId = useAppStore((s) => s.selectedStepId);
  const selectStep = useAppStore((s) => s.selectStep);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const setFocus = useAppStore((s) => s.setFocus);

  const layout = useMemo(
    () => computeLayout(actors, steps, groups),
    [actors, steps, groups],
  );

  const {
    viewBoxStr,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSvgPanZoom(layout.width, layout.height);

  const handleArrowClick = (stepId: string) => {
    selectStep(stepId === selectedStepId ? null : stepId);
    setFocus({ sequenceStepId: stepId });
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={viewBoxStr}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="select-none"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" style={{ fill: 'var(--text-tertiary)' }} />
        </marker>
      </defs>

      {/* Group boxes (behind everything) */}
      {layout.groupBoxes.map((gb) => (
        <GroupBox key={gb.group.id} layout={gb} />
      ))}

      {/* Lifelines */}
      {layout.lifelines.map((ll) => (
        <Lifeline key={ll.actor.id} layout={ll} />
      ))}

      {/* Arrows */}
      {layout.arrows.map((arrow) => (
        <Arrow
          key={arrow.step.id}
          layout={arrow}
          isHighlighted={
            arrow.step.id === selectedStepId ||
            arrow.step.id === focusTarget.sequenceStepId
          }
          onClick={() => handleArrowClick(arrow.step.id)}
        />
      ))}
    </svg>
  );
}
