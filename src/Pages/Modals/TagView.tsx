import React, { useContext, useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import * as Types from 'types/music'
import { Tag } from 'types/'
import { getTags, saveTags } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'

type Props<T> = {
    onCancelButtonClick: () => void
    onSaveButtonClick: (selectedTags: TagUI[]) => void
    allTags: T[]
    songTags: T[]
}
interface Taglike {
    name: string
}
type TagUI = {
    name: string
    isSelected: boolean
}
const TagView = <T extends Taglike>({
    onSaveButtonClick,
    onCancelButtonClick,
    allTags,
    songTags,
}: Props<T>) => {
    const [tags, setTags] = useState<TagUI[]>([])
    //編集前のタグ
    const [oldTags, setOldTags] = useState<TagUI[]>([])
    useEffect(() => {
        const tagUIs = allTags.map((tag) => {
            const tagUI = {
                name: tag.name,
                isSelected: false,
            }
            //userloopに登録済みのタグかチェック
            if (songTags.find((elem) => elem.name === tag.name))
                tagUI.isSelected = true
            return tagUI
        })
        setTags(tagUIs)
        setOldTags(structuredClone(tagUIs))
    }, [])

    const [nameInput, setNameInput] = useState('')
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value)
    }
    const select = (index: number) => {
        const newTags = [...tags]
        //反転
        newTags[index].isSelected = !newTags[index].isSelected
        setTags(newTags)
    }
    const append = (e: React.FormEvent) => {
        e.preventDefault()
        if (nameInput === '') return
        //同じ名前のタグは登録不可
        if (tags.find((tag) => tag.name === nameInput)) return
        const newTag: TagUI = {
            name: nameInput,
            isSelected: false,
        }
        setTags([...tags, newTag])
        setNameInput('')
    }
    const remove = (index: number) => {
        const newTags = [...tags]
        newTags.splice(index, 1)
        setTags(newTags)
    }

    const isChanged = (): boolean => {
        return !lo.isEqual(oldTags, tags)
    }
    //タグが変化したかどうか(isSelectedを考慮しないver)
    const isTagsChanged = (): boolean => {
        const old = oldTags.map((tag) => {
            return { ...tag, isSelected: false }
        })
        const New = tags.map((tag) => {
            return { ...tag, isSelected: false }
        })
        return !lo.isEqual(old, New)
    }
    return (
        <div>
            <form className="pb-5" onSubmit={append}>
                <input
                    className="border-2 border-black"
                    type="text"
                    onChange={handleInput}
                    value={nameInput}
                />
                <Button type="submit">+</Button>
            </form>
            <div className="mb-5 flex flex-col gap-y-5">
                {tags.map((tag, index) => {
                    const bgColor = tag.isSelected ? 'bg-sky-500' : 'bg-sky-300'
                    return (
                        <div key={index}>
                            <Button
                                bgColor={bgColor}
                                onClick={() => select(index)}
                                key={'usertag' + index.toString()}
                            >
                                {tag.name}
                            </Button>
                            <Button
                                bgColor="bg-red-400"
                                onClick={() => remove(index)}
                                key={'usertagx' + index.toString()}
                            >
                                ×
                            </Button>
                        </div>
                    )
                })}
            </div>

            <Button
                disabled={!isChanged()}
                onClick={() => onSaveButtonClick(tags)}
            >
                保存
            </Button>
            <Button onClick={onCancelButtonClick}>cancel</Button>
        </div>
    )
}

export default TagView
