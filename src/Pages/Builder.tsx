import React, {
    useEffect,
    useState,
    useContext,
    useRef,
    SyntheticEvent,
    useCallback,
} from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    useParams,
    useLocation,
} from 'react-router-dom'
import Modal from 'react-modal'
import ScaleForm from 'Components/ScaleForm'
import ScaleDisplay from 'Components/ScaleDisplay'
import ChordDisplay from 'Components/ChordDisplay2'
import Intervals from 'Components/Intervals'
import Section from 'Components/Section'
import Modes from 'Components/Modes'
import SequenceAnalyzer from 'Components/SequenceAnalyzer'
import MidiMonitorDescription from 'Components/MidiMonitorDescription'
import MidiMonitor from 'Components/MidiMonitor'
import AudioPlayer from 'Components/AudioPlayer'
import TagModal from 'Pages/Modals/Tag'
import GenreModal from 'Pages/Modals/Genre'
import ChordModal from 'Pages/Modals/Chord'
import Memo from 'Components/Memo'
import MediaRangeForm from 'Components/MediaRangeForm'
import SearchField from 'Components/SearchField'
import Drawer from '@mui/material/Drawer'
import { TERMS } from 'config/music'
import {
    Tag,
    Genre,
    ScaleFormType,
    AudioRange,
    UserSongSection,
    AudioState,
    UserSongSearchCondition,
    TagUI,
} from 'types'
import { UserSong } from 'types'
import {
    getFromS3,
    getUserSong,
    saveUserSong,
    uploadToS3,
    getUserSongs,
    getTags,
    getGenres,
} from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'
import Song from 'Components/Song'
import SongSummary from 'Components/SongSummary'
import { resolve } from 'dns/promises'
import { songInit, sectionInit } from 'config/front'

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
const InitialViewTypes: TagUI[] = [
    { name: 'overview', isSelected: true },
    { name: 'chords', isSelected: false },
    { name: 'memo', isSelected: false },
]
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
    const [allTags, setAllTags] = useState<TagUI[]>([])
    //ジャンル
    const [allGenres, setAllGenres] = useState<TagUI[]>([])
    //リストの表示切り替え
    const [viewTypes, setViewTypes] = useState<TagUI[]>(InitialViewTypes)

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
            const t: TagUI[] = res.map((tag) => {
                return {
                    name: tag.name,
                    isSelected: false,
                }
            })
            setAllTags(t)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllGenres = async () => {
        try {
            const res = await getGenres()
            const t: TagUI[] = res.map((tag) => {
                return {
                    name: tag.name,
                    isSelected: false,
                }
            })
            setAllGenres(t)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        if (user) {
            console.log('effect')
            loadSongs({})
            loadAllTags()
            loadAllGenres()
        }
    }, [user])

    const test = () => {
        console.log(viewTypes)
    }
    const [mediaRange, setMediaRange] = useState<AudioRange>({
        start: 0,
        end: 0,
    })
    const [audio, setAudio] = useState<Audio>({ name: '', url: '' })
    const [isPlayingAudio, setIsPlayingAudio] = useState(false) //このstateを変化させることで再生停止を切り替える
    const play = (song: UserSong, range: AudioRange) => {
        console.log('play')
        console.log(song)
        const userAudio = song.audio
        if (!userAudio) return
        const audioChanged = audio.url !== userAudio.url.get
        const rangeChanged = !lo.isEqual(mediaRange, range)
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
            <Button onClick={test}>test</Button>
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
                        viewType={viewTypes}
                        onViewTypeChange={(newState) => setViewTypes(newState)}
                        tags={allTags}
                        genres={allGenres}
                        onTagsChange={(newTags) => setAllTags(newTags)}
                        onGenresChange={(newGenres) => setAllGenres(newGenres)}
                    />
                    {songs.length ? (
                        songs.map((song) => {
                            return (
                                <SongSummary
                                    key={`song${song.id!.toString()}`}
                                    song={song}
                                    onPlayButtonClick={play}
                                    onClickX={() => {}}
                                    viewType={
                                        viewTypes.find(
                                            (v) => v.isSelected === true
                                        )?.name || 'overview'
                                    }
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
