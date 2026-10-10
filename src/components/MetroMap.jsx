import { useState } from 'react';
import { LINES, XY, LBL, ALL } from '../data/metro.js';
import { linesAt } from '../lib/route.js';

export default function MetroMap({ legs, originOpt, destOpt, fromName, toName, onSelectStation }) {
  const [zoom, setZoom] = useState(1);

  const handleZoom = delta => {
    if (delta === 0) setZoom(1);
    else setZoom(prev => Math.max(1, Math.min(2.5, +(prev + delta * 0.4).toFixed(1))));
  };

  const activeStations = new Set();
  if (legs) {
    legs.forEach(l => l.stations.forEach(n => activeStations.add(n)));
  }

  // Calculate feeder spur coordinates if origin or dest uses feeder bus
  const feederSpurs = [];

  if (originOpt && originOpt.mode !== 'WALK' && originOpt.st && XY[originOpt.st]) {
    const [stX, stY] = XY[originOpt.st];
    // Offset for feeder spur
    const spurX = Math.max(50, Math.min(1150, stX + (stX > 600 ? 90 : -90)));
    const spurY = Math.max(50, Math.min(730, stY + (stY > 400 ? 50 : -50)));
    const color = originOpt.mode === 'BRTS' ? 'var(--orange)' : 'var(--teal)';
    feederSpurs.push({
      key: 'orig-spur',
      fromX: stX,
      fromY: stY,
      toX: spurX,
      toY: spurY,
      color,
      label: `${fromName} (${originOpt.mode})`,
      mode: originOpt.mode
    });
  }

  if (destOpt && destOpt.mode !== 'WALK' && destOpt.st && XY[destOpt.st]) {
    const [stX, stY] = XY[destOpt.st];
    const spurX = Math.max(50, Math.min(1150, stX + (stX > 600 ? 90 : -90)));
    const spurY = Math.max(50, Math.min(730, stY + (stY > 400 ? -60 : 60)));
    const color = destOpt.mode === 'BRTS' ? 'var(--orange)' : 'var(--teal)';
    feederSpurs.push({
      key: 'dest-spur',
      fromX: stX,
      fromY: spurY,
      toX: spurX,
      toY: spurY,
      color,
      label: `${toName} (${destOpt.mode})`,
      mode: destOpt.mode
    });
  }

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="row between" style={{ marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Network Map & Multimodal Feeder Spurs</h2>
        <div className="zoom">
          <button type="button" className="ghost" onClick={() => handleZoom(-1)} aria-label="Zoom out">
            -
          </button>
          <button type="button" className="ghost" onClick={() => handleZoom(0)} aria-label="Reset zoom">
            Reset
          </button>
          <button type="button" className="ghost" onClick={() => handleZoom(1)} aria-label="Zoom in">
            +
          </button>
        </div>
      </div>
      <p className="mut" style={{ fontSize: '13px', margin: '0 0 12px' }}>
        Interactive map with highlighted metro corridor and feeder bus spurs (orange: BRTS, teal: AMTS). Drag or scroll sideways on small screens.
      </p>

      <div
        className="mapwrap"
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
      >
        <svg
          id="map"
          viewBox="0 0 1200 780"
          role="img"
          aria-label="Ahmedabad and Gandhinagar multimodal transit map"
          style={{
            width: `${zoom * 100}%`,
            minWidth: `${860 * zoom}px`,
            display: 'block',
            transition: 'width 0.2s ease, min-width 0.2s ease'
          }}
        >
          {/* Base metro lines */}
          {Object.entries(LINES).map(([k, line]) => (
            <polyline
              key={k}
              points={line.st.map(n => XY[n].join(',')).join(' ')}
              fill="none"
              stroke={line.color}
              strokeWidth={legs ? 5 : 8}
              opacity={legs ? 0.28 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Active highlighted metro legs */}
          {legs &&
            legs.map((leg, i) => {
              const pts = leg.stations.map(n => XY[n].join(',')).join(' ');
              return (
                <g key={`leg-${i}`}>
                  <polyline
                    points={pts}
                    fill="none"
                    stroke={LINES[leg.line].color}
                    strokeWidth={11}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    className="flow"
                    points={pts}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={3}
                    strokeDasharray="2 14"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

          {/* Feeder spurs */}
          {feederSpurs.map(spur => (
            <g key={spur.key}>
              <line
                x1={spur.fromX}
                y1={spur.fromY}
                x2={spur.toX}
                y2={spur.toY}
                stroke={spur.color}
                strokeWidth={5}
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              <circle cx={spur.toX} cy={spur.toY} r={8} fill={spur.color} stroke="#ffffff" strokeWidth={2} />
              <rect
                x={spur.toX - 60}
                y={spur.toY - 26}
                width={120}
                height={20}
                rx={6}
                fill="var(--bg2)"
                stroke={spur.color}
                strokeWidth={1.5}
              />
              <text
                x={spur.toX}
                y={spur.toY - 12}
                fill="var(--tx)"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {spur.label}
              </text>
            </g>
          ))}

          {/* Stations & Labels */}
          {ALL.map(name => {
            const [x, y] = XY[name];
            const isInterchange = linesAt(name).length > 1;
            const isHot = activeStations.has(name);
            const L = LBL[name] || [14, 4, 'start'];

            let labelEl = null;
            if (L === 'rotE') {
              labelEl = (
                <text className="lbl" transform={`translate(${x + 3} ${y - 14}) rotate(-40)`}>
                  {name}
                </text>
              );
            } else if (L === 'rotW') {
              labelEl = (
                <text className="lbl" textAnchor="end" transform={`translate(${x - 3} ${y + 16}) rotate(-40)`}>
                  {name}
                </text>
              );
            } else {
              labelEl = (
                <text className="lbl" x={x + L[0]} y={y + L[1]} textAnchor={L[2]}>
                  {name}
                </text>
              );
            }

            return (
              <g key={name} data-st={name} onClick={() => onSelectStation && onSelectStation(name)}>
                <circle
                  cx={x}
                  cy={y}
                  r={isInterchange ? 11 : 7}
                  fill={isInterchange ? 'var(--tx)' : 'var(--st)'}
                  stroke={isInterchange ? 'var(--st)' : 'var(--tx)'}
                  strokeWidth={isHot ? 5 : 3}
                >
                  <title>{name}</title>
                </circle>
                {labelEl}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="legend">
        {Object.values(LINES).map(l => (
          <span key={l.name}>
            <i style={{ background: l.color }}></i>
            {l.name}
          </span>
        ))}
        <span>
          <i style={{ background: 'var(--orange)' }}></i>BRTS Feeder Spur
        </span>
        <span>
          <i style={{ background: 'var(--teal)' }}></i>AMTS Feeder Spur
        </span>
        <span>Large dot = interchange</span>
      </div>
    </div>
  );
}
