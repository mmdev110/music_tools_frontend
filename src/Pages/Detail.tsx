import React, { useEffect, useState, useContext } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
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
import { Tag, ScaleFormType, MediaRange } from 'types'
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
    id: 0,
    name: '',
    progressions: DefaultChordNames,
    key: 0,
    scale: '',
    midiRoots: [],
    memo: '',
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
    },
    userLoopTags: [],
}
Modal.setAppElement('#root')
const Detail = () => {
    let { userLoopId } = useParams()
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
    const onNameChange = (str: string) => {
        setName(str)
    }

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
    const onMemoChange = (str: string) => {
        setMemo(str)
    }
    const [showAdvancedMemo, setShowAdvancedMemo] = useState(false)
    //audio, droppedFile
    const [droppedFile, setDroppedFile] = useState<File>()
    const [audioUrl, setAudioUrl] = useState('')
    const [audioName, setAudioName] = useState('')
    const [isHLS, setIsHLS] = useState(false)
    const [range, setRange] = useState<MediaRange>({ start: 0, end: 0 })
    const onMediaRangeFormChange = (newRange: MediaRange) => {
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
    //userLoop
    const [oldLoop, setOldLoop] = useState<UserLoopInput>(loopInit)

    const save = async () => {
        console.log('save')
        const input: UserLoopInput = {
            progressions: progressions,
            name: name,
            key: scaleForm.root,
            scale: scaleForm.scale,
            midiRoots: midiRoots,
            memo: memo,
            userLoopAudio: {
                name: audioName,
                url: { get: '', put: '' },
                range: range,
            },
            userLoopMidi: {
                name: midiFile ? midiFile.name : '',
                url: { get: '', put: '' },
            },
            userLoopTags: tags,
        }
        //保存
        let userLoopResponse: UserLoopInput | undefined
        try {
            userLoopResponse = await saveUserLoop(input, userLoopId!)
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
        setMemo(userLoopInput.memo)
        setRange(userLoopInput.userLoopAudio.range!)
        //setLoop(userLoopInput)
        setOldLoop(userLoopInput)
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
        if (userLoopId) {
            const id_int = parseInt(userLoopId)
            const isNumber = !isNaN(id_int)
            if (isNumber) load(id_int)
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
        console.log(oldLoop)
        const isAudioChanged = !!droppedFile
        const isRangeChanged = !lo.isEqual(oldLoop.userLoopAudio.range!, range)
        let isMidiChanged = false
        if (midiFile)
            isMidiChanged = midiFile.name !== oldLoop.userLoopMidi.name
        console.log(progressions)
        console.log(oldLoop.progressions)
        console.log('name change :', name !== oldLoop.name)
        console.log(
            'progressions change: ',
            !lo.isEqual(progressions, oldLoop.progressions)
        )
        console.log(
            'tags change :',
            tags,
            oldLoop.userLoopTags,
            !lo.isEqual(tags, oldLoop.userLoopTags)
        )
        console.log('root change :', scaleForm.root !== oldLoop.key)

        console.log(
            'scale change :',
            scaleForm.scale,
            oldLoop.scale,
            scaleForm.scale !== oldLoop.scale
        )

        console.log('memo change :', memo !== oldLoop.memo)

        console.log('audio change :', isAudioChanged)
        console.log('midi change :', isMidiChanged)

        return (
            name !== oldLoop.name ||
            !lo.isEqual(progressions, oldLoop.progressions) ||
            !lo.isEqual(tags, oldLoop.userLoopTags) ||
            scaleForm.root !== oldLoop.key ||
            scaleForm.scale !== oldLoop.scale ||
            memo !== oldLoop.memo ||
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
                    onChange={onNameChange}
                />
                <div className="text-2xl">artist</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={name}
                    onChange={onNameChange}
                />
                <div className="text-2xl">BPM</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={name}
                    onChange={onNameChange}
                />
                <div className="text-2xl">section</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={name}
                    onChange={onNameChange}
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
                    onChange={onMemoChange}
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
                            memo={memo}
                            onChange={onMemoChange}
                        />
                        <div>リード</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memo}
                            onChange={onMemoChange}
                        />
                        <div>ベース</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memo}
                            onChange={onMemoChange}
                        />
                        <div>リズム</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memo}
                            onChange={onMemoChange}
                        />
                        <div>パート間の繋ぎ</div>
                        <Memo
                            className="h-1/2 w-full border-2 border-sky-400"
                            memo={memo}
                            onChange={onMemoChange}
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
