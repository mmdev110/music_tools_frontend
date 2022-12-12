import React, { useEffect, useState } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    useNavigate,
} from 'react-router-dom'
import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import { UserLoopInput } from 'types'
import * as Utils from 'utils'
//import './App.css'
import { getUserLoops } from 'API/request'
import { isAxiosError } from 'axios'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'
import LoopSummary from 'Components/LoopSummary'
import AudioPlayer from 'Components/AudioPlayer'

type Audio = {
    name: string
    url: string
}
const List = () => {
    const navigate = useNavigate()
    const [userLoops, setUserLoops] = useState<Types.UserLoopInput[]>([])
    const load = async () => {
        try {
            const data = await getUserLoops()
            if (data) setUserLoops(data)
            console.log(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        load()
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
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>YOUR LOOPS</div>
                <div>
                    <Button onClick={navigateNew}>New</Button>
                </div>
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
