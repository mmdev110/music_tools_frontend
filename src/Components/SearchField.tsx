import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'
import { AudioRange, ViewType, Tag, Genre } from 'types/'
import { Button } from 'Components/HTMLElementsWrapper'
import { values } from 'lodash'
type Selector<T extends TagModel> = T & {
    isSelected: boolean
}
interface TagModel {
    id?: number
    name: string
    sortOrder: number
}
type Props = {
    hideViewType?: boolean
    selectedViewTypes?: ViewType[]
    viewTypes?: ViewType[]
    onViewTypeChange?: (newState: ViewType[]) => void
    hideTags?: boolean
    tags?: Tag[]
    selectedTags?: Tag[]
    onTagsChange?: (newTags: Tag[]) => void
    hideGenres?: boolean
    selectedGenres?: Genre[]
    genres?: Genre[]
    onGenresChange?: (newGenres: Genre[]) => void
}
const SearchField = ({
    selectedTags,
    tags,
    selectedGenres,
    genres,
    selectedViewTypes,
    viewTypes,
    hideViewType,
    hideTags,
    hideGenres,
    onViewTypeChange,
    onTagsChange,
    onGenresChange,
}: Props) => {
    const [tagSelectors, setTagSelectors] = useState<Selector<Tag>[]>([])
    const [genreSelectors, setGenreSelectors] = useState<Selector<Genre>[]>([])
    const [viewTypeSelectors, setViewTypeSelectors] = useState<
        Selector<ViewType>[]
    >([])
    useEffect(() => {
        if (tags) {
            const t = tags.map((tag) => {
                const isSelected = !!selectedTags?.find((elem) => {
                    if (elem.id && tag.id) return elem.id === tag.id
                    return elem.name === tag.name
                })
                return { ...tag, isSelected }
            })
            setTagSelectors(t)
        }
        if (genres) {
            const g = genres.map((genre) => {
                const isSelected = !!selectedGenres?.find((elem) => {
                    if (elem.id && genre.id) return elem.id === genre.id
                    return elem.name === genre.name
                })
                return { ...genre, isSelected }
            })
            setGenreSelectors(g)
        }
        if (viewTypes) {
            const v = viewTypes.map((v) => {
                const isSelected = !!selectedViewTypes?.find((elem) => {
                    return elem.name === v.name
                })
                return { ...v, isSelected }
            })
            v[0].isSelected = true
            setViewTypeSelectors(v)
        }
    }, [tags, genres, viewTypes])
    const renderSelectors = <S extends Genre | Tag | ViewType>(
        selectors: Selector<S>[],
        onChange: (selected: S[]) => void,
        exclusiveMode: boolean
    ) => {
        return (
            <div className="flex flex-row gap-x-1">
                {selectors.map((selector, index) => (
                    <Button
                        key={index}
                        bgColor={
                            selector.isSelected ? 'bg-sky-500' : 'bg-sky-300'
                        }
                        onClick={() => {
                            const newSelectors = [...selectors]
                            if (exclusiveMode) {
                                //排他モードの場合、選択したもの以外は全てfalse
                                newSelectors.forEach((elem) => {
                                    elem.isSelected = false
                                    return elem
                                })
                            }
                            newSelectors[index].isSelected =
                                !newSelectors[index].isSelected
                            const selected = selectors.filter(
                                (sel) => sel.isSelected
                            )
                            const selectedState = selected.map((sel) => {
                                const { isSelected, ...rest } = sel
                                return rest as unknown as S
                            })
                            onChange(selectedState)
                        }}
                    >
                        {selector.name}
                    </Button>
                ))}
            </div>
        )
    }

    return (
        <div>
            {!hideViewType ? (
                <div>
                    <div>表示内容</div>
                    {renderSelectors<ViewType>(
                        viewTypeSelectors,
                        onViewTypeChange!,
                        true
                    )}
                </div>
            ) : null}
            {!hideGenres ? (
                <div>
                    <div>ジャンル</div>
                    {renderSelectors<Genre>(
                        genreSelectors,
                        onGenresChange!,
                        false
                    )}
                </div>
            ) : null}
            {!hideTags ? (
                <div>
                    <div>タグ</div>
                    {renderSelectors<Tag>(tagSelectors, onTagsChange!, false)}
                </div>
            ) : null}
        </div>
    )
}
export default SearchField
