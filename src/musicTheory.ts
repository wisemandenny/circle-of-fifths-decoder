// Circle of fifths: clockwise from C (top)
export const KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F',
] as const;

export type KeyName = (typeof KEYS)[number];

export type ChordQuality = 'major' | 'minor' | 'dim';

export interface DiatonicChord {
  label: string;
  quality: ChordQuality;
}

// Diatonic chords in order: I, ii, iii, IV, V, vi, vii°
// Precomputed for each key (index 0 = C, 1 = G, ... 11 = F)
export const DIATONIC_CHORDS: Record<number, DiatonicChord[]> = {
  0: [  // C
    { label: 'C', quality: 'major' },
    { label: 'Dm', quality: 'minor' },
    { label: 'Em', quality: 'minor' },
    { label: 'F', quality: 'major' },
    { label: 'G', quality: 'major' },
    { label: 'Am', quality: 'minor' },
    { label: 'B', quality: 'dim' },
  ],
  1: [  // G
    { label: 'G', quality: 'major' },
    { label: 'Am', quality: 'minor' },
    { label: 'Bm', quality: 'minor' },
    { label: 'C', quality: 'major' },
    { label: 'D', quality: 'major' },
    { label: 'Em', quality: 'minor' },
    { label: 'F♯', quality: 'dim' },
  ],
  2: [  // D
    { label: 'D', quality: 'major' },
    { label: 'Em', quality: 'minor' },
    { label: 'F♯m', quality: 'minor' },
    { label: 'G', quality: 'major' },
    { label: 'A', quality: 'major' },
    { label: 'Bm', quality: 'minor' },
    { label: 'C♯', quality: 'dim' },
  ],
  3: [  // A
    { label: 'A', quality: 'major' },
    { label: 'Bm', quality: 'minor' },
    { label: 'C♯m', quality: 'minor' },
    { label: 'D', quality: 'major' },
    { label: 'E', quality: 'major' },
    { label: 'F♯m', quality: 'minor' },
    { label: 'G♯', quality: 'dim' },
  ],
  4: [  // E
    { label: 'E', quality: 'major' },
    { label: 'F♯m', quality: 'minor' },
    { label: 'G♯m', quality: 'minor' },
    { label: 'A', quality: 'major' },
    { label: 'B', quality: 'major' },
    { label: 'C♯m', quality: 'minor' },
    { label: 'D♯', quality: 'dim' },
  ],
  5: [  // B
    { label: 'B', quality: 'major' },
    { label: 'C♯m', quality: 'minor' },
    { label: 'D♯m', quality: 'minor' },
    { label: 'E', quality: 'major' },
    { label: 'F♯', quality: 'major' },
    { label: 'G♯m', quality: 'minor' },
    { label: 'A♯', quality: 'dim' },
  ],
  6: [  // F♯
    { label: 'F♯', quality: 'major' },
    { label: 'G♯m', quality: 'minor' },
    { label: 'A♯m', quality: 'minor' },
    { label: 'B', quality: 'major' },
    { label: 'C♯', quality: 'major' },
    { label: 'D♯m', quality: 'minor' },
    { label: 'E♯', quality: 'dim' },
  ],
  7: [  // D♭
    { label: 'D♭', quality: 'major' },
    { label: 'E♭m', quality: 'minor' },
    { label: 'Fm', quality: 'minor' },
    { label: 'G♭', quality: 'major' },
    { label: 'A♭', quality: 'major' },
    { label: 'B♭m', quality: 'minor' },
    { label: 'C', quality: 'dim' },
  ],
  8: [  // A♭
    { label: 'A♭', quality: 'major' },
    { label: 'B♭m', quality: 'minor' },
    { label: 'Cm', quality: 'minor' },
    { label: 'D♭', quality: 'major' },
    { label: 'E♭', quality: 'major' },
    { label: 'Fm', quality: 'minor' },
    { label: 'G', quality: 'dim' },
  ],
  9: [  // E♭
    { label: 'E♭', quality: 'major' },
    { label: 'Fm', quality: 'minor' },
    { label: 'Gm', quality: 'minor' },
    { label: 'A♭', quality: 'major' },
    { label: 'B♭', quality: 'major' },
    { label: 'Cm', quality: 'minor' },
    { label: 'D', quality: 'dim' },
  ],
  10: [  // B♭
    { label: 'B♭', quality: 'major' },
    { label: 'Cm', quality: 'minor' },
    { label: 'Dm', quality: 'minor' },
    { label: 'E♭', quality: 'major' },
    { label: 'F', quality: 'major' },
    { label: 'Gm', quality: 'minor' },
    { label: 'A', quality: 'dim' },
  ],
  11: [  // F
    { label: 'F', quality: 'major' },
    { label: 'Gm', quality: 'minor' },
    { label: 'Am', quality: 'minor' },
    { label: 'B♭', quality: 'major' },
    { label: 'C', quality: 'major' },
    { label: 'Dm', quality: 'minor' },
    { label: 'E', quality: 'dim' },
  ],
};

// Scale degree labels for decoder windows (1=I, 2=ii, 3=iii, 4=IV, 5=V, 6=vi, 7=vii°)
export const SCALE_DEGREE_LABELS = ['1', '2', '3', '4', '5', '6', '7'] as const;

// Decoder window positions: angle in degrees (0 = top, clockwise).
// Order matches scale degrees 1, 5, 2, 6, 3, 7, 4 (matching circle of fifths positions).
// Decoder angles in degrees (0 = top, clockwise): 1 at 0°, 5 at 30°, 2 at 150°, 6 at 180°, 3 at 210°, 7 at 270°, 4 at 330°
export const DECODER_ANGLES: number[] = [0, 30, 150, 180, 210, 270, 330];

// For each decoder window (same order as DECODER_ANGLES), the index into diatonic chords (0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°)
export const DECODER_CHORD_INDEX: number[] = [0, 4, 1, 5, 2, 6, 3];

// Scale degree to show in each decoder window (1, 5, 2, 6, 3, 7, 4 — matches circle order)
export const DECODER_DEGREE_LABELS: string[] = ['1', '5', '2', '6', '3', '7', '4'];

// Roman numerals for decoder layer below each cutout (same order as DECODER_ANGLES)
export const DECODER_ROMAN_NUMERALS: string[] = ['I', 'V', 'ii', 'vi', 'iii', 'vii°', 'IV'];

// Radius for each decoder window (index 5 = degree 7 is on inner wheel). Same length as DECODER_ANGLES.
export const DECODER_WINDOW_RADII: number[] = [132, 132, 132, 132, 132, 72, 132];

// Cutout radius per window: I, IV, V, vi = big (26); ii, iii, vii° = small (21). Order: I, V, ii, vi, iii, vii°, IV.
export const DECODER_CUTOUT_RADII: number[] = [26, 26, 21, 26, 21, 21, 26];
