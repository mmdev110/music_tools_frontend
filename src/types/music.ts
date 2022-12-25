import internal from 'stream'

//Miditypes.Noteを加工したもの
export type SequencerNote = {
    style: string
    start: number //単位は小節
    end: number //単位は小節
    octave: number
    pitch: number
    name: string
    isRoot: boolean
    interval?: string
}
export type SequencerSetting = {
    barLength: number
    maxOctave: number
    minOctave: number
}
//C ~ Bまでの音符
//indexと配列のindexが被ってるので消したい
export type NOTE = {
    index: number
    flat: string
    sharp: string
}
export type ScaleDisplayProps = {
    scaleForm: ScaleFormType
}
export type ScaleFormType = {
    root: number
    scale: string
    transposeRoot: number | null
}
export type ChordBox = {
    input: string
    degree: string
    keyChanged: string
}

export type Degree = { index: number; degree: string; interval: string }
