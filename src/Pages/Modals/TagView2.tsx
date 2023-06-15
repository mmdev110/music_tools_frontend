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
type Selector<T> = T & {
    isSelected: boolean
}
interface TagModel {
    id?: number
    name: string
}
type Props<T> = {
    onCancelButtonClick: () => void
    onSaveButtonClick: (selected: T[], tagList: T[]) => void
    allTags: T[]
    selectedTags: T[]
}

const TagView2 = <T extends TagModel>({
    onSaveButtonClick,
    onCancelButtonClick,
    allTags,
    selectedTags,
}: Props<T>) => {
    //設定されているタグ
    const [selectors, setSelectors] = useState<Selector<T>[]>([])
    const [oldSelectors, setOldSelectors] = useState<Selector<T>[]>([])
    useEffect(() => {
        const selectors = allTags.map((tag): Selector<T> => {
            const isSelected = !!selectedTags.find((elem) => {
                if (elem.id && tag.id) return elem.id === tag.id
                return elem.name === tag.name
            })
            return { ...tag, isSelected }
        })
        setSelectors(selectors)
        setOldSelectors(structuredClone(selectors))
    }, [])

    //入力フォーム
    const [nameInput, setNameInput] = useState('')
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value)
    }

    const append = (e: React.FormEvent) => {
        e.preventDefault()
        if (nameInput === '') return
        //同じ名前のタグは登録不可
        if (selectors.find((tag) => tag.name === nameInput)) return
        const newSelector = {
            name: nameInput,
            isSelected: false,
        } as Selector<T>
        setSelectors([...selectors, newSelector])
        setNameInput('')
    }
    const select = (index: number) => {
        const newSelectors = [...selectors]
        newSelectors[index].isSelected = !newSelectors[index].isSelected
        setSelectors(newSelectors)
    }

    const remove = (index: number) => {
        const newSelectors = [...selectors]
        newSelectors.splice(index, 1)
        setSelectors(newSelectors)
    }

    const isChanged = (): boolean => {
        return !lo.isEqual(oldSelectors, selectors)
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
                {selectors.map((selector, index) => {
                    const bgColor = selector.isSelected
                        ? 'bg-sky-500'
                        : 'bg-sky-300'
                    return (
                        <div key={index}>
                            <Button
                                bgColor={bgColor}
                                onClick={() => select(index)}
                                key={'usertag' + index.toString()}
                            >
                                {selector.name}
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
                onClick={() => {
                    const selected = selectors.filter((elem) => elem.isSelected)
                    const allT = selectors.map((elem): T => {
                        const { isSelected, ...t } = elem
                        return t as unknown as T
                    })
                    const selectedT = selected.map((elem): T => {
                        const { isSelected, ...t } = elem
                        return t as unknown as T
                    })
                    onSaveButtonClick(selectedT, allT)
                }}
            >
                保存
            </Button>
            <Button onClick={onCancelButtonClick}>cancel</Button>
        </div>
    )
}

export default TagView2