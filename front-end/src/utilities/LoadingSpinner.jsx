import React from 'react';

const DietPlannerLoading = () => {
  const icons = [
    '🥗',
    '🥑',
    '🍎',
    '💪',
    '📊',
    '⚖️',
    '🥤',
    '🍇'
  ];

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <svg 
        width="400" 
        height="400" 
        viewBox="0 0 400 400"
        className="relative"
      >
        {/* Center Spinner Circle */}
        <circle 
          cx="200" 
          cy="200" 
          r="60" 
          fill="none" 
          stroke="#ff8c00" 
          strokeWidth="6"
          strokeDasharray="40 100"
          strokeLinecap="round"
          style={{
            animation: 'spin 2s linear infinite'
          }}
        />

        {/* Icons positioned around the spinner */}
        {icons.map((icon, idx) => {
          const angle = (idx / icons.length) * 360;
          const radius = 140;
          const x = 200 + radius * Math.cos((angle - 90) * Math.PI / 180);
          const y = 200 + radius * Math.sin((angle - 90) * Math.PI / 180);
          
          return (
            <g key={idx} style={{ animation: `orbit 8s linear infinite` }}>
              <text 
                x={x} 
                y={y} 
                fontSize="40" 
                textAnchor="middle" 
                dominantBaseline="central"
              >
                {icon}
              </text>
            </g>
          );
        })}

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
              transform-origin: 200px 200px;
            }
            to {
              transform: rotate(360deg);
              transform-origin: 200px 200px;
            }
          }

          @keyframes orbit {
            from {
              transform: rotate(0deg);
              transform-origin: 200px 200px;
            }
            to {
              transform: rotate(-360deg);
              transform-origin: 200px 200px;
            }
          }
        `}</style>
      </svg>
    </div>
  );
};

export default DietPlannerLoading;