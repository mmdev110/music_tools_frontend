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

type Audio = {
    name: string
    url: string
}
const DefaultChordNames: string[] = [
    'CM7',
    'Am7',
    'Dm7',
    'G7',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
]
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
const sectionInit: UserSongSection = {
    section: '',
    progressions: DefaultChordNames,
    progressionsCsv: '',
    key: 0,
    scale: TERMS.MAJOR,
    bpm: 0,
    memo: '',
    audioPlaybackRange: {
        start: 0,
        end: 0,
    },
    midi: null,
    sortOrder: 0,
}
const songInit: UserSong = {
    title: '',
    artist: '',
    sections: [lo.clone(sectionInit)],
    memo: '',
    audio: null,
    tags: [],
    genres: [],
}
const defaultDrawerHeight = 240
const minDrawerHeight = 50
const maxDrawerHeight = 1000
//Modal.setAppElement('#root')
const Builder = () => {
    let { userSongId } = useParams()
    const user = useContext(UserContext)

    //編集中のsong
    const [userSong, setUserSong] = useState<UserSong>(songInit)
    //参照用のsong
    const [songs, setSongs] = useState<UserSong[]>([])
    //タグ
    const [allTags, setAllTags] = useState<Tag[]>([])
    //ジャンル
    const [allGenres, setAllGenres] = useState<Genre[]>([])

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
            console.log(data)
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
            console.log('effect')
            loadSongs({})
            loadAllTags()
            loadAllGenres()
        }
    }, [user])

    const test = () => {
        console.log(user)
    }
    const [mediaRange, setMediaRange] = useState<AudioRange>({
        start: 0,
        end: 0,
    })
    const [audio, setAudio] = useState<Audio>({ name: '', url: '' })
    const [toggleAudioFlag, setToggleAudioFlag] = useState(false) //このstateを変化させることで再生停止を切り替える
    const play = (song: UserSong) => {
        console.log('play')
        console.log(song)
        const userAudio = song.audio
        if (!userAudio?.url.get) return
        setAudio({
            name: userAudio.name,
            url: userAudio.url.get,
        })
        setMediaRange({
            //listページではrange無効
            start: 0,
            end: 0,
        })
        setToggleAudioFlag(!toggleAudioFlag)
    }

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const tmpList = ['song1', 'song2', 'song3']

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

                    {songs.length ? (
                        songs.map((song) => {
                            return (
                                <SongSummary
                                    key={`song${song.id!.toString()}`}
                                    song={song}
                                    onInfoClick={() => {}}
                                    onPlayButtonClick={play}
                                    onClickX={() => {}}
                                    menuItems={[]}
                                    viewType="overview"
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
                        toggle={toggleAudioFlag}
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
