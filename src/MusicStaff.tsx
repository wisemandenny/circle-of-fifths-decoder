import '@fontsource/bravura';
import {
  getKeySignature,
  BASS_CLEF_SHARP_POSITIONS,
  BASS_CLEF_FLAT_POSITIONS,
} from './musicTheory';

interface MusicStaffProps {
  keyIndex: number;
  preferFlats: boolean;
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

export default function MusicStaff({ keyIndex, preferFlats }: MusicStaffProps) {
  const keySig = getKeySignature(keyIndex, preferFlats);
  const accidentalSpacing = 12;
  const clefX = 16;
  const keySigStartX = clefX + 36;

  const positions = keySig.type === 'sharps'
    ? BASS_CLEF_SHARP_POSITIONS.slice(0, keySig.count)
    : keySig.type === 'flats'
    ? BASS_CLEF_FLAT_POSITIONS.slice(0, keySig.count)
    : [];

  return (
    <div className="music-staff-container">
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="xMidYMid meet"
        className="music-staff-svg"
        aria-label={`Bass clef staff in ${keySig.count} ${keySig.type === 'none' ? 'no accidentals' : keySig.type}`}
      >
        <g className="staff-color">
          {STAFF_LINES.map((y, i) => (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={400}
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
        </g>
      </svg>
    </div>
  );
}
