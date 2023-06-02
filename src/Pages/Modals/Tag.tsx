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

type Props = {
    closeModal: () => void
    onTagUpdate: (selectedTags: Tag[]) => void
    songTags: Tag[]
}

type TagUI = Tag & {
    isSelected: boolean
}
const TagModal = ({ onTagUpdate, closeModal, songTags }: Props) => {
    const user = useContext(UserContext)

    useEffect(() => {
        loadTags()
    }, [])
    //編集中のタグ
    const [tags, setTags] = useState<TagUI[]>([])
    //編集前のタグ
    const [oldTags, setOldTags] = useState<TagUI[]>([])
    const loadTags = async () => {
        try {
            const tags = await getTags()
            const tagUIs = tags.map((tag) => {
                const tagUI = {
                    ...tag,
                    isSelected: false,
                }
                //userloopに登録済みのタグかチェック
                if (songTags.find((elem) => elem.id === tag.id))
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
            userId: user && user.userId ? user.userId : 0,
            name: nameInput,
            sortOrder: tags.length + 1,
            isSelected: false,
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
        if (isTagsChanged()) {
            //タグを保存
            try {
                const res = await saveTags(tags)
                //idがついて返ってくるので、tagsに反映させる
                newTags = tags.map((tag) => {
                    const resTag = res.find(
                        (tag_res) => tag_res.name === tag.name
                    )
                    tag.id = resTag!.id
                    tag.userId = resTag!.userId
                    return tag
                })
                setTags(newTags)
            } catch (e) {
                console.log(e)
                closeModal()
            }
        }

        //userSongの更新
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

            <Button disabled={!isChanged()} onClick={save}>
                保存
            </Button>
            <Button onClick={cancel}>cancel</Button>
        </div>
    )
}

export default TagModal
