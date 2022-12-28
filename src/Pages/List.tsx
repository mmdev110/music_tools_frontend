import React, { useEffect, useState } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    useNavigate,
} from 'react-router-dom'
import { TERMS } from 'config/music'
import Detail from 'Pages/Detail'
import * as Types from 'types/music'
import { UserLoopInput, Tag, UserLoopSearchCondition } from 'types/'
import * as Utils from 'utils/music'
//import './App.css'
import { getUserLoops, getTags } from 'API/request'
import { isAxiosError } from 'axios'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'
import LoopSummary from 'Components/LoopSummary'
import AudioPlayer from 'Components/AudioPlayer'

type Audio = {
    name: string
    url: string
}
type TagUI = Tag & {
    isSelected: boolean
}
const List = () => {
    const navigate = useNavigate()
    const [userLoops, setUserLoops] = useState<UserLoopInput[]>([])
    const [allTags, setAllTags] = useState<TagUI[]>([])
    const [isFiltering, setIsFiltering] = useState(false)
    const selectTag = async (index: number) => {
        const newTags = [...allTags]
        newTags[index].isSelected = !newTags[index].isSelected
        setAllTags(newTags)
        //loopsを再検索
        const selected = newTags.filter((tag) => tag.isSelected)
        setIsFiltering(selected.length > 0)
        const selectedTagIds = selected.map((tag) => tag.id!)
        await loadLoops({ tagIds: selectedTagIds })
    }
    const loadLoops = async (condition: UserLoopSearchCondition) => {
        try {
            const data = await getUserLoops(condition)
            if (data) setUserLoops(data)
            //console.log(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllTags = async () => {
        try {
            const responseTags = await getTags()

            const t: TagUI[] = responseTags.map((tag) => {
                return {
                    ...tag,
                    isSelected: false,
                }
            })
            setAllTags(t)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        loadLoops({})
        loadAllTags()
    }, [])
    const navigateNew = () => {
        navigate('/edit/new')
    }
    const move = (input: UserLoopInput) => {
        navigate(`/edit/${input.id}`)
    }
    const play = (input: UserLoopInput) => {
        console.log('play')
        console.log(input)
        setAudio({
            name: input.userLoopAudio.name,
            url: input.userLoopAudio.url.get,
        })
    }
    const [audio, setAudio] = useState<Audio>({ url: '', name: '' })
    const renderTags = () => {
        const filteredTags: TagUI[] = filterTagsFromCurrentLoops()
        console.log('@@@filteredtags', filteredTags)
        return (
            <div className="flex flex-row gap-x-1">
                {filteredTags.map((tag, index) => (
                    <Button
                        key={'tagbtn' + index.toString()}
                        bgColor={tag.isSelected ? 'bg-sky-500' : 'bg-sky-300'}
                        onClick={() => selectTag(index)}
                    >
                        {tag.name}
                    </Button>
                ))}
            </div>
        )
    }
    const filterTagsFromCurrentLoops = (): TagUI[] => {
        //alltagsの中から、現在のuserloopsに使われているものを探す
        return allTags.filter((tag) => {
            console.log(tag.name)
            for (const loop of userLoops) {
                const tags = loop.userLoopTags
                console.log(tags)
                const found = tags.find((ult) => ult.id === tag.id)
                if (found) return true
            }
            return false
        })
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>YOUR LOOPS</div>
                <div>
                    <Button onClick={navigateNew}>New</Button>
                </div>
                {renderTags()}
                <div className="flex flex-col gap-y-5">
                    {userLoops.length ? (
                        userLoops.map((userLoop) => {
                            return (
                                <LoopSummary
                                    key={`userLoop${userLoop.id!.toString()}`}
                                    input={userLoop}
                                    onInfoClick={move}
                                    onPlayButtonClick={play}
                                />
                            )
                        })
                    ) : (
                        <div>NO LOOPS. LET'S CREATE ONE!!</div>
                    )}
                </div>
            </div>
            {audio.url !== '' && (
                <AudioPlayer
                    dropDisabled={true}
                    audioUrl={audio.url}
                    mini={true}
                    autoPlay
                />
            )}
        </BasicPage>
    )
}

export default List
