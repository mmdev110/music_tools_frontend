import React, { ButtonHTMLAttributes, useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import * as Types from 'types/music'
import { Tag } from 'types/'
import { getTags, saveTags } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'

type Props = {
    closeModal: () => void
    onTagUpdate: (selectedTags: Tag[]) => void
    loopTags: Tag[]
}

type TagUI = Tag & {
    isSelected: boolean
}
const TagModal = ({ onTagUpdate, closeModal, loopTags }: Props) => {
    useEffect(() => {
        loadTags()
    }, [])
    const [tags, setTags] = useState<TagUI[]>([])
    const [oldTags, setOldTags] = useState<TagUI[]>([])
    //編集前のタグ
    const loadTags = async () => {
        try {
            const tags = await getTags()
            console.log(localStorage.getItem('jwt'))
            console.log(tags)
            const tagUIs = tags.map((tag) => {
                const tagUI = {
                    ...tag,
                    isSelected: false,
                }
                //userloopに登録済みのタグかチェック
                if (loopTags.find((elem) => elem.name === tag.name))
                    tagUI.isSelected = true
                return tagUI
            })
            setTags(tagUIs)
            setOldTags(lo.cloneDeep(tagUIs))
        } catch (e) {
            console.log(e)
        }
    }
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
            //id: 0,
            //userId: 0,
            name: nameInput,
            sortOrder: tags.length + 1,
            isSelected: false,
            //userLoops: [],
        }
        const newTags = [...tags, newTag]
        setTags(newTags)
        setNameInput('')
    }
    const remove = (index: number) => {
        const newTags = [...tags]
        newTags.splice(index, 1)
        setTags(newTags)
    }

    const save = async () => {
        let newTags: TagUI[] = []
        try {
            const res = await saveTags(tags)
            //idがついて返ってくるので、tagsに反映させる
            newTags = tags.map((tag) => {
                const resTag = res.find((tag_res) => tag_res.name === tag.name)
                tag.id = resTag!.id
                tag.userId = resTag!.userId
                return tag
            })
            setTags(newTags)
        } catch (e) {
            console.log(e)
            closeModal()
        }
        //userloopの更新
        const selected = tags.filter((tag) => tag.isSelected)
        console.log('@@@selected=', selected)
        onTagUpdate(selected)
        closeModal()
    }
    const cancel = () => {
        closeModal()
    }
    const isChanged = (): boolean => {
        return !lo.isEqual(oldTags, tags)
    }
    return (
        <div>
            <h2>タグ編集</h2>
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
                        <div>
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

            <Button disabled={!isChanged()} onClick={save}>
                保存
            </Button>
            <Button onClick={cancel}>cancel</Button>
        </div>
    )
}

export default TagModal
