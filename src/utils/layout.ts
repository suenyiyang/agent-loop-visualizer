import type { Actor, SequenceStep, ActorGroup } from '../types/sequence';
import {
  ACTOR_LANE_WIDTH,
  ACTOR_HEADER_HEIGHT,
  STEP_HEIGHT,
  STEP_VERTICAL_GAP,
  DIAGRAM_PADDING,
  GROUP_PADDING,
} from '../constants/defaults';

export interface LifelineLayout {
  actor: Actor;
  x: number;
  topY: number;
  bottomY: number;
}

export interface ArrowLayout {
  step: SequenceStep;
  fromX: number;
  toX: number;
  y: number;
  isSelfMessage: boolean;
}

export interface GroupBoxLayout {
  group: ActorGroup;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramLayout {
  lifelines: LifelineLayout[];
  arrows: ArrowLayout[];
  groupBoxes: GroupBoxLayout[];
  width: number;
  height: number;
}

export function computeLayout(
  actors: Actor[],
  steps: SequenceStep[],
  groups: ActorGroup[],
): DiagramLayout {
  const actorXMap = new Map<string, number>();
  actors.forEach((actor, i) => {
    actorXMap.set(actor.id, DIAGRAM_PADDING + i * ACTOR_LANE_WIDTH + ACTOR_LANE_WIDTH / 2);
  });

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const totalSteps = sortedSteps.length;
  const diagramContentHeight =
    totalSteps * STEP_HEIGHT + Math.max(0, totalSteps - 1) * STEP_VERTICAL_GAP;
  const bottomY = DIAGRAM_PADDING + ACTOR_HEADER_HEIGHT + diagramContentHeight + DIAGRAM_PADDING;

  const lifelines: LifelineLayout[] = actors.map((actor) => ({
    actor,
    x: actorXMap.get(actor.id)!,
    topY: DIAGRAM_PADDING + ACTOR_HEADER_HEIGHT,
    bottomY,
  }));

  const arrows: ArrowLayout[] = sortedSteps.map((step, i) => {
    const y = DIAGRAM_PADDING + ACTOR_HEADER_HEIGHT + i * (STEP_HEIGHT + STEP_VERTICAL_GAP) + STEP_HEIGHT / 2;
    const fromX = actorXMap.get(step.from) ?? DIAGRAM_PADDING;
    const toX = actorXMap.get(step.to) ?? DIAGRAM_PADDING;
    return {
      step,
      fromX,
      toX,
      y,
      isSelfMessage: step.type === 'self_message' || step.from === step.to,
    };
  });

  const groupBoxes: GroupBoxLayout[] = groups.map((group) => {
    const memberXs = group.actorIds
      .map((id) => actorXMap.get(id))
      .filter((x): x is number => x != null);
    if (memberXs.length === 0) {
      return { group, x: 0, y: 0, width: 0, height: 0 };
    }
    const minX = Math.min(...memberXs) - ACTOR_LANE_WIDTH / 2 - GROUP_PADDING;
    const maxX = Math.max(...memberXs) + ACTOR_LANE_WIDTH / 2 + GROUP_PADDING;
    return {
      group,
      x: minX,
      y: DIAGRAM_PADDING - 10,
      width: maxX - minX,
      height: bottomY - DIAGRAM_PADDING + 20,
    };
  });

  const width = DIAGRAM_PADDING * 2 + actors.length * ACTOR_LANE_WIDTH;
  const height = bottomY + DIAGRAM_PADDING;

  return { lifelines, arrows, groupBoxes, width, height };
}
