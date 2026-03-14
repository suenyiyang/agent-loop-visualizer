import { hexToRgba } from '../../utils/colors';

interface BadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, size = 'sm' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full font-mono font-semibold"
      style={{
        backgroundColor: hexToRgba(color, 0.15),
        color,
        border: `1px solid ${hexToRgba(color, 0.3)}`,
        fontSize: size === 'sm' ? '10px' : '12px',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
      }}
    >
      {label}
    </span>
  );
}
