export default function PieChart({ correct, total, size = 120 }: { correct: number, total: number, size?: number }) {
  if (total === 0) return null;
  
  const percentage = Math.round((correct / total) * 100);
  const radius = size / 2;
  const strokeWidth = size / 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (correct / total) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle (incorrect) */}
        <circle
          stroke="var(--card-border)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Foreground circle (correct) */}
        <circle
          stroke="var(--success)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: `${size / 5}px`, color: 'var(--text-primary)'
      }}>
        {percentage}%
      </div>
    </div>
  );
}
