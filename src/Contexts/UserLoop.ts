//userloop関連のcontext
import { createContext } from 'react'
import { AudioRange } from 'types/front'

//オーディオファイルまたはyoutubeのループ範囲
export const MediaRangeContext = createContext<AudioRange>({ start: 0, end: 0 })
