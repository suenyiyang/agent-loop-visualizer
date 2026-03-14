import type { MessageType } from '../types/context';
import { MESSAGE_TYPE_CONFIG } from '../constants/message-types';

export function getMessageColor(type: MessageType): string {
  return MESSAGE_TYPE_CONFIG[type].color;
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
