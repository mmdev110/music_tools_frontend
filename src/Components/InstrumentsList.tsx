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
    instrumentsList: UserSongInstrument[]
    selectedInstruments: UserSongInstrument[]
    onListUpdate: (newList: UserSongInstrument[]) => void
    onSelectedUpdate: (newList: UserSongInstrument[]) => void
}
const InstrumentsList = ({
    instrumentsList,
    selectedInstruments,
    onListUpdate,
    onSelectedUpdate,
}: Props) => {
    const isSelected = (instInList: UserSongInstrument): boolean => {
        return !!selectedInstruments.find((elem) => {
            if (elem.id && instInList.id) return elem.id === instInList.id
            return elem.name === instInList.name
        })
    }
    return (
        <div>
            {instrumentsList.map((inst, index) => (
                <div key={index}>
                    <Button
                        bgColor={isSelected(inst) ? 'bg-sky-500' : 'bg-sky-300'}
                    >
                        {inst.name}
                    </Button>
                </div>
            ))}
        </div>
    )
}

export default InstrumentsList
