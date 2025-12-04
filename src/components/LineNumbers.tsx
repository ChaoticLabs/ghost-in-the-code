import './LineNumbers.css';

interface LineNumbersProps {
  lineCount: number;
  currentLine?: number;
  theme?: 'dark' | 'high-contrast';
}

export const LineNumbers = ({ lineCount, currentLine, theme = 'dark' }: LineNumbersProps) => {
  const lines = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  return (
    <div 
      className={`line-numbers ${theme === 'high-contrast' ? 'line-numbers-high-contrast' : ''}`}
      aria-hidden="true"
    >
      {lines.map((lineNumber) => (
        <div
          key={lineNumber}
          className={`line-number ${currentLine === lineNumber ? 'line-number-active' : ''}`}
        >
          {lineNumber}
        </div>
      ))}
    </div>
  );
};
