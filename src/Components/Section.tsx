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
const sectionInit: UserSongSection = {
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
}
type Props = {
    sectionIndex: number
    section: UserSongSection
    onDropMidi: (index: number, file: File) => void
    midiFile: File | null
    onSectionChange: (index: number, newSection: UserSongSection) => void
}
const Section = ({
    sectionIndex,
    section,
    onDropMidi,
    midiFile,
    onSectionChange,
}: Props) => {
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
    //MidiFile
    const onDrop = (acceptedFiles: File[]) => {
        onDropMidi(sectionIndex, acceptedFiles[0])
    }
    //rootIndexes
    const [midiRoots, setMidiRoots] = useState<number[]>([])
    const onMidiRootsChange = (rootIndexes: number[]) => {
        setMidiRoots(rootIndexes)
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
    return (
        <div className="flex gap-x-6 text-2xl">
            <div className="text-2xl">bpm</div>
            <Memo
                className="h-6 w-1/4 border-2 border-sky-400"
                memo={section.bpm.toString()}
                onChange={(str) => {
                    if (!isNaN(Number(str)))
                        onSectionChange(sectionIndex, {
                            ...section,
                            bpm: Number(str),
                        })
                }}
            />
            <div className="text-2xl">section</div>
            <Memo
                className="h-6 w-1/4 border-2 border-sky-400"
                memo={section.section}
                onChange={(str) => {
                    onSectionChange(sectionIndex, { ...section, section: str })
                }}
            />
            <MediaRangeForm
                range={
                    section.audioPlaybackRange || {
                        start: 0,
                        end: 0,
                    }
                }
                onChange={(newRange) => {
                    onSectionChange(sectionIndex, {
                        ...section,
                        audioPlaybackRange: { ...newRange },
                    })
                }}
            />
            <div className="text-2xl">Memo</div>
            <Memo
                className="h-1/2 w-full border-2 border-sky-400"
                memo={section.memo}
                onChange={(str) =>
                    onSectionChange(sectionIndex, { ...section, memo: str })
                }
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
                progressionNames={section.progressions}
                onProgressionsChange={(progressions) =>
                    onSectionChange(sectionIndex, {
                        ...section,
                        progressions: progressions,
                    })
                }
                scaleForm={scaleForm}
                onNoteIntervalsClick={showChordModal}
            />

            <div className="text-2xl">MIDI Analyzer</div>
            <SequenceAnalyzer
                scaleForm={scaleForm}
                onDrop={onDrop}
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
    )
}

export default Section
