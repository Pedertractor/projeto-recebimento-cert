import type { ReactNode } from 'react';
import { MotionIconConfig, PARENT_HOVER_ATTR } from 'lucide-react-motion';

/** Required on hover targets when using `trigger="parent-hover"`. */
export const motionIconGroupProps = {
  [PARENT_HOVER_ATTR]: '',
} as const;

type MotionIconProviderProps = {
  children: ReactNode;
};

export function MotionIconProvider({ children }: MotionIconProviderProps) {
  return (
    <MotionIconConfig
      trigger="parent-hover"
      mode="signature"
      duration={0.45}
      stagger={0.1}
      onLeave="snap"
    >
      {children}
    </MotionIconConfig>
  );
}
