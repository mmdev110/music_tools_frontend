//userloop関連のcontext
import { createContext } from 'react'
import { MediaRange } from 'types/front'

//オーディオファイルまたはyoutubeのループ範囲
export const MediaRangeContext = createContext<MediaRange>({ start: 0, end: 0 })
