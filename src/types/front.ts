import internal from 'stream'

export type Tag = {
    id?: number
    userId?: number
    name: string
    sortOrder?: number
    userLoops?: UserLoopInput[]
}
export type User = {
    userId: number
    email: string
    token: string
}
export type UserLoopInput = {
    id?: number
    name: string
    artist: string
    progressions: string[]
    key: number
    bpm: number
    section: string
    scale: string
    memo: string
    memoBass: string
    memoChord: string
    memoLead: string
    memoRhythm: string
    memoTransition: string
    userLoopAudio: UserLoopAudio | null
    userLoopMidi: UserLoopMidi | null
    userLoopTags: Tag[]
}
type UserLoopAudio = {
    id?: number
    name: string
    url: {
        get: string
        put: string
    }
    range: AudioRange
}
type UserLoopMidi = {
    id?: number
    name: string
    url: {
        get: string
        put: string
    }
    midiRoots: number[]
}
export type AudioRange = {
    //audioの再生範囲
    start: number
    end: number
}
export type UserLoopSearchCondition = {
    tagIds?: number[]
    subString?: string
}
