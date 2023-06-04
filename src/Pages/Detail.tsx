import React, {
    useEffect,
    useState,
    useContext,
    useRef,
    SyntheticEvent,
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
import { TERMS } from 'config/music'
import {
    Tag,
    ScaleFormType,
    AudioRange,
    UserSongSection,
    AudioState,
} from 'types'
import { UserSong } from 'types'
import { getFromS3, getUserSong, saveUserSong, uploadToS3 } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'
import Song from 'Components/Song'

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
Modal.setAppElement('#root')
const Detail = () => {
    let { userSongId } = useParams()
    const user = useContext(UserContext)

    //編集前の状態
    const [oldState, setOldState] = useState<UserSong>(songInit)
    //編集中の状態
    const [userSong, setUserSong] = useState<UserSong>(songInit)

    //audio, droppedAudio
    const [droppedAudio, setDroppedAudio] = useState<File>()

    const onDropAudio = (acceptedFiles: File[]) => {
        const file: File = acceptedFiles[0]
        setDroppedAudio(file)
        //URL.createObjectURL(file)
        setUserSong({
            ...userSong,
            audio: {
                name: file.name,
                url: { get: '', put: '' },
            },
        })
    }

    //MidiFile
    const [midiFiles, setMidiFiles] = useState<File[]>([])
    const onDropMidi = (sectionIndex: number, file: File) => {
        const newFiles = [...midiFiles]
        newFiles[sectionIndex] = file
        setMidiFiles(newFiles)
    }

    const save = async () => {
        console.log('@@@@save')
        console.log(userSong)
        //保存
        let response: UserSong | undefined
        try {
            response = await saveUserSong(userSong, userSongId!)
            console.log(response)
            if (response) setUserSong(response)
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
        if (response) {
            try {
                const audio = response.audio
                console.log(droppedAudio)
                console.log(audio)
                if (audio && audio.url.put && droppedAudio) {
                    //s3へのアップロード
                    const response = await uploadToS3(
                        audio.url.put,
                        droppedAudio
                    )
                    console.log(response)
                }
                //midiアップロード
                //const midi = response.userLoopMidi
                ////TODO:常にアップロードされるので対策考える
                ////S3から拾ったものとドロップされたもの両方midiFileに格納してしまうため
                //if (midi && midi.url.put && midiFile) {
                //    console.log('upload midi')
                //    await uploadToS3(midi.url.put, midiFile)
                //}
            } catch (err) {
                if (isAxiosError(err)) console.log(err)
            }
            //await load(response.id!)
        }
    }
    const load = async (id: number) => {
        const response = await getUserSong(id)
        console.log('@@URI', response)
        //編集前の状態を保存しておく
        setOldState(response)
        setUserSong(response)

        const audio = response.audio
        //audio, midiのロード
        try {
            if (audio && audio.url.get) {
                console.log(audio.url.get)
            }
            for (let i = 0; i < response.sections.length; i++) {
                const midi = response.sections[i].midi
                if (midi && midi.url.get) {
                    const response = await getFromS3(midi.url.get)
                    const blob = await response.blob()
                    const file = new File([blob], midi.name)
                    onDropMidi(i, file)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        const id_int = parseInt(userSongId!)
        const isNumber = !isNaN(id_int)
        if (isNumber) {
            //edit/:userSongIdのとき
            load(id_int)
        }
    }, [])

    const isChanged = (): boolean => {
        console.log('@@@checkChanged')
        return !lo.isEqual(oldState, userSong)
    }

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

    return (
        <BasicPage>
            <div className="text-2xl">Song Editor</div>
            {user ? (
                <div>
                    <Button disabled={!isChanged()} onClick={save}>
                        save
                    </Button>
                </div>
            ) : null}
            <Song
                user={user || undefined}
                song={userSong}
                showAudio={true}
                showGenres={true}
                showTags={true}
                showMidi={true}
                onSongChange={onSongChange}
                onSectionChange={onSectionChange}
                onDropAudio={onDropAudio}
                droppedAudio={droppedAudio}
            />
        </BasicPage>
    )
}

export default Detail
