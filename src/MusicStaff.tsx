import { useEffect, useRef } from 'react';
import '@fontsource/bravura';
import {
  getKeySignature,
  BASS_CLEF_SHARP_POSITIONS,
  BASS_CLEF_FLAT_POSITIONS,
} from './musicTheory';

interface ProgressionChord {
  name: string;
  numeral: string;
}

interface MusicStaffProps {
  keyIndex: number;
  preferFlats: boolean;
  chords?: ProgressionChord[];
  onClear?: () => void;
}

const LINE_SPACING = 10;
const STAFF_TOP = 30;
const STAFF_LINES = [0, 1, 2, 3, 4].map((i) => STAFF_TOP + i * LINE_SPACING);
const STAFF_BOTTOM = STAFF_LINES[4];

function staffPosToY(pos: number): number {
  return STAFF_BOTTOM - pos * (LINE_SPACING / 2);
}

const ACCIDENTAL_FONT_SIZE = LINE_SPACING * 4;

function SharpSymbol({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      fontFamily="Bravura"
      fontSize={ACCIDENTAL_FONT_SIZE}
    >
      {'\uE262'}
    </text>
  );
}

function FlatSymbol({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      fontFamily="Bravura"
      fontSize={ACCIDENTAL_FONT_SIZE}
    >
      {'\uE260'}
    </text>
  );
}

function BassClef({ x }: { x: number }) {
  const fontSize = LINE_SPACING * 4;
  return (
    <text
      x={x}
      y={STAFF_LINES[1]}
      fill="currentColor"
      fontFamily="Bravura"
      fontSize={fontSize}
    >
      {'\uE062'}
    </text>
  );
}

const MEASURE_WIDTH = 80;
const CHORD_LABEL_Y = STAFF_TOP - 12;

export default function MusicStaff({ keyIndex, preferFlats, chords = [], onClear }: MusicStaffProps) {
  const keySig = getKeySignature(keyIndex, preferFlats);
  const accidentalSpacing = 12;
  const clefX = 16;
  const keySigStartX = clefX + 36;
  const scrollRef = useRef<HTMLDivElement>(null);

  const positions = keySig.type === 'sharps'
    ? BASS_CLEF_SHARP_POSITIONS.slice(0, keySig.count)
    : keySig.type === 'flats'
    ? BASS_CLEF_FLAT_POSITIONS.slice(0, keySig.count)
    : [];

  const keySigEndX = keySigStartX + positions.length * accidentalSpacing;
  const firstChordPadding = 50;
  const firstMeasureEndX = keySigEndX + firstChordPadding;
  const lastBarX = chords.length > 0
    ? firstMeasureEndX + Math.max(0, chords.length - 1) * MEASURE_WIDTH
    : 0;
  const staffEndX = chords.length > 0 ? lastBarX : 400;
  const totalWidth = chords.length > 0 ? lastBarX + 2 : 400;

  useEffect(() => {
    if (scrollRef.current && chords.length > 0) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [chords.length]);

  return (
    <div className="music-staff-container">
      {chords.length > 0 && onClear && (
        <div className="music-staff-toolbar">
          <button type="button" className="staff-clear-btn" onClick={onClear}>
            Clear
          </button>
        </div>
      )}
      <div className="music-staff-scroll" ref={scrollRef}>
        <svg
          viewBox={`0 0 ${totalWidth} 100`}
          preserveAspectRatio="xMinYMid meet"
          className="music-staff-svg"
          style={{ width: `${Math.max(100, (totalWidth / 400) * 100)}%` }}
          aria-label={`Bass clef staff in ${keySig.count} ${keySig.type === 'none' ? 'no accidentals' : keySig.type}`}
        >
          <g className="staff-color">
            {STAFF_LINES.map((y, i) => (
              <line
                key={i}
                x1={0}
                y1={y}
                x2={staffEndX}
                y2={y}
                stroke="currentColor"
                strokeWidth={1}
              />
            ))}

            <BassClef x={clefX} />

            {positions.map((pos, i) => {
              const px = keySigStartX + i * accidentalSpacing;
              const py = staffPosToY(pos);
              return keySig.type === 'sharps' ? (
                <SharpSymbol key={i} x={px} y={py} />
              ) : (
                <FlatSymbol key={i} x={px} y={py} />
              );
            })}

            {chords.map((chord, i) => {
              let barEndX: number;
              let labelCenterX: number;

              if (i === 0) {
                barEndX = firstMeasureEndX;
                labelCenterX = keySigEndX + firstChordPadding / 2;
              } else {
                barEndX = firstMeasureEndX + i * MEASURE_WIDTH;
                labelCenterX = firstMeasureEndX + (i - 1) * MEASURE_WIDTH + MEASURE_WIDTH / 2;
              }

              const isLast = i === chords.length - 1;
              return (
                <g key={i}>
                  <text
                    x={labelCenterX}
                    y={CHORD_LABEL_Y}
                    textAnchor="middle"
                    dominantBaseline="alphabetic"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    <tspan fill="#888" fontWeight="500" fontSize="11">{chord.numeral}</tspan>
                    <tspan dx="3" fill="currentColor" fontWeight="600" fontSize="12">{chord.name}</tspan>
                  </text>
                  {isLast ? (
                    <>
                      <line
                        x1={barEndX - 3}
                        y1={STAFF_LINES[0]}
                        x2={barEndX - 3}
                        y2={STAFF_LINES[4]}
                        stroke="currentColor"
                        strokeWidth={1}
                      />
                      <line
                        x1={barEndX}
                        y1={STAFF_LINES[0]}
                        x2={barEndX}
                        y2={STAFF_LINES[4]}
                        stroke="currentColor"
                        strokeWidth={2.5}
                      />
                    </>
                  ) : (
                    <line
                      x1={barEndX}
                      y1={STAFF_LINES[0]}
                      x2={barEndX}
                      y2={STAFF_LINES[4]}
                      stroke="currentColor"
                      strokeWidth={1}
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
