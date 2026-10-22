import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value = 0,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const safeTarget = typeof value === 'number' && !isNaN(value) ? value : 0;
  const [count, setCount] = useState<number>(safeTarget);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const targetValue = typeof value === 'number' && !isNaN(value) ? value : 0;

    if (targetValue === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (targetValue - startValue) * easeProgress;
      setCount(typeof current === 'number' && !isNaN(current) ? current : 0);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value, duration]);

  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;
  const formatted = decimals > 0 ? safeCount.toFixed(decimals) : Math.round(safeCount).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
