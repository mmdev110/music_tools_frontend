import * as Types from '../types/music'

export const ALL_NOTES: Types.NOTE[] = [
    { index: 0, flat: 'C', sharp: 'C' }, //0
    { index: 1, flat: 'Db', sharp: 'C#' }, //1
    { index: 2, flat: 'D', sharp: 'D' }, //2
    { index: 3, flat: 'Eb', sharp: 'D#' }, //3
    { index: 4, flat: 'E', sharp: 'E' }, //4
    { index: 5, flat: 'F', sharp: 'F' }, //5
    { index: 6, flat: 'Gb', sharp: 'F#' }, //6
    { index: 7, flat: 'G', sharp: 'G' }, //7
    { index: 8, flat: 'Ab', sharp: 'G#' }, //8
    { index: 9, flat: 'A', sharp: 'A' }, //9
    { index: 10, flat: 'Bb', sharp: 'A#' }, //10
    { index: 11, flat: 'B', sharp: 'B' }, //11
]
export const ALL_DEGREES = [
    { index: 0, degree: 'I', interval: 'root' },
    { index: 1, degree: 'bII', interval: 'b9th' },
    { index: 2, degree: 'II', interval: '9th' },
    { index: 3, degree: 'bIII', interval: 'm3rd' },
    { index: 4, degree: 'III', interval: 'M3rd' },
    { index: 5, degree: 'IV', interval: '11th' },
    { index: 6, degree: 'bV', interval: '#11th' },
    { index: 7, degree: 'V', interval: '5th' },
    { index: 8, degree: 'bVI', interval: 'b13th' },
    { index: 9, degree: 'VI', interval: '13th' },
    { index: 10, degree: 'bVII', interval: '7th' },
    { index: 11, degree: 'VII', interval: 'M7th' },
]

//フラット系の調号となるルートの一覧(五度圏の左半分)
export const FLAT_SCALE_ROOTS_MAJOR: number[] = [5, 10, 3, 8, 1]
export const FLAT_SCALE_ROOTS_MINOR: number[] = [2, 7, 0, 5, 10]

export const TERMS = {
    MAJOR: 'メジャー', //日本語表記でバグったら日本語用のMAJOR_JPみたいなのを作る
    NATURAL_MINOR: 'ナチュラルマイナー',
    HARMONIC_MINOR: 'ハーモニックマイナー',
    MELODIC_MINOR: 'メロディックマイナー',
    IONIAN: 'Ionian',
    DORIAN: 'Dorian',
    AEORIAN: 'Aeorian',
    LYDIAN: 'Lydian',
    MIXOLYDIAN: 'Mixolydian',
    PHRYGIAN: 'Phrygian',
    LOCRIAN: 'Locrian',
    Diatonic: 'ダイアトニック',
    Dominant: 'D',
    SubDominant: 'SD',
    SubDominantMinor: 'SDm',
    Tonic: 'T',
    PFourthMove: '四度上行',
    DominantMotion: 'ドミナントモーション',
    TwoFive: 'ツーファイブ',
    SecondaryDominant: 'セカンダリードミナント',
    UraChord: '裏コード',
    PassingDiminish: 'パッシングdim',
    OnChordInversion: 'オンコード(転回形)',
    OnChordOther: 'オンコード(非転回形)',
    SubstituteDominant: '代理コード(ドミナント)',
    SubstituteSus4: '代理コード(sus4)',
}
export const SCALES: {
    [key: string]: {
        notes: number[]
        avoids: number[]
        chordTones: number[]
        naturalTensions: number[]
        alteredTensions: number[]
        modeNames?: string[]
        diatonics?: {
            root: number
            third: string
            fifth: string
            seventh: string
            role: string
        }[]
    }
} = {
    [TERMS.IONIAN]: {
        notes: [0, 2, 4, 5, 7, 9, 11],
        avoids: [5],
        chordTones: [0, 4, 7, 11],
        naturalTensions: [2, 9],
        alteredTensions: [6],
    },
    [TERMS.DORIAN]: {
        notes: [0, 2, 3, 5, 7, 9, 10],
        avoids: [9],
        chordTones: [0, 3, 7, 10],
        naturalTensions: [2, 5],
        alteredTensions: [],
    },
    [TERMS.PHRYGIAN]: {
        notes: [0, 1, 3, 5, 7, 8, 10],
        avoids: [1, 8],
        chordTones: [0, 3, 7, 10],
        naturalTensions: [5],
        alteredTensions: [],
    },
    [TERMS.LYDIAN]: {
        notes: [0, 2, 4, 6, 7, 9, 11],
        avoids: [],
        chordTones: [0, 4, 7, 11],
        naturalTensions: [2, 6, 9],
        alteredTensions: [],
    },
    [TERMS.MIXOLYDIAN]: {
        notes: [0, 2, 4, 5, 7, 9, 10],
        avoids: [5],
        chordTones: [0, 4, 7, 10],
        naturalTensions: [2, 9],
        alteredTensions: [1, 3, 6, 8],
    },
    [TERMS.AEORIAN]: {
        notes: [0, 2, 3, 5, 7, 8, 10],
        avoids: [8],
        chordTones: [0, 3, 7, 10],
        naturalTensions: [2, 5],
        alteredTensions: [],
    },
    [TERMS.LOCRIAN]: {
        notes: [0, 1, 3, 5, 6, 9, 10],
        avoids: [1],
        chordTones: [0, 3, 6, 10],
        naturalTensions: [5, 9],
        alteredTensions: [],
    },
    [TERMS.MAJOR]: {
        notes: [0, 2, 4, 5, 7, 9, 11],
        avoids: [5],
        chordTones: [0, 4, 7, 11],
        naturalTensions: [2, 9],
        alteredTensions: [],

        modeNames: [
            TERMS.IONIAN,
            TERMS.DORIAN,
            TERMS.PHRYGIAN,
            TERMS.LYDIAN,
            TERMS.MIXOLYDIAN,
            TERMS.AEORIAN,
            TERMS.LOCRIAN,
        ],
        diatonics: [
            {
                root: 0,
                third: '',
                fifth: '',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //CM7
            {
                root: 2,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //Dm7
            { root: 4, third: 'm', fifth: '', seventh: '7', role: TERMS.Tonic }, //Em7
            {
                root: 5,
                third: '',
                fifth: '',
                seventh: 'M7',
                role: TERMS.SubDominant,
            }, //FM7
            {
                root: 7,
                third: '',
                fifth: '',
                seventh: '7',
                role: TERMS.Dominant,
            }, //G7
            {
                root: 9,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.Tonic,
            }, //Am7
            { root: 11, third: 'm', fifth: 'b5', seventh: '7', role: '?' }, //Bm7b5
        ],
    },
    [TERMS.NATURAL_MINOR]: {
        notes: [0, 2, 3, 5, 7, 8, 10],
        avoids: [8],
        chordTones: [0, 3, 7, 10],
        naturalTensions: [2, 5],
        alteredTensions: [],
        modeNames: [
            TERMS.AEORIAN,
            TERMS.LOCRIAN,
            TERMS.IONIAN,
            TERMS.DORIAN,
            TERMS.PHRYGIAN,
            TERMS.LYDIAN,
            TERMS.MIXOLYDIAN,
        ],
        diatonics: [
            {
                root: 0,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.Tonic,
            }, //Am7
            {
                root: 2,
                third: 'm',
                fifth: 'b5',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //Bm7b5
            {
                root: 3,
                third: '',
                fifth: '',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //CM7
            {
                root: 5,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //Dm7
            {
                root: 7,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.Dominant,
            }, //Em7
            {
                root: 8,
                third: '',
                fifth: '',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //FM7
            { root: 10, third: '', fifth: '', seventh: '7', role: '?' }, //G7
        ],
    },
    [TERMS.HARMONIC_MINOR]: {
        notes: [0, 2, 3, 5, 7, 8, 11],
        avoids: [5],
        chordTones: [0, 4, 7, 11],
        naturalTensions: [2, 9],
        alteredTensions: [],
        diatonics: [
            {
                root: 0,
                third: 'm',
                fifth: '',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //AmM7
            {
                root: 2,
                third: 'm',
                fifth: 'b5',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //Bm7b5
            {
                root: 3,
                third: '',
                fifth: '#5',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //CM7#5
            {
                root: 5,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //Dm7
            {
                root: 7,
                third: '',
                fifth: '',
                seventh: '7',
                role: TERMS.Dominant,
            }, //E7
            {
                root: 8,
                third: '',
                fifth: '',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //FM7
            { root: 11, third: 'dim', fifth: '', seventh: '', role: '?' }, //G#dim
        ],
    },
    [TERMS.MELODIC_MINOR]: {
        notes: [0, 2, 3, 5, 7, 9, 11],
        avoids: [5],
        chordTones: [0, 4, 7, 11],
        naturalTensions: [2, 9],
        alteredTensions: [],
        diatonics: [
            {
                root: 0,
                third: 'm',
                fifth: '',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //AmM7
            {
                root: 2,
                third: 'm',
                fifth: '',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //Bm7b5
            {
                root: 3,
                third: '',
                fifth: '#5',
                seventh: 'M7',
                role: TERMS.Tonic,
            }, //CM7#5
            {
                root: 5,
                third: '',
                fifth: '',
                seventh: '7',
                role: TERMS.SubDominant,
            }, //D7
            {
                root: 7,
                third: '',
                fifth: '',
                seventh: '7',
                role: TERMS.Dominant,
            }, //E7
            {
                root: 9,
                third: 'm',
                fifth: 'b5',
                seventh: '7',
                role: TERMS.Tonic,
            }, //F#m7b5
            { root: 11, third: 'm', fifth: 'b5', seventh: '7', role: '?' }, //G#m7b5
        ],
    },
}
export const InitChordBox: Types.ChordBox = {
    input: '',
    degree: '',
    keyChanged: '',
}
export const CHORD_RE = {
    ROOT: /^[A-Z][#|b]?/,
    ON_CHORD: /(\/)([A-Z][#|b]?)$/,
    THIRD: /m|sus4|sus2|dim/,
    FIFTH: /aug|b5|#5/,
    SEVENTH: /M7|7|6/,
    TENSIONS: /9|b9|11|#11|13|b13/g,
    ADD: /add/,
}

export const Sequencer = {
    ticksPerBar: 1920,
    pixelHeight: 16, //px
    pixelWidth: 32,
    pixelResolution: 8, //1ピクセル=1/8小節
    barWidth: 32 * 8, //gridPixelWidth * gridResolution
}
export const NoteColors = {
    ChordTone: 'bg-sky-400',
    Avoid: 'bg-red-400',
    NaturalTension: 'bg-green-400',
    AlteredTension: 'bg-yellow-400',
}
