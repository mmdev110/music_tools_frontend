import { UserSongSection, UserSong } from 'types/'
import { TERMS } from 'config/music'

export const ACCESS_TOKEN_DURATION_SEC = 60
//アクセストークンが切れる少し前にリフレッシュさせる
export const TOKEN_REFRESH_INTERVAL_SEC = ACCESS_TOKEN_DURATION_SEC - 5
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
console.log({ BACKEND_URL })

//コード進行欄のデフォルト入力
const DefaultChordNames: string[] = [
    'CM7',
    'Am7',
    'Dm7',
    'G7',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
]
//sectionの初期値
export const sectionInit: UserSongSection = {
    section: '',
    progressions: DefaultChordNames,
    progressionsCsv: '',
    key: 0,
    scale: TERMS.MAJOR,
    bpm: 0,
    memo: '',
    barLength: 8,
    memoTransition: '',
    audioPlaybackRange: {
        start: 0,
        end: 0,
    },
    midi: null,
    sortOrder: 0,
    instruments: [],
}
//songの初期値
//各ページのstateに使う際はstructuredCloneして使うこと
export const songInit: UserSong = {
    title: '',
    artist: '',
    sections: [structuredClone(sectionInit)],
    memo: '',
    audio: null,
    tags: [],
    genres: [],
    instruments: [],
}
//instrumentsの種類
export const INSTRUMENT_CATEGORIES = ['tonal', 'rhythm', 'FX', 'others']
