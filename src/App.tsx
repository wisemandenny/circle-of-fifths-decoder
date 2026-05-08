import { useCallback, useRef, useState } from 'react';
import {
  KEYS,
  DIATONIC_CHORDS,
  DECODER_ANGLES,
  DECODER_CHORD_INDEX,
  DECODER_ROMAN_NUMERALS,
  DECODER_WINDOW_RADII,
  DECODER_CUTOUT_RADII,
} from './musicTheory';
import type { ChordQuality } from './musicTheory';
import MusicStaff from './MusicStaff';
import './App.css';

const SEGMENT_ANGLE = 360 / 12;
const WHEEL_SIZE = 400;
const BASE_SIZE = 340;
const SCALE = WHEEL_SIZE / BASE_SIZE;
const INNER_RADIUS = 100 * SCALE;
const OUTER_RADIUS = 160 * SCALE;
/* Slight overlap so segment edges don't show as lines when rotating */
const SEGMENT_OVERLAP_DEG = 0.5;

// SVG viewBox is (-170,-170) to (170,170), so center is (0,0)
const CX = 0;
const CY = 0;

// Uniform badge size for interval badges only (in viewBox units); m badge uses cutout-based sizing
const BADGE_R = 10;
const BADGE_FONT_SIZE = 14;

function getKeyIndexFromRotation(rotationDeg: number): number {
  const normalized = ((rotationDeg % 360) + 360) % 360;
  const index = Math.round(normalized / SEGMENT_ANGLE) % 12;
  return index;
}

function getRotationFromKeyIndex(keyIndex: number): number {
  return keyIndex * SEGMENT_ANGLE;
}

// Offset from root on circle of fifths: 0=I, 1=V, 2=ii, 3=vi, 4=iii, 5=vii°, 11=IV. Others non-diatonic.
function getSegmentQuality(segmentIndex: number, keyIndex: number): 'major' | 'minor' | 'dim' | null {
  const offset = (segmentIndex - keyIndex + 12) % 12;
  if (offset === 0 || offset === 1 || offset === 11) return 'major';
  if (offset === 2 || offset === 3 || offset === 4) return 'minor';
  if (offset === 5) return 'dim';
  return null;
}

// Format chord for cutout: root letter only — major = capital (C, F♯), minor/dim = lowercase (a, b), no "m", "dim", or "°"
function formatChordForCutout(chord: { label: string; quality: ChordQuality }): string {
  if (chord.quality === 'major') return chord.label;
  const root = chord.label.replace(/m$/i, '').replace(/dim$/gi, '').replace(/°$/, '').replace(/\s+/g, '').trim();
  return root.charAt(0).toUpperCase() + root.slice(1);
}

// Key display names: sharps vs flats (indices 6–10 are enharmonic; 0–5 and 11 unchanged)
const KEY_DISPLAY_SHARPS: readonly string[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'F'];
const KEY_DISPLAY_FLATS: readonly string[] = ['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];

const SHARP_TO_FLAT: Record<string, string> = { 'F♯': 'G♭', 'C♯': 'D♭', 'G♯': 'A♭', 'D♯': 'E♭', 'A♯': 'B♭', 'E♯': 'F', 'B♯': 'C' };
const FLAT_TO_SHARP: Record<string, string> = { 'G♭': 'F♯', 'D♭': 'C♯', 'A♭': 'G♯', 'E♭': 'D♯', 'B♭': 'A♯' };

function spellChordLabel(label: string, preferFlats: boolean): string {
  const rootMatch = label.match(/^([A-G][♯♭]?)/);
  if (!rootMatch) return label;
  const root = rootMatch[1];
  const suffix = label.slice(root.length);
  const mappedRoot = preferFlats ? (SHARP_TO_FLAT[root] ?? root) : (FLAT_TO_SHARP[root] ?? root);
  return mappedRoot + suffix;
}

export default function App() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [seventhChordMode, setSeventhChordMode] = useState(false);
  const [preferFlats, setPreferFlats] = useState(true);
  const dragStart = useRef({ x: 0, rotation: 0 });

  const keyIndex = getKeyIndexFromRotation(rotation);
  const diatonic = DIATONIC_CHORDS[keyIndex];
  const keyDisplayNames = preferFlats ? KEY_DISPLAY_FLATS : KEY_DISPLAY_SHARPS;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStart.current = { x: e.clientX, rotation };
    },
    [rotation]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStart.current.x;
      setRotation(dragStart.current.rotation + delta);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      const keyIndex = getKeyIndexFromRotation(rotation);
      setRotation(getRotationFromKeyIndex(keyIndex));
    }
    setIsDragging(false);
  }, [isDragging, rotation]);

  const handleKeyClick = (index: number) => {
    setRotation(getRotationFromKeyIndex(index));
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar" aria-label="Settings">
        <div className="settings-group">
          <span className="settings-group-label">Number of notes</span>
          <div className={`seventh-toggle ${seventhChordMode ? 'on' : ''}`}>
            <span className="seventh-toggle-option notes-3" aria-hidden>3</span>
            <button
              type="button"
              role="switch"
              aria-checked={seventhChordMode}
              aria-label="Number of notes: 3 or 4"
              className={`seventh-toggle-switch ${seventhChordMode ? 'on' : ''}`}
              onClick={() => setSeventhChordMode((v) => !v)}
            >
              <span className="seventh-toggle-knob" />
            </button>
            <span className="seventh-toggle-option notes-4" aria-hidden>4</span>
          </div>
        </div>
        <div className="settings-group">
          <span className="settings-group-label">Key notation</span>
          <div className={`key-notation-toggle ${preferFlats ? 'flats' : 'sharps'}`}>
            <span className="key-notation-toggle-symbol key-notation-flat" aria-hidden>♭</span>
            <button
              type="button"
              role="switch"
              aria-checked={!preferFlats}
              aria-label="Key notation: flats or sharps"
              className={`key-notation-toggle-switch ${preferFlats ? 'flats' : 'sharps'}`}
              onClick={() => setPreferFlats((v) => !v)}
            >
              <span className="key-notation-toggle-knob" />
            </button>
            <span className="key-notation-toggle-symbol key-notation-sharp" aria-hidden>♯</span>
          </div>
        </div>
        <section className="sidebar-planned" aria-label="Planned features">
          <h3 className="sidebar-planned-heading">Planned features</h3>
          <ul className="sidebar-planned-list">
            <li>Major/minor key toggle</li>
            <li>Chord dictionary for each of the displayed chords</li>
            <li>Borrowed chord support</li>
            <li>Chord progression generator</li>
          </ul>
        </section>
      </aside>
      <main className="app-main">
    <div className="app">
      <div className={`key-buttons ${preferFlats ? 'key-buttons-flats' : ''}`}>
        {KEYS.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`key-btn ${index === keyIndex ? 'active' : ''}`}
            onClick={() => handleKeyClick(index)}
          >
            {keyDisplayNames[index]}
          </button>
        ))}
      </div>

      <div className="decoder-container">
        {/* Rotatable wheel */}
        <div
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <svg
            viewBox={`${-WHEEL_SIZE / 2} ${-WHEEL_SIZE / 2} ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            className="wheel-svg"
          >
            <defs>
              <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2d2a26" />
                <stop offset="100%" stopColor="#1a1816" />
              </linearGradient>
            </defs>
            {/* Inner disc (decoder area) — wheel is a ring from INNER_RADIUS to OUTER_RADIUS; no stroke */}
            <circle cx={CX} cy={CY} r={INNER_RADIUS} fill="#252220" stroke="none" />
            {KEYS.map((keyName, i) => {
              const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * SEGMENT_ANGLE - 90 + SEGMENT_OVERLAP_DEG) * (Math.PI / 180);
              const x1 = CX + OUTER_RADIUS * Math.cos(startAngle);
              const y1 = CY + OUTER_RADIUS * Math.sin(startAngle);
              const x2 = CX + OUTER_RADIUS * Math.cos(endAngle);
              const y2 = CY + OUTER_RADIUS * Math.sin(endAngle);
              const x3 = CX + INNER_RADIUS * Math.cos(endAngle);
              const y3 = CY + INNER_RADIUS * Math.sin(endAngle);
              const x4 = CX + INNER_RADIUS * Math.cos(startAngle);
              const y4 = CY + INNER_RADIUS * Math.sin(startAngle);
              const large = (SEGMENT_ANGLE + SEGMENT_OVERLAP_DEG) > 180 ? 1 : 0;
              const path = `M ${x1} ${y1} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${large} 0 ${x4} ${y4} Z`;
              const quality = getSegmentQuality(i, keyIndex);
              const isDim = quality === 'dim';
              const isMinor = quality === 'minor';
              return (
                <g key={keyName}>
                  <path
                    d={path}
                    fill="url(#wheelGrad)"
                    stroke="none"
                    className={`segment ${isMinor ? 'minor' : ''} ${isDim ? 'dim' : ''}`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Decoder overlay (fixed, with cut-outs) */}
        <div
          className="decoder-overlay"
          aria-hidden
        >
          <div className="decoder-overlay-inner">
          <svg
            viewBox={`${-WHEEL_SIZE / 2} ${-WHEEL_SIZE / 2} ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            className="decoder-svg"
          >
            <defs>
              <mask id="decoder-mask">
                <rect x={-WHEEL_SIZE / 2} y={-WHEEL_SIZE / 2} width={WHEEL_SIZE} height={WHEEL_SIZE} fill="white" />
                {DECODER_ANGLES.map((angle, i) => {
                  const rad = ((angle - 90) * Math.PI) / 180;
                  const r = DECODER_WINDOW_RADII[i] * SCALE;
                  const cutoutR = DECODER_CUTOUT_RADII[i] * SCALE;
                  const x = r * Math.cos(rad);
                  const y = r * Math.sin(rad);
                  return (
                    <circle key={i} cx={x} cy={y} r={cutoutR} fill="black" />
                  );
                })}
              </mask>
              {/* Path for "relative minor": arc wraps above vi cutout; radius matches cutout; small gap between cutout and label. */}
              <path
                id="relative-minor-path"
                d={(() => {
                  const cutoutTopY = 132 * SCALE - 26 * SCALE; // top edge of vi cutout
                  const arcRadius = 26 * SCALE;
                  const gap = 5 * SCALE; // separation between cutout and label
                  const circleCenterY = cutoutTopY - gap + arcRadius; // arc sits above cutout
                  const chordY = circleCenterY;
                  const startX = -arcRadius;
                  const endX = arcRadius;
                  return `M ${startX} ${chordY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${chordY}`;
                })()}
              />
            </defs>
            <circle cx={CX} cy={CY} r={WHEEL_SIZE / 2} fill="#d4a82a" mask="url(#decoder-mask)" />
            {/* Two separate arcs: (1) IV–I–V only, (2) iii–vi–ii only. Use small-arc so each stays on its own half. */}
            <g aria-hidden>
              {(() => {
                const rArc = 132 * SCALE;
                const half = rArc / 2;
                const halfRoot3 = (rArc * Math.sqrt(3)) / 2;
                return (
                  <>
                    {/* Major only: small arc through 330° → 0° → 30° (stays in top half, does not cross to minor) */}
                    <path
                      d={`M ${-half} ${-halfRoot3} A ${rArc} ${rArc} 0 0 1 ${half} ${-halfRoot3}`}
                      fill="none"
                      stroke="#1a1a1a"
                      strokeWidth={1}
                    />
                    {/* Minor only: small arc through 150° → 180° → 210° (stays in bottom half) */}
                    <path
                      d={`M ${half} ${halfRoot3} A ${rArc} ${rArc} 0 0 1 ${-half} ${halfRoot3}`}
                      fill="none"
                      stroke="#1a1a1a"
                      strokeWidth={1}
                    />
                  </>
                );
              })()}
            </g>
            {/* Divider line and MAJOR/minor labels in SVG — above yellow, below chord labels */}
            <line x1={-WHEEL_SIZE / 2} y1={0} x2={WHEEL_SIZE / 2} y2={0} stroke="#1a1a1a" strokeWidth={2} strokeDasharray="8 6" />
            <text x={0} y={-WHEEL_SIZE * 0.03} textAnchor="middle" dominantBaseline="middle" fill="#1a1a1a" fontWeight="700" style={{ fontSize: 14 }}>MAJOR</text>
            <text x={0} y={WHEEL_SIZE * 0.03} textAnchor="middle" dominantBaseline="middle" fill="#1a1a1a" fontWeight="700" style={{ fontSize: 14 }}>minor</text>
            {/* "relative minor" curved above vi cutout — centered on path so it wraps above the cutout */}
            <text fill="#1a1a1a" fontWeight="600" style={{ fontSize: 11 }} className="decoder-relative-minor-label">
              <textPath href="#relative-minor-path" startOffset="50%" textAnchor="middle">
                relative minor
              </textPath>
            </text>
            {/* Labels in SVG so they use same coordinates as cutouts */}
            <g className="decoder-labels" aria-hidden>
              {DECODER_ANGLES.map((angle, i) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const r = DECODER_WINDOW_RADII[i] * SCALE;
                const cutoutR = DECODER_CUTOUT_RADII[i] * SCALE;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                const chord = diatonic[DECODER_CHORD_INDEX[i]];
                const romanNumeral = DECODER_ROMAN_NUMERALS[i];
                const romanNumeralForBadge = romanNumeral.replace(/°$/, '');
                const spelledLabel = spellChordLabel(chord.label, preferFlats);
                const chordDisplay = formatChordForCutout({ label: spelledLabel, quality: chord.quality });
                const isMinor = chord.quality === 'minor';
                const isDim = chord.quality === 'dim';
                const smallR = cutoutR * 0.52;
                /* 7th chord quality badge text by scale degree (I=0, ii=1, iii=2, IV=3, V=4, vi=5, vii°=6 in diatonic order) */
                const chordIndexInOrder = DECODER_CHORD_INDEX[i];
                const seventhBadgeText: string | null = seventhChordMode
                  ? (chordIndexInOrder === 0 ? 'maj7'
                  : chordIndexInOrder === 1 ? 'm7'
                  : chordIndexInOrder === 2 ? 'm7'
                  : chordIndexInOrder === 3 ? 'maj7'
                  : chordIndexInOrder === 4 ? '7'
                  : chordIndexInOrder === 5 ? 'm7'
                  : chordIndexInOrder === 6 ? '°7'  // vii° → diminished 7
                  : null)
                  : null;
                const showSeventhBadge = seventhBadgeText != null;
                /* When not in 7th mode: show triadic badges (m for minor, ° for dim). When in 7th mode: show 7th badge only. */
                const showMinorBadge = isMinor && !seventhChordMode;
                const showDimBadge = isDim && !seventhChordMode;
                /* Larger chord text, cap to fit cutout; slightly smaller for 2-char labels */
                const chordSize = Math.min(32, Math.round(cutoutR * 1.35));
                const chordFontSize = chordDisplay.length > 1 ? Math.min(chordSize, 24) : chordSize;
                /* Interval badge: at bottom of cutout, overlapping it. No degree sign in label. */
                const badgeXInterval = x;
                const badgeYBottom = y + cutoutR;
                /* Top-right of cutout for dim badge — greater offset so it sits further from the cutout */
                const dimOffset = cutoutR * 0.9;
                const badgeXTopRight = x + dimOffset;
                const badgeYTopRight = y - dimOffset;
                return (
                  <g key={i}>
                    {showDimBadge && (
                      <g>
                        {/* ° badge drawn first so it appears behind the cutout text */}
                        <circle cx={badgeXTopRight} cy={badgeYTopRight} r={smallR} fill="#1a1a1a" />
                        <text
                          x={badgeXTopRight}
                          y={badgeYTopRight}
                          dy="0.22em"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#d4a82a"
                          fontWeight="700"
                          style={{ fontSize: Math.max(14, Math.round(smallR * 1.4)) }}
                        >
                          °
                        </text>
                      </g>
                    )}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#d4a82a"
                      fontWeight="700"
                      className={`decoder-svg-chord decoder-svg-chord-${chord.quality}`}
                      style={{ fontSize: chordFontSize }}
                    >
                      {chordDisplay}
                    </text>
                    {/* Interval badge: bottom of cutout, overlapping it; no degree sign */}
                    <circle cx={badgeXInterval} cy={badgeYBottom} r={BADGE_R} fill="#1a1a1a" stroke="#d4a82a" strokeWidth={2} />
                    <text
                      x={badgeXInterval}
                      y={badgeYBottom}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#d4a82a"
                      fontWeight="700"
                      style={{ fontSize: BADGE_FONT_SIZE }}
                    >
                      {romanNumeralForBadge}
                    </text>
                    {showMinorBadge && (
                      <g>
                        {/* m badge: offset to the right of cutout, previous sizing (cutout-based) */}
                        <circle cx={x + cutoutR} cy={y} r={smallR} fill="#1a1a1a" />
                        <text
                          x={x + cutoutR}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#d4a82a"
                          fontWeight="700"
                          style={{ fontSize: Math.max(14, Math.round(smallR * 1.4)) }}
                        >
                          m
                        </text>
                      </g>
                    )}
                    {showSeventhBadge && seventhBadgeText && (
                      <g>
                        {/* 7th quality badge: same style as m/° badge; vii° at top-right, others to the right of cutout */}
                        {(() => {
                          const longLabel = seventhBadgeText.length > 2;
                          const badgeFontSize = longLabel ? Math.max(7, Math.round(smallR * 0.8)) : Math.max(8, Math.round(smallR * 0.9));
                          return chordIndexInOrder === 6 ? (
                            <>
                              <circle cx={badgeXTopRight} cy={badgeYTopRight} r={smallR} fill="#1a1a1a" />
                              <text
                                x={badgeXTopRight}
                                y={badgeYTopRight}
                                dy="0.22em"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#d4a82a"
                                fontWeight="700"
                                style={{ fontSize: badgeFontSize }}
                              >
                                <tspan>°</tspan>
                                <tspan dy="-0.45em" style={{ fontSize: '70%' }}>7</tspan>
                              </text>
                            </>
                          ) : (
                            <>
                              <circle cx={x + cutoutR} cy={y} r={smallR} fill="#1a1a1a" />
                              <text
                                x={x + cutoutR}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#d4a82a"
                                fontWeight="700"
                                style={{ fontSize: badgeFontSize }}
                              >
                                {seventhBadgeText}
                              </text>
                            </>
                          );
                        })()}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        </div>
      </div>

      <MusicStaff keyIndex={keyIndex} preferFlats={preferFlats} />
    </div>
      </main>
    </div>
  );
}
