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
import InstrumentsList from 'Components/InstrumentsList'
import { TERMS } from 'config/music'
import {
    Tag,
    ScaleFormType,
    AudioState,
    UserSongSection,
    UserSongInstrument,
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

type Props = {
    sectionIndex: number
    section: UserSongSection
    onDropMidi?: (index: number, file: File) => void
    midiFile: File | null
    onSectionChange: (newSection: UserSongSection) => void
    onDeleteButtonClick: () => void
    showAudioRange: boolean
    onClickPlayButton: () => void
    onRangeClick: (btn: string) => void
    showMidi: boolean
    onClickChordInfo: (intervals: NoteIntervals) => void
    allInstruments: UserSongInstrument[]
    onInstrumentsMenuClick: (index: number) => void
}
const Section = ({
    sectionIndex,
    section,
    onDropMidi,
    midiFile,
    onSectionChange,
    onDeleteButtonClick,
    onClickPlayButton,
    showAudioRange,
    onRangeClick,
    showMidi,
    onClickChordInfo,
    allInstruments,
    onInstrumentsMenuClick,
}: Props) => {
    const [transposeRoot, setTransposeRoot] = useState<number | null>(null)

    const scaleForm = {
        root: section.key,
        scale: section.scale,
        transposeRoot: transposeRoot,
    }
    const onScaleFormChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.target.name
        let value = event.target.value
        let newScaleForm: ScaleFormType
        if (name === 'root') {
            section.key = parseInt(value)
        } else if (name === 'scale') {
            section.scale = value
        } else if (name === 'transposeRoot') {
            setTransposeRoot(parseInt(value))
        }
        onSectionChange({ ...section })
    }
    //MidiFile
    const onDrop = (acceptedFiles: File[]) => {
        if (onDropMidi) onDropMidi(sectionIndex, acceptedFiles[0])
    }
    //rootIndexes
    const [midiRoots, setMidiRoots] = useState<number[]>([])
    const onMidiRootsChange = (rootIndexes: number[]) => {
        setMidiRoots(rootIndexes)
    }

    return (
        <div className="flex flex-col gap-y-5 rounded border-y-4 border-dashed border-black ">
            <Button
                className="rounded bg-red-400 font-bold text-white"
                onClick={onDeleteButtonClick}
            >
                ×
            </Button>
            <div className="text-2xl">section name</div>
            <Memo
                className="h-6 w-1/4 border-2 border-sky-400"
                memo={section.section}
                onChange={(str) => {
                    onSectionChange({ ...section, section: str })
                }}
            />
            <div className="text-2xl">Key, Scales</div>
            <ScaleForm
                scaleForm={scaleForm}
                onChange={onScaleFormChange}
                showTranspose={true}
            />
            <ScaleDisplay scaleForm={scaleForm} />
            <div className="text-2xl">bpm</div>
            <Memo
                className="h-6 w-1/4 border-2 border-sky-400"
                memo={section.bpm.toString()}
                onChange={(str) => {
                    if (!isNaN(Number(str)))
                        onSectionChange({
                            ...section,
                            bpm: Number(str),
                        })
                }}
            />
            {showAudioRange ? (
                <div>
                    <div className="text-2xl">audio playback range</div>
                    <MediaRangeForm
                        range={
                            section.audioPlaybackRange || {
                                start: 0,
                                end: 0,
                            }
                        }
                        onChange={(newRange) => {
                            onSectionChange({
                                ...section,
                                audioPlaybackRange: { ...newRange },
                            })
                        }}
                    />
                    <Button onClick={onClickPlayButton}>▷</Button>
                    <Button onClick={() => onRangeClick('set-start')}>
                        tap
                    </Button>
                    <Button onClick={() => onRangeClick('set-end')}>tap</Button>
                </div>
            ) : null}

            <div className="text-2xl">Chord Display</div>
            <ChordDisplay
                progressionNames={section.progressions}
                onProgressionsChange={(progressions) =>
                    onSectionChange({
                        ...section,
                        progressions: progressions,
                    })
                }
                scaleForm={scaleForm}
                onNoteIntervalsClick={onClickChordInfo}
            />
            <div className="text-2xl">Instruments</div>
            <Button
                onClick={() => {
                    onInstrumentsMenuClick(sectionIndex)
                }}
            >
                instruments編集
            </Button>
            <InstrumentsList
                instrumentsList={allInstruments}
                selectedInstruments={section.instruments}
                onListUpdate={() => {}}
                onSelectedUpdate={(newList) =>
                    onSectionChange({ ...section, instruments: newList })
                }
            />
            <Memo
                className="h-1/2 w-full border-2 border-sky-400"
                memo={section.memo}
                onChange={(str) => onSectionChange({ ...section, memo: str })}
            />
            <div className="text-2xl">Memo</div>
            <Memo
                className="h-1/2 w-full border-2 border-sky-400"
                memo={section.memo}
                onChange={(str) => onSectionChange({ ...section, memo: str })}
            />
            {showMidi ? (
                <div>
                    <div className="text-2xl">MIDI Analyzer</div>
                    <SequenceAnalyzer
                        scaleForm={scaleForm}
                        onDrop={onDrop}
                        midiFile={midiFile}
                        rootIndexes={midiRoots}
                        onMidiNoteClick={onMidiRootsChange}
                    />
                </div>
            ) : null}
        </div>
    )
}

export default Section
