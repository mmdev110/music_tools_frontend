import React, { useContext, useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import * as Types from 'types/music'
import { Genre } from 'types/'
import { getGenres, saveGenres } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'

type Props = {
    closeModal: () => void
    onGenreUpdate: (selectedGenres: Genre[]) => void
    songGenres: Genre[]
}

type GenreUI = Genre & {
    isSelected: boolean
}
const GenreModal = ({ onGenreUpdate, closeModal, songGenres }: Props) => {
    const user = useContext(UserContext)

    useEffect(() => {
        loadGenres()
    }, [])
    //編集中のタグ
    const [genres, setGenres] = useState<GenreUI[]>([])
    //編集前のタグ
    const [oldGenres, setOldGenres] = useState<GenreUI[]>([])
    const loadGenres = async () => {
        try {
            const genres = await getGenres()
            const genreUIs = genres.map((genre) => {
                const genreUI = {
                    ...genre,
                    isSelected: false,
                }
                //userloopに登録済みのタグかチェック
                if (songGenres.find((elem) => elem.id === genre.id))
                    genreUI.isSelected = true
                return genreUI
            })
            setGenres(genreUIs)
            setOldGenres(lo.cloneDeep(genreUIs))
        } catch (e) {
            console.log(e)
        }
    }
    const [nameInput, setNameInput] = useState('')
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value)
    }
    const select = (index: number) => {
        const newGenres = [...genres]
        //反転
        newGenres[index].isSelected = !newGenres[index].isSelected
        setGenres(newGenres)
    }
    const append = (e: React.FormEvent) => {
        e.preventDefault()
        if (nameInput === '') return
        //同じ名前のタグは登録不可
        if (genres.find((genre) => genre.name === nameInput)) return
        const newGenre: GenreUI = {
            userId: user && user.userId ? user.userId : 0,
            name: nameInput,
            sortOrder: genres.length + 1,
            isSelected: false,
        }
        const newGenres = [...genres, newGenre]
        setGenres(newGenres)
        setNameInput('')
    }
    const remove = (index: number) => {
        const newGenres = [...genres]
        newGenres.splice(index, 1)
        setGenres(newGenres)
    }

    const save = async () => {
        let newGenres: GenreUI[] = []
        if (isGenresChanged()) {
            //タグを保存
            try {
                const res = await saveGenres(genres)
                //idがついて返ってくるので、genresに反映させる
                newGenres = genres.map((genre) => {
                    const resGenre = res.find(
                        (genre_res) => genre_res.name === genre.name
                    )
                    genre.id = resGenre!.id
                    genre.userId = resGenre!.userId
                    return genre
                })
                setGenres(newGenres)
            } catch (e) {
                console.log(e)
                closeModal()
            }
        }

        //userSongの更新
        const selected = genres.filter((genre) => genre.isSelected)
        console.log('@@@selected=', selected)
        onGenreUpdate(selected)
        closeModal()
    }
    const cancel = () => {
        closeModal()
    }
    const isChanged = (): boolean => {
        return !lo.isEqual(oldGenres, genres)
    }
    //タグが変化したかどうか(isSelectedを考慮しないver)
    const isGenresChanged = (): boolean => {
        const old = oldGenres.map((genre) => {
            return { ...genre, isSelected: false }
        })
        const New = genres.map((genre) => {
            return { ...genre, isSelected: false }
        })
        return !lo.isEqual(old, New)
    }
    return (
        <div>
            <h2>ジャンル編集</h2>
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
                {genres.map((genre, index) => {
                    const bgColor = genre.isSelected
                        ? 'bg-sky-500'
                        : 'bg-sky-300'
                    return (
                        <div key={index}>
                            <Button
                                bgColor={bgColor}
                                onClick={() => select(index)}
                                key={'usergenre' + index.toString()}
                            >
                                {genre.name}
                            </Button>
                            <Button
                                bgColor="bg-red-400"
                                onClick={() => remove(index)}
                                key={'usergenrex' + index.toString()}
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

export default GenreModal
