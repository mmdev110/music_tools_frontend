import React, { useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import ScaleForm from 'Components/ScaleForm'
import ScaleDisplay from 'Components/ScaleDisplay'
import ChordDisplay from 'Components/ChordDisplay2'
import Intervals from 'Components/Intervals'
import Modes from 'Components/Modes'
import SequenceAnalyzer from 'Components/SequenceAnalyzer'
import MidiMonitorDescription from 'Components/MidiMonitorDescription'
import MidiMonitor from 'Components/MidiMonitor'
import AudioPlayer from 'Components/AudioPlayer'
import Memo from 'Components/Memo'
import { TERMS } from 'Constants'
import * as Types from 'types'
import { UserLoopInput } from 'types'
import { getUserLoop, saveUserLoop } from 'API/request'
import * as Utils from 'utils'
import { isAxiosError } from 'axios'

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
const Detail = () => {
    let { userLoopId } = useParams()
    console.log({ userLoopId })

    const [scaleForm, setScaleForm] = useState<Types.ScaleForm>({
        root: 0,
        scale: TERMS.MAJOR,
        transposeRoot: null,
    })
    const onScaleFormChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.target.name
        let value = event.target.value
        let newScaleForm: Types.ScaleForm
        if (name === 'root') {
            newScaleForm = { ...scaleForm, root: parseInt(value) }
        } else {
            newScaleForm = { ...scaleForm, [name]: value }
        }
        setScaleForm(newScaleForm)
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
    //AudioFile
    const [audioFile, setAudioFile] = useState<File>()
    const onDropAudio = (acceptedFiles: File[]) => {
        setAudioFile(acceptedFiles[0])
    }
    //MidiFile
    const [midiFile, setMidiFile] = useState<File>()
    const onDropMidi = (acceptedFiles: File[]) => {
        setMidiFile(acceptedFiles[0])
    }

    const save = async () => {
        console.log('save')
        const input: UserLoopInput = {
            progressions: progressions,
            key: scaleForm.root,
            scale: scaleForm.scale,
            midiRoots: [1],
            memo: memo,
            audioPath: audioFile ? audioFile.name : '',
            midiPath: midiFile ? midiFile.name : '',
        }
        try {
            console.log(input)
            const data = await saveUserLoop(input, userLoopId!)
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
    }
    const load = async (id: number) => {
        const data = await getUserLoop(id)
        console.log('@@@data = ', data)
        setProgressions(data.progressions)
        setScaleForm({ root: data.key, scale: data.scale, transposeRoot: null })
        setMemo(data.memo)
    }
    useEffect(() => {
        if (!isNaN(parseInt(userLoopId!))) load(parseInt(userLoopId!))
    }, [])

    return (
        <div className="App">
            Tools I Need
            <div>{userLoopId}</div>
            <button onClick={save}>save</button>
            <h2>AudioPlayer</h2>
            <AudioPlayer audioFile={audioFile} onDrop={onDropAudio} />
            <h2>Memo</h2>
            <Memo memo={memo} onChange={onMemoChange} />
            <h2>Scales</h2>
            <ScaleForm
                scaleForm={scaleForm}
                onChange={onScaleFormChange}
                showTranspose={true}
            />
            <ScaleDisplay scaleForm={scaleForm} />
            <h2>Chord Display</h2>
            <ChordDisplay
                progressionNames={progressions}
                onProgressionsChange={onProgressionsChange}
                scaleForm={scaleForm}
            />
            <h2>Intervals</h2>
            <Intervals />
            <h2>Modes</h2>
            <Modes scaleForm={scaleForm} />
            <h2>MIDI Analyzer</h2>
            <SequenceAnalyzer />
            <h2>MIDI Monitor</h2>
            <MidiMonitorDescription />
            <MidiMonitor />
            <div style={{ marginTop: '10em' }}></div>
        </div>
    )
}

export default Detail
