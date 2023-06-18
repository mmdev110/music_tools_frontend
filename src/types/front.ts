import internal from 'stream'

export type User = {
    userId: number
    email: string
    token: string
}
export type UserSong = {
    id?: number
    title: string
    artist: string
    memo: string
    sections: UserSongSection[]
    audio: UserSongAudio | null
    genres: Genre[]
    tags: Tag[]
    instruments: UserSongInstrument[]
}
export type UserSongSection = {
    id?: number
    progressions: string[]
    progressionsCsv: string //API通信用
    key: number
    bpm: number
    section: string
    scale: string
    memo: string
    audioPlaybackRange: AudioRange
    midi: UserSectionMidi | null
    sortOrder: number
    instruments: UserSongInstrument[]
}
type UserSongAudio = {
    id?: number
    userSongId?: number
    name: string
    url: {
        get: string
        put: string
    }
}
export type UserSongInstrument = {
    id?: number
    userSongId?: number
    name: string
    category: 'tonal' | 'rhythm' | 'FX' | ''
    memo: string
    sortOrder: number
}
type UserSectionMidi = {
    id?: number
    userSongSectionId: number
    name: string
    url: {
        get: string
        put: string
    }
    midiRoots: number[]
    midiRootsCsv: string //API通信用
}
export type AudioRange = {
    //audioの再生範囲
    start: number
    end: number
}
export type AudioState = {
    //再生中のaudioの状態
    currentTime_sec: number
    duration_sec: number
}
export type Genre = {
    id?: number
    userId?: number
    name: string
    sortOrder: number
    userSongs?: UserSong[]
}
export type Tag = {
    id?: number
    userId?: number
    name: string
    sortOrder: number
    userSongs?: UserSong[]
}

export type UserSongSearchCondition = {
    tagIds?: number[]
    subString?: string
}
export type ViewType = {
    name: 'overview' | 'chords' | 'memo'
    sortOrder: number
}
