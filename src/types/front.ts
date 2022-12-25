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
    progressions: string[]
    key: number
    scale: string
    midiRoots: number[]
    memo: string
    userLoopAudio: MediaPath
    userLoopMidi: MediaPath
    userLoopTags: Tag[]
}
type MediaPath = {
    id?: number
    name: string
    url: {
        get: string
        put: string
    }
}
export type UserLoopSearchCondition = {
    tagIds?: number[]
    subString?: string
}
