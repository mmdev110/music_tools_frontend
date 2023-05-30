import React, { useEffect, useState, useContext } from 'react'
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
import ChordModal from 'Pages/Modals/Chord'
import Memo from 'Components/Memo'
import MediaRangeForm from 'Components/MediaRangeForm'
import { TERMS } from 'config/music'
import { Tag, ScaleFormType, AudioRange, UserSongSection } from 'types'
import { UserSong } from 'types'
import { getFromS3, getUserSong, saveUserSong, uploadToS3 } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'

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
const songInit: UserSong = {
    title: '',
    artist: '',
    sections: [
        {
            section: '',
            progressions: DefaultChordNames,
            progressionsCSV: '',
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
        },
    ],
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

    const [scaleForm, setScaleForm] = useState<ScaleFormType>({
        root: 0,
        scale: TERMS.MAJOR,
        transposeRoot: null,
    })
    const onScaleFormChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.target.name
        let value = event.target.value
        let newScaleForm: ScaleFormType
        if (name === 'root') {
            newScaleForm = { ...scaleForm, root: parseInt(value) }
        } else {
            newScaleForm = { ...scaleForm, [name]: value }
        }
        setScaleForm(newScaleForm)
    }

    const [showAdvancedMemo, setShowAdvancedMemo] = useState(false)
    //audio, droppedFile
    const [droppedFile, setDroppedFile] = useState<File>()
    const [isHLS, setIsHLS] = useState(false)

    const onDropAudio = (acceptedFiles: File[]) => {
        const file: File = acceptedFiles[0]
        setDroppedFile(file)
        console.log(file)
        setIsHLS(false)

        setUserSong({
            ...userSong,
            audio: {
                name: file.name,
                url: { get: URL.createObjectURL(file), put: '' },
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
                console.log(droppedFile)
                if (audio && audio.url.put && droppedFile) {
                    //s3へのアップロード
                    const response = await uploadToS3(
                        audio.url.put,
                        droppedFile
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
            await load(response.id!)
        }
    }
    const load = async (id: number) => {
        const response = await getUserSong(id)
        console.log('@@URI', response)
        //idを消す
        response.id = 0
        if (response.audio) response.audio.id = 0
        //if (response.userLoopMidi)
        //    response.userLoopMidi.id = 0
        //編集前の状態を保存しておく
        setOldState(response)
        setUserSong(response)

        const audio = response.audio
        //audio, midiのロード
        try {
            if (audio && audio.url.get) {
                setIsHLS(true)
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

    //tag modal
    const [tagModalIsOpen, setTagIsOpen] = React.useState(false)
    const showTagModal = () => {
        setTagIsOpen(true)
    }

    const closeTagModal = () => {
        setTagIsOpen(false)
    }
    const [chordModalIsOpen, setChordIsOpen] = React.useState(false)
    const [noteIntervals, setNoteIntervals] = React.useState<NoteIntervals>([])
    const showChordModal = (info: NoteIntervals) => {
        setNoteIntervals(info)
        setChordIsOpen(true)
    }

    const closeChordModal = () => {
        setNoteIntervals([])
        setChordIsOpen(false)
    }

    const isChanged = (): boolean => {
        console.log('@@@checkChanged')
        console.log(oldState)
        return !lo.isEqual(oldState, userSong)
    }
    const onSectionChange = (index: number, newSection: UserSongSection) => {
        const sections = userSong.sections
        const newSections = [...sections]
        newSections[index] = newSection
        setUserSong({ ...userSong, sections: newSections })
    }

    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                {user ? (
                    <div>
                        <Button disabled={!isChanged()} onClick={save}>
                            save
                        </Button>
                    </div>
                ) : null}

                <div className="text-2xl">title</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={userSong.title}
                    onChange={(str) => {
                        setUserSong({ ...userSong, title: str })
                    }}
                />
                <div className="text-2xl">artist</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={userSong.artist}
                    onChange={(str) => {
                        setUserSong({ ...userSong, artist: str })
                    }}
                />
                {user ? <Button onClick={showTagModal}>タグ編集</Button> : null}

                <div className="flex flex-row gap-x-4">
                    {userSong.tags.map((tag) => (
                        <Button>{tag.name}</Button>
                    ))}
                </div>
                <div className="text-2xl">AudioPlayer</div>
                <div>
                    mp3, wav, m4aファイルをドロップできます。
                    <br />
                    start, endでループ範囲を指定できます。
                </div>
                <AudioPlayer
                    droppedFile={droppedFile}
                    audioUrl={userSong.audio?.url.get || ''}
                    audioName={userSong.audio?.name || ''}
                    onDrop={onDropAudio}
                    isHLS={isHLS}
                    dropDisabled={false}
                    mini={false}
                    range={{
                        start: 0,
                        end: 0,
                    }}
                />
                <div className="text-2xl">Memo</div>
                <Memo
                    className="h-1/2 w-full border-2 border-sky-400"
                    memo={userSong.memo}
                    onChange={(str) => setUserSong({ ...userSong, memo: str })}
                />
                <div className="text-2xl">Intervals</div>
                {userSong.sections.map((section, index) => (
                    <Section
                        sectionIndex={index}
                        section={section}
                        onDropMidi={onDropMidi}
                        midiFile={null}
                        onSectionChange={onSectionChange}
                    />
                ))}

                <Intervals />
                <div className="text-2xl">Modes</div>

                <Modes scaleForm={scaleForm} />

                <div className="text-2xl">MIDI Monitor</div>

                <MidiMonitorDescription />
                <MidiMonitor />
                <div style={{ marginTop: '10em' }}></div>
            </div>
            {/* tag編集*/}
            <Modal
                isOpen={tagModalIsOpen}
                //onAfterOpen={afterOpenModal}
                onRequestClose={closeTagModal}
                style={ModalStyle}
                contentLabel="Example Modal"
            >
                <TagModal
                    onTagUpdate={(tags) =>
                        setUserSong({
                            ...userSong,
                            tags: tags,
                        })
                    }
                    closeModal={closeTagModal}
                    loopTags={userSong.tags}
                />
            </Modal>
            {/* コード詳細*/}
            <Modal
                isOpen={chordModalIsOpen}
                //onAfterOpen={afterOpenModal}
                style={ModalStyle}
                onRequestClose={closeChordModal}
                contentLabel="Example Modal"
            >
                <ChordModal
                    closeModal={closeChordModal}
                    noteIntervals={noteIntervals}
                />
            </Modal>
        </BasicPage>
    )
}

export default Detail
