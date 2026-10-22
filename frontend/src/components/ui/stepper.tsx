import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-0.5 bg-muted z-0">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{
              width: `${(currentStep / Math.max(1, steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step dots */}
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = !!onStepClick && idx <= currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(idx)}
                className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30'
                    : isCurrent
                    ? 'bg-background border-primary text-primary ring-4 ring-primary/20 scale-110'
                    : 'bg-card border-border text-muted-foreground'
                } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
              </button>
              <div className="absolute top-11 text-center whitespace-nowrap">
                <span
                  className={`text-xs font-medium block ${
                    isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[10px] text-muted-foreground/80 block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer for bottom labels */}
      <div className="h-8" />
    </div>
  );
};

export default Stepper;
