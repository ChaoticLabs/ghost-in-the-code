/**
 * ProgressBar - Reusable progress bar component
 * DRY implementation for consistent progress visualization
 */

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showLabel?: boolean;
  color?: string;
  height?: 'small' | 'medium' | 'large';
  className?: string;
  ariaLabel?: string;
}

export const ProgressBar = ({
  percentage,
  label,
  showLabel = false,
  color,
  height = 'medium',
  className = '',
  ariaLabel
}: ProgressBarProps) => {
  const heightClass = `progress-bar--${height}`;
  
  return (
    <div 
      className={`progress-bar-container ${heightClass} ${className}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `${percentage}% complete`}
    >
      {percentage > 0 && (
        <div 
          className="progress-bar-fill"
          style={{ 
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            ...(color && { backgroundColor: color })
          }}
        >
          {showLabel && label && (
            <span className="progress-bar-label">{label}</span>
          )}
        </div>
      )}
    </div>
  );
};
