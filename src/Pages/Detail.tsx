import React, { useEffect, useState } from 'react'
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
import TagModal from 'Pages/TagModal'
import Memo from 'Components/Memo'
import { TERMS } from 'config/music'
import { Tag, ScaleFormType } from 'types'
import { UserLoopInput } from 'types'
import { getFromS3, getUserLoop, saveUserLoop, uploadToS3 } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import LoopSummary from 'Components/LoopSummary'

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
    progressions: [],
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
    console.log({ userLoopId })

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
    const onNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(e.target.value)
        console.log(e.target.value)
    }
    //Progressions
    const [progressions, setProgressions] = useState(DefaultChordNames)
    const onProgressionsChange = (newInput: string[]) => {
        setProgressions(newInput)
    }
    //Memo
    const [memo, setMemo] = useState('')
    const onMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMemo(e.target.value)
        console.log(e.target.value)
    }
    //droppedFile
    const [droppedFile, setDroppedFile] = useState<File>()
    const [audioUrl, setAudioUrl] = useState('')
    const [audioName, setAudioName] = useState('')
    const onDropAudio = (acceptedFiles: File[]) => {
        setDroppedFile(acceptedFiles[0])
        //setAudioUrl(URL.createObjectURL(acceptedFiles[0]))
    }
    //MidiFile
    const [midiFile, setMidiFile] = useState<File>()
    const onDropMidi = (acceptedFiles: File[]) => {
        setMidiFile(acceptedFiles[0])
    }
    //rootIndexes
    const [rootIndexes, setRootIndexes] = useState<number[]>([])
    const handleRootIndexes = (indexes: number[]) => {
        setRootIndexes(indexes)
    }
    //userLoop
    const [loop, setLoop] = useState<UserLoopInput>(loopInit)

    const save = async () => {
        console.log('save')
        const input: UserLoopInput = {
            progressions: progressions,
            name: name,
            key: scaleForm.root,
            scale: scaleForm.scale,
            midiRoots: rootIndexes,
            memo: memo,
            userLoopAudio: {
                name: droppedFile ? droppedFile.name : audioName,
                url: { get: '', put: '' },
            },
            userLoopMidi: {
                name: midiFile ? midiFile.name : '',
                url: { get: '', put: '' },
            },
            userLoopTags: loop.userLoopTags,
        }

        try {
            console.log(input)
            const { userLoopInput } = await saveUserLoop(input, userLoopId!)
            console.log(userLoopInput)
            //s3へのアップロード
            try {
                const audio = userLoopInput.userLoopAudio
                if (audio.url.put && droppedFile) {
                    const response = await uploadToS3(
                        audio.url.put,
                        droppedFile
                    )
                    console.log(response)
                }
                const midi = userLoopInput.userLoopMidi
                if (midi.url.put && midiFile)
                    await uploadToS3(midi.url.put, midiFile)
            } catch (err) {
                if (isAxiosError(err)) console.log(err)
            }
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
    }
    const load = async (id: number) => {
        const { userLoopInput } = await getUserLoop(id)
        console.log('@@URI', userLoopInput)
        const audio = userLoopInput.userLoopAudio
        const midi = userLoopInput.userLoopMidi
        setProgressions(userLoopInput.progressions)
        setScaleForm({
            root: userLoopInput.key,
            scale: userLoopInput.scale,
            transposeRoot: null,
        })
        setName(userLoopInput.name)
        setMemo(userLoopInput.memo)
        setAudioName(audio.name)
        setRootIndexes(userLoopInput.midiRoots)
        setLoop(userLoopInput)
        try {
            if (audio.url.get) {
                //const response = await getFromS3(s3Url.mp3)
                setAudioUrl(audio.url.get)
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
        if (!isNaN(parseInt(userLoopId!))) load(parseInt(userLoopId!))
    }, [])

    //tag modal
    const [modalIsOpen, setIsOpen] = React.useState(false)
    const showModal = () => {
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
    }
    const updateTags = (selectedTags: Tag[]) => {
        setLoop((loop) => {
            loop.userLoopTags = selectedTags
            return loop
        })
    }

    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>
                    <Button onClick={save}>save</Button>
                </div>
                <div className="text-2xl">name</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={name}
                    onChange={onNameChange}
                />
                <Button onClick={showModal}>タグ編集</Button>
                <div className="flex flex-row gap-x-4">
                    {loop.userLoopTags.map((tag) => (
                        <Button>{tag.name}</Button>
                    ))}
                </div>
                <div className="text-2xl">AudioPlayer</div>
                <AudioPlayer
                    droppedFile={droppedFile}
                    audioUrl={audioUrl}
                    audioName={audioName}
                    onDrop={onDropAudio}
                    dropDisabled={false}
                    mini={false}
                />
                <div className="text-2xl">Memo</div>
                <Memo
                    className="h-1/2 w-full border-2 border-sky-400"
                    memo={memo}
                    onChange={onMemoChange}
                />
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
                />
                <div className="text-2xl">MIDI Analyzer</div>

                <SequenceAnalyzer
                    scaleForm={scaleForm}
                    onDrop={onDropMidi}
                    midiFile={midiFile}
                    rootIndexes={rootIndexes}
                    onMidiNoteClick={handleRootIndexes}
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
                isOpen={modalIsOpen}
                //onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={ModalStyle}
                contentLabel="Example Modal"
            >
                <TagModal
                    onTagUpdate={updateTags}
                    closeModal={closeModal}
                    loopTags={loop.userLoopTags}
                />
            </Modal>
        </BasicPage>
    )
}

export default Detail
