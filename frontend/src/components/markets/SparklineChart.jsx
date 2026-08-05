import React from "react";

/**
 * Lightweight SVG Sparkline Chart for rendering 7-day price trends in table rows
 * @param {Array<number>} data - Array of numeric price values
 * @param {boolean} isPositive - Whether 24h change is positive (green) or negative (red)
 * @param {number} width - SVG canvas width
 * @param {number} height - SVG canvas height
 */
export function SparklineChart({ data = [], isPositive = true, width = 120, height = 36 }) {
  let pointsArray = data;
  if (!pointsArray || pointsArray.length < 2) {
    // Fallback smooth curve if real sparkline data is not available
    pointsArray = isPositive ? [10, 12, 11, 15, 14, 18, 20] : [20, 18, 19, 14, 15, 11, 10];
  }

  const min = Math.min(...pointsArray);
  const max = Math.max(...pointsArray);
  const range = max - min === 0 ? 1 : max - min;

  const points = pointsArray
    .map((val, idx) => {
      const x = (idx / (pointsArray.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = isPositive ? "#33c758" : "#ff3e00";
  const strokeWidth = 2;

  const firstX = 0;
  const lastX = width;
  const bottomY = height;
  const areaPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

  const gradientId = `sparkline-grad-${isPositive ? "up" : "down"}-${Math.floor(Math.random() * 10000)}`;

  return (
    <div className="inline-flex items-center justify-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Gradient fill underneath the sparkline */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        {/* Smooth trend stroke */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

export default SparklineChart;
