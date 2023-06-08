import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'
import { AudioRange, TagUI } from 'types/'
import { Button } from 'Components/HTMLElementsWrapper'

type Props = {
    viewType: TagUI[]
    onViewTypeChange: (newState: TagUI[]) => void
    tags: TagUI[]
    onTagsChange: (newTags: TagUI[]) => void
    genres: TagUI[]
    onGenresChange: (newGenres: TagUI[]) => void
}
const SearchField = ({
    tags,
    genres,
    viewType,
    onViewTypeChange,
    onTagsChange,
    onGenresChange,
}: Props) => {
    const renderTagUI = (
        tagUIs: TagUI[],
        onChange: (newUIs: TagUI[]) => void,
        exclusiveMode: boolean
    ) => {
        console.log(tagUIs)
        return (
            <div className="flex flex-row gap-x-1">
                {tagUIs.map((tag, index) => (
                    <Button
                        key={'tagbtn' + index.toString()}
                        bgColor={tag.isSelected ? 'bg-sky-500' : 'bg-sky-300'}
                        onClick={() => {
                            const newTags: TagUI[] = [...tagUIs]
                            if (exclusiveMode) {
                                //排他モードの場合、選択したもの以外は全てfalse
                                newTags.forEach((elem) => {
                                    elem.isSelected = false
                                    return elem
                                })
                            }
                            newTags[index].isSelected =
                                !newTags[index].isSelected
                            onChange(newTags)
                        }}
                    >
                        {tag.name}
                    </Button>
                ))}
            </div>
        )
    }

    return (
        <div>
            <div>Search Field</div>
            <div>表示内容</div>
            {renderTagUI(viewType, onViewTypeChange, true)}
            <div>ジャンル</div>
            {renderTagUI(genres, onGenresChange, false)}
            <div>タグ</div>
            {renderTagUI(tags, onTagsChange, false)}
        </div>
    )
}
export default SearchField
