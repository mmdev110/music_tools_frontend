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
    BPM: -1,
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
    //name
    const [name, setName] = useState('')
    const [artist, setArtist] = useState('')
    //BPM
    const [BPM, setBPM] = useState(0)
    //section
    const [section, setSection] = useState('')

    //tags
    const [tags, setTags] = useState<Tag[]>([])
    const onTagsChange = (selectedTags: Tag[]) => {
        setTags(selectedTags)
    }
    const [progressions, setProgressions] = useState(DefaultChordNames)
    //Progressions
    const onProgressionsChange = (newInput: string[]) => {
        console.log('onProgressionsChange')
        console.log(newInput)
        setProgressions([...newInput])
    }
    //Memo
    const [memo, setMemo] = useState('')
    const [memoBass, setMemoBass] = useState('')
    const [memoLead, setMemoLead] = useState('')
    const [memoChord, setMemoChord] = useState('')
    const [memoRhythm, setMemoRhythm] = useState('')
    const [memoTransition, setMemoTransition] = useState('')

    const [showAdvancedMemo, setShowAdvancedMemo] = useState(false)
    //audio, droppedFile
    const [droppedFile, setDroppedFile] = useState<File>()
    const [audioUrl, setAudioUrl] = useState('')
    const [audioName, setAudioName] = useState('')
    const [isHLS, setIsHLS] = useState(false)
    const [range, setRange] = useState<AudioRange>({ start: 0, end: 0 })
    const onMediaRangeFormChange = (newRange: AudioRange) => {
        setRange(newRange)
    }
    const onDropAudio = (acceptedFiles: File[]) => {
        const file: File = acceptedFiles[0]
        setDroppedFile(file)
        console.log(file)
        setAudioUrl(URL.createObjectURL(file))
        setAudioName(file.name)
        setIsHLS(false)
        setRange({ start: 0, end: 0 })
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
    //編集前の状態
    const [oldState, setOldState] = useState<UserLoopInput>(loopInit)
    //編集中の状態
    const [userLoopInput, setUserLoopInput] = useState<UserLoopInput>(loopInit)

    const save = async () => {
        console.log('save')
        const input: UserLoopInput = {
            progressions: progressions,
            name: name,
            artist: artist,
            BPM: BPM,
            section: section,
            key: scaleForm.root,
            scale: scaleForm.scale,
            memo: memo,
            memoBass: memoBass,
            memoChord: memoChord,
            memoLead: memoLead,
            memoRhythm: memoRhythm,
            memoTransition: memoTransition,
            userLoopAudio: {
                name: audioName,
                url: { get: '', put: '' },
                range: range,
            },
            userLoopMidi: {
                name: midiFile ? midiFile.name : '',
                url: { get: '', put: '' },
                midiRoots: midiRoots,
            },
            userLoopTags: tags,
        }
        //保存
        let userLoopResponse: UserLoopInput | undefined
        try {
            userLoopResponse = await saveUserLoop(userLoopInput, userLoopId!)
            console.log(userLoopResponse)
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
        const { userLoopInput } = await getUserLoop(id)
        console.log('@@URI', userLoopInput)
        const audio = userLoopInput.userLoopAudio
        const midi = userLoopInput.userLoopMidi
        setScaleForm({
            root: userLoopInput.key,
            scale: userLoopInput.scale,
            transposeRoot: null,
        })
        console.log(userLoopInput)
        setProgressions([...userLoopInput.progressions])
        setTags(lo.cloneDeep(userLoopInput.userLoopTags))
        setName(userLoopInput.name)
        setArtist(userLoopInput.artist)
        setSection(userLoopInput.section)
        setBPM(userLoopInput.BPM)
        setMemo(userLoopInput.memo)
        setMemoBass(userLoopInput.memoBass)
        setMemoLead(userLoopInput.memoLead)
        setMemoRhythm(userLoopInput.memoRhythm)
        setMemoChord(userLoopInput.memoChord)
        setMemoTransition(userLoopInput.memoTransition)
        setRange(userLoopInput.userLoopAudio.range!)
        //編集前の状態を保存しておく
        setOldState(userLoopInput)
        //audio, midiのロード
        try {
            if (audio.url.get) {
                //const response = await getFromS3(s3Url.mp3)
                setAudioUrl(audio.url.get)
                setAudioName(audio.name)
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
                    memo={name}
                    onChange={(str) => {
                        setName(str)
                    }}
                />
                <div className="text-2xl">artist</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={artist}
                    onChange={(str) => {
                        setArtist(str)
                    }}
                />
                <div className="text-2xl">BPM</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={BPM.toString()}
                    onChange={(str) => {
                        if (!isNaN(Number(str))) setBPM(Number(str))
                    }}
                />
                <div className="text-2xl">section</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={section}
                    onChange={(str) => {
                        setSection(str)
                    }}
                />
                {user ? <Button onClick={showTagModal}>タグ編集</Button> : null}

                <div className="flex flex-row gap-x-4">
                    {tags.map((tag) => (
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
                    range={range}
                    onChange={onMediaRangeFormChange}
                />
                <AudioPlayer
                    droppedFile={droppedFile}
                    audioUrl={audioUrl}
                    audioName={audioName}
                    onDrop={onDropAudio}
                    isHLS={isHLS}
                    dropDisabled={false}
                    mini={false}
                    range={range}
                />
                <div className="text-2xl">Memo</div>
                <Memo
                    className="h-1/2 w-full border-2 border-sky-400"
                    memo={memo}
                    onChange={(str) => setMemo(str)}
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
                            memo={memoChord}
                            onChange={(str) => setMemoChord(str)}
                        />
                        <div>リード</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memoLead}
                            onChange={(str) => setMemoLead(str)}
                        />
                        <div>ベース</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memoBass}
                            onChange={(str) => setMemoBass(str)}
                        />
                        <div>リズム</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memoRhythm}
                            onChange={(str) => setMemoRhythm(str)}
                        />
                        <div>パート間の繋ぎ</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memoTransition}
                            onChange={(str) => setMemoTransition(str)}
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
                    progressionNames={progressions}
                    onProgressionsChange={onProgressionsChange}
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
                    onTagUpdate={onTagsChange}
                    closeModal={closeTagModal}
                    loopTags={tags}
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
