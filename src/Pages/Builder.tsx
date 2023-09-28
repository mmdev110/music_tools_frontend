import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import AudioPlayer from 'Components/AudioPlayer'
import SearchField from 'Components/SearchField'
import Drawer from '@mui/material/Drawer'
import {
    Tag,
    Genre,
    AudioRange,
    UserSongSection,
    UserSongSearchCondition,
    ViewType,
} from 'types'
import { UserSong } from 'types'
import { getUserSongs, getTags, getGenres } from 'API/request'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'
import Song from 'Components/Song'
import SongSummary from 'Components/SongSummary'
import { songInit } from 'config/front'

type Audio = {
    name: string
    url: string
}

const ModalStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
}
const defaultDrawerHeight = 240
const minDrawerHeight = 50
const maxDrawerHeight = 1000

const InitialViewTypes: ViewType[] = [
    { name: 'overview', sortOrder: 0 },
    { name: 'chords', sortOrder: 0 },
    { name: 'memo', sortOrder: 0 },
]
const SearchConditionInit: UserSongSearchCondition = {
    userIds: [0],
    tagIds: [],
    genreIds: [],
    sectionName: '',
    orderBy: 'created_at',
    ascending: true,
}
//Modal.setAppElement('#root')
const Builder = () => {
    let { userSongId } = useParams()
    const user = useContext(UserContext)

    //編集中のsong
    const [userSong, setUserSong] = useState<UserSong>(
        structuredClone(songInit)
    )
    //参照用のsong
    const [songs, setSongs] = useState<UserSong[]>([])
    //タグ
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    //ジャンル
    const [allGenres, setAllGenres] = useState<Genre[]>([])
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])
    //リストの表示切り替え
    const [viewTypes, setViewTypes] = useState<ViewType[]>(InitialViewTypes)
    const [selectedViewTypes, setSelectedViewTypes] = useState<ViewType[]>([
        InitialViewTypes[0],
    ])

    const onSectionChange = (index: number, newSection: UserSongSection) => {
        //console.log('@@@onsectionchange')
        const sections = [...userSong.sections]
        sections[index] = newSection
        //console.log(sections)
        setUserSong({ ...userSong, sections })
    }
    const onSongChange = (newSong: UserSong) => {
        setUserSong({ ...newSong })
    }

    const loadSongs = async (condition: UserSongSearchCondition) => {
        try {
            const data = await getUserSongs(condition)
            if (data) setSongs(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllTags = async () => {
        try {
            const res = await getTags()
            setAllTags(res)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllGenres = async () => {
        try {
            const res = await getGenres()

            setAllGenres(res)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        if (user) {
            const searchCond = structuredClone(SearchConditionInit)
            searchCond.userIds = [user!.userId]
            loadSongs(searchCond)
            loadAllTags()
            loadAllGenres()
        }
    }, [user])

    const test = () => {
        console.log(selectedViewTypes)
        console.log(selectedTags)
        console.log(selectedGenres)
    }
    const [mediaRange, setMediaRange] = useState({
        start: 0,
        end: 0,
    })
    const [audio, setAudio] = useState<Audio>({ name: '', url: '' })
    const [isPlayingAudio, setIsPlayingAudio] = useState(false) //このstateを変化させることで再生停止を切り替える
    const play = (song: UserSong, range: AudioRange) => {
        const userAudio = song.audio
        if (!userAudio) return
        const audioChanged = audio.url !== userAudio.url.get
        const rangeArg = {
            start: range.start,
            end: range.end,
        }
        const rangeChanged = !lo.isEqual(mediaRange, rangeArg)
        setAudio({
            name: userAudio.name,
            url: userAudio.url.get,
        })
        setMediaRange(range)
        //変更があれば再生、変更がなければ再生停止を切り替え
        const newFlag = audioChanged || rangeChanged ? true : !isPlayingAudio
        setIsPlayingAudio(newFlag)
    }

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const [drawerHeight, setDrawerHeight] = React.useState(defaultDrawerHeight)
    const handleMouseDown = () => {
        document.addEventListener('mouseup', handleMouseUp, true)
        document.addEventListener('mousemove', handleMouseMove, true)
    }

    const handleMouseUp = () => {
        document.removeEventListener('mouseup', handleMouseUp, true)
        document.removeEventListener('mousemove', handleMouseMove, true)
    }

    const handleMouseMove = useCallback((e: any) => {
        const newHeight =
            document.body.offsetHeight - (e.clientY - document.body.offsetTop)
        if (newHeight > minDrawerHeight && newHeight < maxDrawerHeight) {
            setDrawerHeight(newHeight)
        }
    }, [])
    return (
        <BasicPage>
            <div className="text-2xl">Song Builder</div>
            {process.env.REACT_APP_ENV === 'local' ? (
                <Button onClick={test}>test</Button>
            ) : null}
            <React.Fragment>
                <div className="fixed">
                    <Button onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                        Open Songs
                    </Button>
                </div>

                <Drawer
                    anchor={'bottom'}
                    open={isDrawerOpen}
                    //hideBackdrop={true}
                    variant="persistent"
                    onClose={() => setIsDrawerOpen(false)}
                    PaperProps={{ style: { height: drawerHeight } }}
                >
                    <div
                        onMouseDown={(e) => handleMouseDown()}
                        className="absolute h-1.5 w-full cursor-ns-resize bg-black"
                    />
                    <div className="mt-4" />
                    <SearchField
                        viewTypes={viewTypes}
                        selectedViewTypes={selectedViewTypes}
                        onViewTypeChange={(newState) =>
                            setSelectedViewTypes(newState)
                        }
                        tags={allTags}
                        selectedTags={selectedTags}
                        genres={allGenres}
                        selectedGenres={selectedGenres}
                        onTagsChange={(newTags) => setSelectedTags(newTags)}
                        onGenresChange={(newGenres) =>
                            setSelectedGenres(newGenres)
                        }
                    />
                    {songs.length ? (
                        songs.map((song) => {
                            return (
                                <SongSummary
                                    key={`song${song.id!.toString()}`}
                                    song={song}
                                    onPlayButtonClick={play}
                                    onClickX={() => {}}
                                    viewType={selectedViewTypes[0]}
                                />
                            )
                        })
                    ) : (
                        <div>NO LOOPS. LET'S CREATE ONE!!</div>
                    )}
                </Drawer>
            </React.Fragment>
            {audio.url !== '' ? (
                <div className="pt-4">
                    <AudioPlayer
                        audioUrl={audio.url || ''}
                        audioName={audio.name || ''}
                        isHLS={true}
                        dropDisabled={true}
                        mini={true}
                        range={mediaRange}
                        toggle={isPlayingAudio}
                    />
                </div>
            ) : null}

            <Song
                song={userSong}
                showAudio={false}
                showGenres={false}
                showTags={false}
                showMidi={false}
                onSongChange={onSongChange}
                onSectionChange={onSectionChange}
            />
        </BasicPage>
    )
}

export default Builder
