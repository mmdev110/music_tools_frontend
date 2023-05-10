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
import { Tag, ScaleFormType, AudioRange } from 'types'
import { UserLoopInput } from 'types'
import { getFromS3, getUserLoop, saveUserLoop, uploadToS3 } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import LoopSummary from 'Components/LoopSummary'
import { scryRenderedDOMComponentsWithClass } from 'react-dom/test-utils'
import { classicNameResolver, textChangeRangeIsUnchanged } from 'typescript'
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
const loopInit: UserLoopInput = {
    name: '',
    artist: '',
    progressions: DefaultChordNames,
    key: -1,
    scale: '',
    bpm: -1,
    section: '',
    memo: '',
    memoBass: '',
    memoLead: '',
    memoChord: '',
    memoRhythm: '',
    memoTransition: '',
    userLoopAudio: {
        name: '',
        url: {
            get: '',
            put: '',
        },
        range: { start: 0, end: 0 },
    },
    userLoopMidi: {
        name: '',
        url: {
            get: '',
            put: '',
        },
        midiRoots: [],
    },
    userLoopTags: [],
}
Modal.setAppElement('#root')
const Detail = () => {
    let { userLoopId } = useParams()
    let { state } = useLocation()
    console.log('@@@@@state')
    console.log(state)
    const user = useContext(UserContext)

    //編集前の状態
    const [oldState, setOldState] = useState<UserLoopInput>(loopInit)
    //編集中の状態
    const [userLoopInput, setUserLoopInput] = useState<UserLoopInput>(loopInit)

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

        setUserLoopInput({
            ...userLoopInput,
            userLoopAudio: {
                name: file.name,
                url: { get: URL.createObjectURL(file), put: '' },
                range: { start: 0, end: 0 },
            },
        })
    }

    //MidiFile
    const [midiFile, setMidiFile] = useState<File>()
    const onDropMidi = (acceptedFiles: File[]) => {
        setMidiFile(acceptedFiles[0])
    }
    //rootIndexes
    const [midiRoots, setMidiRoots] = useState<number[]>([])
    const onMidiRootsChange = (rootIndexes: number[]) => {
        setMidiRoots(rootIndexes)
    }

    const save = async () => {
        console.log('save')
        //保存
        let userLoopResponse: UserLoopInput | undefined
        try {
            userLoopResponse = await saveUserLoop(userLoopInput, userLoopId!)
            console.log(userLoopResponse)
            if (userLoopResponse) setUserLoopInput(userLoopResponse)
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
        //s3へのアップロード
        if (userLoopResponse) {
            try {
                const audio = userLoopResponse.userLoopAudio
                console.log(droppedFile)
                if (audio.url.put && droppedFile) {
                    console.log('upload audio')
                    const response = await uploadToS3(
                        audio.url.put,
                        droppedFile
                    )
                    console.log(response)
                }
                const midi = userLoopResponse.userLoopMidi
                //TODO:常にアップロードされるので対策考える
                //S3から拾ったものとドロップされたもの両方midiFileに格納してしまうため
                if (midi.url.put && midiFile) {
                    console.log('upload midi')
                    await uploadToS3(midi.url.put, midiFile)
                }
            } catch (err) {
                if (isAxiosError(err)) console.log(err)
            }
            await load(userLoopResponse.id!)
        }
    }
    const load = async (id: number) => {
        const response = await getUserLoop(id)
        console.log('@@URI', response.userLoopInput)
        //編集前の状態を保存しておく
        setOldState(response.userLoopInput)
        setUserLoopInput(response.userLoopInput)

        setScaleForm({
            root: response.userLoopInput.key,
            scale: response.userLoopInput.scale,
            transposeRoot: null,
        })
        const audio = response.userLoopInput.userLoopAudio
        const midi = response.userLoopInput.userLoopMidi
        //audio, midiのロード
        try {
            if (audio.url.get) {
                setIsHLS(true)
            }
            if (midi.url.get) {
                const response = await getFromS3(midi.url.get)
                const blob = await response.blob()
                const file = new File([blob], midi.name)
                setMidiFile(file)
            }
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        const id_int = parseInt(userLoopId!)
        const isNumber = !isNaN(id_int)
        if (isNumber) {
            //edit/:userLoopIdのとき
            load(id_int)
        } else if (state && state.id) {
            //edit/newで設定をコピーして新規作成する場合
            load(state.id)
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
        return !lo.isEqual(oldState, userLoopInput)
        /*
        const isAudioChanged = !!droppedFile
        const isRangeChanged = !lo.isEqual(oldState.userLoopAudio.range!, range)
        let isMidiChanged = false
        if (midiFile)
            isMidiChanged = midiFile.name !== oldState.userLoopMidi.name
        console.log(progressions)
        console.log(oldState.progressions)
        console.log('name change :', name !== oldState.name)
        console.log(
            'progressions change: ',
            !lo.isEqual(progressions, oldState.progressions)
        )
        console.log(
            'tags change :',
            tags,
            oldState.userLoopTags,
            !lo.isEqual(tags, oldState.userLoopTags)
        )
        console.log('root change :', scaleForm.root !== oldState.key)

        console.log(
            'scale change :',
            scaleForm.scale,
            oldState.scale,
            scaleForm.scale !== oldState.scale
        )

        console.log('memo change :', memo !== oldState.memo)

        console.log('audio change :', isAudioChanged)
        console.log('midi change :', isMidiChanged)

        return (
            name !== oldState.name ||
            !lo.isEqual(progressions, oldState.progressions) ||
            !lo.isEqual(tags, oldState.userLoopTags) ||
            scaleForm.root !== oldState.key ||
            scaleForm.scale !== oldState.scale ||
            memo !== oldState.memo ||
            isAudioChanged ||
            isMidiChanged ||
            isRangeChanged
        )
        */
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
                    memo={userLoopInput.name}
                    onChange={(str) => {
                        setUserLoopInput({ ...userLoopInput, name: str })
                    }}
                />
                <div className="text-2xl">artist</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={userLoopInput.artist}
                    onChange={(str) => {
                        setUserLoopInput({ ...userLoopInput, artist: str })
                    }}
                />
                <div className="text-2xl">bpm</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={userLoopInput.bpm.toString()}
                    onChange={(str) => {
                        if (!isNaN(Number(str)))
                            setUserLoopInput({
                                ...userLoopInput,
                                bpm: Number(str),
                            })
                    }}
                />
                <div className="text-2xl">section</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={userLoopInput.section}
                    onChange={(str) => {
                        setUserLoopInput({ ...userLoopInput, section: str })
                    }}
                />
                {user ? <Button onClick={showTagModal}>タグ編集</Button> : null}

                <div className="flex flex-row gap-x-4">
                    {userLoopInput.userLoopTags.map((tag) => (
                        <Button>{tag.name}</Button>
                    ))}
                </div>
                <div className="text-2xl">AudioPlayer</div>
                <div>
                    mp3, wav, m4aファイルをドロップできます。
                    <br />
                    start, endでループ範囲を指定できます。
                </div>
                <MediaRangeForm
                    range={userLoopInput.userLoopAudio.range}
                    onChange={(newRange) => {
                        const audio = userLoopInput.userLoopAudio
                        setUserLoopInput({
                            ...userLoopInput,
                            userLoopAudio: { ...audio, range: newRange },
                        })
                    }}
                />
                <AudioPlayer
                    droppedFile={droppedFile}
                    audioUrl={userLoopInput.userLoopAudio.url.get}
                    audioName={userLoopInput.userLoopAudio.name}
                    onDrop={onDropAudio}
                    isHLS={isHLS}
                    dropDisabled={false}
                    mini={false}
                    range={userLoopInput.userLoopAudio.range}
                />
                <div className="text-2xl">Memo</div>
                <Memo
                    className="h-1/2 w-full border-2 border-sky-400"
                    memo={userLoopInput.memo}
                    onChange={(str) =>
                        setUserLoopInput({ ...userLoopInput, memo: str })
                    }
                />
                <Button
                    width="w-fit"
                    onClick={() => {
                        setShowAdvancedMemo(!showAdvancedMemo)
                    }}
                >
                    メモ詳細{showAdvancedMemo ? '(隠す)' : null}
                </Button>
                {showAdvancedMemo ? (
                    <div>
                        <div>コード</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={userLoopInput.memoChord}
                            onChange={(str) =>
                                setUserLoopInput({
                                    ...userLoopInput,
                                    memoChord: str,
                                })
                            }
                        />
                        <div>リード</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={userLoopInput.memoLead}
                            onChange={(str) =>
                                setUserLoopInput({
                                    ...userLoopInput,
                                    memoLead: str,
                                })
                            }
                        />
                        <div>ベース</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={userLoopInput.memoBass}
                            onChange={(str) =>
                                setUserLoopInput({
                                    ...userLoopInput,
                                    memoBass: str,
                                })
                            }
                        />
                        <div>リズム</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={userLoopInput.memoRhythm}
                            onChange={(str) =>
                                setUserLoopInput({
                                    ...userLoopInput,
                                    memoRhythm: str,
                                })
                            }
                        />
                        <div>パート間の繋ぎ</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={userLoopInput.memoTransition}
                            onChange={(str) =>
                                setUserLoopInput({
                                    ...userLoopInput,
                                    memoTransition: str,
                                })
                            }
                        />
                    </div>
                ) : null}
                <div className="text-2xl">Scales</div>
                <ScaleForm
                    scaleForm={scaleForm}
                    onChange={onScaleFormChange}
                    showTranspose={true}
                />
                <ScaleDisplay scaleForm={scaleForm} />
                <div className="text-2xl">Chord Display</div>
                <ChordDisplay
                    progressionNames={userLoopInput.progressions}
                    onProgressionsChange={(progressions) =>
                        setUserLoopInput({
                            ...userLoopInput,
                            progressions: progressions,
                        })
                    }
                    scaleForm={scaleForm}
                    onNoteIntervalsClick={showChordModal}
                />
                <div className="text-2xl">MIDI Analyzer</div>

                <SequenceAnalyzer
                    scaleForm={scaleForm}
                    onDrop={onDropMidi}
                    midiFile={midiFile}
                    rootIndexes={midiRoots}
                    onMidiNoteClick={onMidiRootsChange}
                />
                <div className="text-2xl">Intervals</div>

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
                        setUserLoopInput({
                            ...userLoopInput,
                            userLoopTags: tags,
                        })
                    }
                    closeModal={closeTagModal}
                    loopTags={userLoopInput.userLoopTags}
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
