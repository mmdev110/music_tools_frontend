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
    previousInstruments?: UserSongInstrument[]
    categories: string[]
}
const InstrumentsList = ({
    instrumentsList,
    selectedInstruments,
    onListUpdate,
    onSelectedUpdate,
    previousInstruments,
    categories,
}: Props) => {
    const isInList = (
        inst: UserSongInstrument,
        targetList: UserSongInstrument[]
    ): boolean => {
        return !!targetList.find((elem) => {
            if (elem.id && inst.id) return elem.id === inst.id
            return elem.name === inst.name
        })
    }
    const getColor = (inst: UserSongInstrument): string => {
        //instrumentの使用状況に応じてボタン色を変える
        const colors = {
            used: 'bg-sky-500',
            addedRecently: 'bg-red-500',
            removedRecently: 'bg-red-200',
            unused: 'bg-sky-200',
        }
        if (isInList(inst, selectedInstruments)) {
            //selected = usedまたはaddedRecently
            if (previousInstruments && !isInList(inst, previousInstruments)) {
                return colors.addedRecently
            } else {
                return colors.used
            }
        } else {
            if (previousInstruments && isInList(inst, previousInstruments)) {
                return colors.removedRecently
            } else {
                return colors.unused
            }
        }
        return ''
    }
    return (
        <div className="flex w-full justify-around">
            {categories.map((categName, index) => {
                const filtered = instrumentsList.filter(
                    (inst) => inst.category === categName
                )
                return (
                    <div key={index}>
                        <div>{categName}</div>
                        {filtered.map((inst, index2) => (
                            <div key={index2}>
                                <Button bgColor={getColor(inst)}>
                                    {inst.name}
                                </Button>
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
    /*
                                {categories.map(categName=>{
                
                return
                <div>aa</div>
                                        {instrumentsList.map((inst, index) => 
                        <div key={index}>
                            <Button bgColor={getColor(inst)}>{inst.name}</Button>
                        </div>
                    )}
                    */
}

export default InstrumentsList
