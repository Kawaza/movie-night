import { useState, useRef, useCallback } from 'react';
import PickModal from './PickModal';

const WHEEL_COLORS = [
  '#0891b2', '#06b6d4', '#0ea5e9', '#0284c7',
  '#6366f1', '#7c3aed', '#14b8a6', '#22d3ee',
  '#0369a1', '#4f46e5',
];

function truncate(str, max = 14) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArc, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function getLabelPos(cx, cy, r, startAngle, endAngle) {
  const mid = (startAngle + endAngle) / 2;
  const rad = ((mid - 90) * Math.PI) / 180;
  let rotate = mid + 90;
  if (rotate > 90 && rotate < 270) rotate += 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
    rotate,
  };
}

export default function Wheel({ movies, onMarkWatched }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const rotationRef = useRef(0);

  const spin = useCallback(() => {
    if (spinning || movies.length < 2) return;

    const n = movies.length;
    const segmentAngle = 360 / n;
    const winnerIndex = Math.floor(Math.random() * n);
    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const target =
      rotationRef.current +
      extraSpins * 360 +
      (360 - segmentCenter - (rotationRef.current % 360) + 360) % 360;

    setSpinning(true);
    setWinner(null);
    setRotation(target);
    rotationRef.current = target;

    setTimeout(() => {
      setSpinning(false);
      setWinner(movies[winnerIndex]);
    }, 4500);
  }, [movies, spinning]);

  function handleMarkWatched() {
    if (winner) onMarkWatched(winner.id);
    setWinner(null);
  }

  function handleKeep() {
    setWinner(null);
  }

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const segmentAngle = movies.length > 0 ? 360 / movies.length : 0;
  const fontSize = movies.length > 12 ? 7 : movies.length > 8 ? 8 : movies.length > 5 ? 9 : 10;

  return (
    <>
      <div className="wheel-container">
        {movies.length > 0 ? (
          <>
            <div className="wheel-pointer" aria-hidden="true">
              <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
                <path d="M8 12L0 0h16L8 12z" />
              </svg>
            </div>
            <div
              className="wheel-spinner"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="wheel-svg"
                role="img"
                aria-label="Movie selection wheel"
              >
                {movies.map((movie, i) => {
                  const start = i * segmentAngle;
                  const end = (i + 1) * segmentAngle;
                  const label = getLabelPos(cx, cy, r * 0.68, start, end);
                  const fill = WHEEL_COLORS[i % WHEEL_COLORS.length];
                  return (
                    <g key={movie.id}>
                      <path
                        d={describeArc(cx, cy, r, start, end)}
                        fill={fill}
                        stroke="#0d1117"
                        strokeWidth="2"
                      />
                      <text
                        x={label.x}
                        y={label.y}
                        fill="#fff"
                        fontSize={fontSize}
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${label.rotate}, ${label.x}, ${label.y})`}
                      >
                        {truncate(movie.title)}
                      </text>
                    </g>
                  );
                })}
                <circle cx={cx} cy={cy} r={28} fill="#0d1117" stroke="#22d3ee" strokeWidth="2" />
              </svg>
            </div>
          </>
        ) : (
          <div className="wheel-placeholder">
            <p>No movies on the wheel yet.</p>
          </div>
        )}

        <button
          className="btn btn-primary btn-spin"
          onClick={spin}
          disabled={spinning || movies.length < 2}
        >
          {spinning ? 'Spinning…' : movies.length < 2 ? 'Need 2+ movies' : 'Spin'}
        </button>
      </div>

      {winner && !spinning && (
        <PickModal
          movie={winner}
          onClose={handleKeep}
          onKeep={handleKeep}
          onMarkWatched={handleMarkWatched}
        />
      )}
    </>
  );
}
