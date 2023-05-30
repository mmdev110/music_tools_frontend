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
}
export type UserSongSection = {
    id?: number
    progressions: string[]
    progressionsCSV: string //API通信用
    key: number
    bpm: number
    section: string
    scale: string
    memo: string
    audioPlaybackRange: AudioRange
    midi: UserSectionMidi | null
    sortOrder: number
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
type UserSectionMidi = {
    id?: number
    userSongSectionId: number
    name: string
    url: {
        get: string
        put: string
    }
    midiRoots: number[]
    midiRootsCSV: string //API通信用
}
export type AudioRange = {
    //audioの再生範囲
    start: number
    end: number
}
export type Genre = {
    id?: number
    userId: number
    name: string
    sortOrder?: number
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
