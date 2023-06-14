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
    onSaveButtonClick: (selected: T[], tagList: T[]) => void
    allTags: T[]
    currentTags: T[]
}
interface Taglike {
    id?: number
    name: string
}

const TagView2 = <T extends Taglike>({
    onSaveButtonClick,
    onCancelButtonClick,
    allTags,
    currentTags,
}: Props<T>) => {
    //設定されているタグ
    const [tags, setTags] = useState<T[]>([])
    const [oldTags, setOldTags] = useState<T[]>([])
    //全てのタグ
    const [tagList, setTagList] = useState<T[]>([])
    const [oldTagList, setOldTagList] = useState<T[]>([])
    useEffect(() => {
        setTags(currentTags)
        setOldTags(structuredClone(currentTags))
        setTagList(allTags)
        setOldTagList(structuredClone(allTags))
    }, [])

    const [nameInput, setNameInput] = useState('')
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value)
    }
    const select = (tag: T) => {
        console.log('select')
        if (!isSelected(tag)) {
            //追加
            setTags([...tags, tag])
        } else {
            //削除
            const newTags = tags.filter((elem) => {
                if (elem.id && tag.id) return elem.id !== tag.id
                return elem.name !== tag.name
            })
            console.log(newTags)
            setTags(newTags)
        }
    }
    const isSelected = (target: T): boolean => {
        return !!tags.find((elem) => {
            if (elem.id && target.id) return elem.id === target.id
            return elem.name === target.name
        })
    }
    const append = (e: React.FormEvent) => {
        e.preventDefault()
        if (nameInput === '') return
        //同じ名前のタグは登録不可
        if (tags.find((tag) => tag.name === nameInput)) return
        const newTag = {
            name: nameInput,
        } as T
        setTagList([...tagList, newTag])
        setNameInput('')
    }
    const remove = (index: number) => {
        const newTags = [...tagList]
        newTags.splice(index, 1)
        setTagList(newTags)
    }

    const isChanged = (): boolean => {
        return !lo.isEqual(oldTags, tags) || !lo.isEqual(tagList, oldTagList)
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
                {tagList.map((tag, index) => {
                    const bgColor = isSelected(tag)
                        ? 'bg-sky-500'
                        : 'bg-sky-300'
                    return (
                        <div key={index}>
                            <Button
                                bgColor={bgColor}
                                onClick={() => select(tag)}
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
                onClick={() => onSaveButtonClick(tags, tagList)}
            >
                保存
            </Button>
            <Button onClick={onCancelButtonClick}>cancel</Button>
        </div>
    )
}

export default TagView2
