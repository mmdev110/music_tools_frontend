import React, { useState, useEffect } from 'react'
import * as Constants from '../constants'
import * as Util from '../utils'
import * as Types from '../types'
import { SequencerNote, SequencerSetting } from '../types'
import { Midi } from '@tonejs/midi'
import Dropzone from 'react-dropzone'
import MidiTypes from '@tonejs/midi/dist/Note'
import { isPropertySignature } from 'typescript'

type Props = {
    notes: SequencerNote[]
    setting: SequencerSetting
    onClick: (index: number) => void
}

const { pixelWidth, pixelHeight, pixelResolution } = Constants.Sequencer
const barWidth = pixelWidth * pixelResolution

type NotesInfo = {
    firstNote: SequencerNote
    lastNote: SequencerNote
    topNote: SequencerNote
    bottomNote: SequencerNote
    onClick: (index: number) => void
}
const FixedSequencerStyle: React.CSSProperties = {
    backgroundColor: '',
    backgroundImage: `
    linear-gradient(0deg, transparent calc(100% - 3px), #f0f0f040 calc(100% - 3px)),
    linear-gradient(90deg,transparent calc(100% - 3px), #f0f0f040 calc(100% - 3px)),
    linear-gradient(0deg, transparent calc(100% - 1px), #f0f0f040 calc(100% - 1px)),
    linear-gradient(90deg, transparent calc(100% - 1px), #f0f0f040 calc(100% - 1px))
    `,
    backgroundSize: `
    ${pixelWidth}px ${pixelHeight * 12}px,
    ${pixelWidth * 8}px ${pixelHeight}px,
    ${pixelWidth}px ${pixelHeight}px,
    ${pixelWidth}px ${pixelHeight}px`,
    backgroundRepeat: 'repeat',
    backgroundPosition: 'bottom left',

    display: 'block',
    position: 'relative',
}

/*
const FixedSequencerStyle: React.CSSProperties = {
    backgroundColor: '',
    backgroundImage: `linear-gradient(0deg, transparent calc(100% - 1px), #f0f0f040 calc(100% - 1px)),
        linear-gradient(90deg, transparent calc(100% - 1px), #f0f0f040 calc(100% - 1px))`,
    backgroundSize: `${pixelWidth}px ${pixelHeight}px`,
    backgroundRepeat: 'repeat',
    backgroundPosition: 'top left',

    display: 'block',
    position: 'relative',
}
*/
type NotesState = SequencerNote[]
const initialSetting: SequencerSetting = {
    barLength: 4,
    minOctave: 3,
    maxOctave: 3,
}
const Sequencer = (props: Props) => {
    const [setting, setSetting] = useState(initialSetting)
    const [notes, setNotes] = useState<NotesState>([])

    useEffect(() => {
        setNotes(props.notes)
    }, [props.notes, props.setting])

    const renderSequencer = () => {
        //console.log('@@@@@renderSequencer')

        const sequencerStyle: React.CSSProperties = generateSequencerStyle(
            props.setting
        )
        //console.log(props.setting)
        return <div style={sequencerStyle}>{renderNotes()}</div>
    }
    const generateSequencerStyle = (
        setting: SequencerSetting
    ): React.CSSProperties => {
        const octaves = setting.maxOctave - setting.minOctave + 1
        const height = pixelHeight * (12 * octaves + 1)
        //console.log({ height })

        return {
            ...FixedSequencerStyle,
            width: (pixelWidth * 8 * setting.barLength).toString() + 'px',
            height: height.toString() + 'px',
        }
    }
    const renderNotes = () => {
        return props.notes.map((note, index) => {
            return (
                <SingleNote
                    setting={props.setting}
                    note={note}
                    index={index}
                    onClick={props.onClick}
                />
            )
        })
    }

    return <div className="Sequencer">{renderSequencer()}</div>
}

type NoteProps = {
    note: SequencerNote
    setting: SequencerSetting
    index: number
    onClick: (index: number) => void
}
const FixedNoteStyle: React.CSSProperties = {
    position: 'absolute',
    //border: 'solid',
    //borderWidth: 2,
    //backgroundColor: '#f07b73a0',
    height: pixelHeight,
    fontSize: '0.5em',
    paddingBottom: '3px',
}
const SingleNote = ({ note, setting, onClick, index }: NoteProps) => {
    const left = note.start * barWidth //ノートのx座標
    let width = barWidth * (note.end - note.start) //ノートの長さ
    width = width > pixelWidth ? width : pixelWidth //widthが小さすぎる場合は1ピクセル分の長さに補正
    const top = calcTopMargin(note, setting.maxOctave) //ノートのy座標

    const noteStyle: React.CSSProperties = {
        ...FixedNoteStyle,
        left: left,
        top: top,
        width: width,
    }
    const noteOnClick = () => {
        onClick(index)
    }
    //console.log(noteStyle)
    return (
        <span className={note.style} style={noteStyle} onClick={noteOnClick}>
            {`${note.isRoot ? 'r' : ''}${note.name}`}
            {note.interval && `-${note.interval}`}
        </span>
    )
}

//一番上のノート(maxOctave + 1のC)からの距離を計算
const calcTopMargin = (note: SequencerNote, maxOctave: number) => {
    const { octave, pitch } = note
    //console.log({ octave }, { pitch })
    //console.log({ maxOctave })
    //console.log(maxOctave)
    //console.log({ C })
    //console.log({ indexC })
    //console.log({ n })
    //console.log({ indexN })
    let pitchDiff = 12 - note.pitch //note.pitchはCよりこの値だけ下
    pitchDiff += (maxOctave - note.octave) * 12
    const top = pixelHeight * pitchDiff
    return top
}

export default Sequencer
