import internal from 'stream'

export type User = {
    userId: number
    email: string
    token: string
}
export type UserLoopInput = {
    id?: number
    name: string
    progressions: string[]
    key: number
    scale: string
    midiRoots: number[]
    memo: string
    userLoopAudio: MediaPath
    userLoopMidi: MediaPath
}
type MediaPath = {
    name: string
    url: {
        get: string
        put: string
    }
}

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
    scaleForm: ScaleForm
}
export type ScaleForm = {
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
