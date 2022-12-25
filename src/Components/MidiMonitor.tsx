import React, { useState, useEffect } from 'react'
import { ALL_DEGREES } from '../Constants'
import * as Util from '../utils/music'
import * as Types from '../types/music'
import Note from 'Classes/Note'

type NotesInput = number[]
const showMax = 16 //rootの分は除く
const vh = 50

const MidiMonitor = () => {
    const [notesHist, setNotesHist] = useState<NotesInput>([]) //入力の履歴(入力中が空になったらリセットされる)
    const [currentInputs, setCurrentInputs] = useState<NotesInput>([]) //入力中のノートのみ
    useEffect(() => {
        navigator.requestMIDIAccess().then(onSuccess, onFailure)
    }, [])
    useEffect(() => {
        if (notesHist.length > 0 && currentInputs.length === 0) {
            //console.log('reset !!')
            setNotesHist([])
        }
    }, [currentInputs])
    const onSuccess = (access: WebMidi.MIDIAccess) => {
        console.log(access)
        access.addEventListener('statechange', (event) => {
            //console.log(event.port.manufacturer)
        })
        access.inputs.forEach((input, key) => {
            //console.log(input.name)
            input.addEventListener('midimessage', handleInput)
        })
    }
    const buildNotes = (): Note[] => {
        //console.log(notesHist)
        const notes = notesHist.map((note) => {
            const pitch = note % 12
            const octave = Math.floor(note / 12) - 2
            //console.log(note, pitch, octave)
            return Note.new(pitch, octave)
        })
        const root = notes[0]
        notes.forEach((note) => note.calcDegree(root.pitch))
        return notes
    }
    const notes = buildNotes()
    //console.log('notes = ', notes)

    const handleInput = (event: WebMidi.MIDIMessageEvent) => {
        const command = event.data[0]
        const note = event.data[1]
        const velocity = event.data[2]
        switch (command) {
            case 146:
                noteOn(note, velocity)
                break
            case 144:
                noteOn(note, velocity)
                break
            case 130:
                noteOff(note, velocity)
                break
            case 128:
                noteOff(note, velocity)
                break
            default:
        }
    }
    const noteOn = (note: number, velocity: number) => {
        //console.log(`noteOn! ${note} ${velocity}`)
        setNotesHist((before) => {
            const last = before[before.length - 1]
            const after = [...before]
            if (last !== note) after.push(note)
            return after
        })
        setCurrentInputs((before) => {
            const last = before[before.length - 1]
            const after = [...before]
            if (last !== note) after.push(note)
            return after
        })
    }
    const noteOff = (note: number, velocity: number) => {
        //console.log(`noteOff! ${note} ${velocity}`)
        setCurrentInputs((before) => {
            const after = before.filter((notein) => notein !== note)
            return after
        })
    }
    const onFailure = () => {
        console.log(`cannot connect to midi device.`)
    }
    const clearInput = () => {
        setNotesHist([])
    }
    const filterNotesForView = (): Note[] => {
        if (notes.length === 0) return []
        const root = notes[0]
        const index = notes.length > showMax ? notes.length - showMax : 1
        const rest = notes.splice(index)
        return [root, ...rest]
    }
    return (
        <div
            className="flex w-full items-end justify-start rounded-md border-2 border-black"
            style={{ height: vh.toString() + 'vh' }}
        >
            {filterNotesForView().map((note, i) => {
                const { name, pitch, octave, degree } = note
                const degreeName = ALL_DEGREES[degree].interval
                return (
                    <div
                        className="whitespace-nowrap border-2 border-black text-xs"
                        style={StyleFlexChild(pitch, octave, i)}
                        key={i}
                    >{`${name}${octave}-${degreeName}`}</div>
                )
            })}
        </div>
    )
}
const StyleFlex: React.CSSProperties = {
    display: 'flex',
    border: 'solid',
    height: '32em',
    width: '80vw',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
}
const StyleFlexChild = (
    pitch: number,
    octave: number,
    i: number
): React.CSSProperties => {
    const MAXPITCH = 25 //MAXPITCH鍵分表示させたい
    let pitches = pitch + 12 * (octave - 1) //bottomから何pitch持ち上げるか
    console.log(pitches)
    pitches = pitches > MAXPITCH - 1 ? MAXPITCH - 1 : pitches
    const heightUnit = vh / MAXPITCH
    return {
        //border: 'solid 1px',
        //left: i * 100,
        marginBottom: (heightUnit * pitches).toString() + 'vh', //height*heightUnit
        //fontSize: fontSize.toString() + 'em',
        height: heightUnit.toString() + 'vh',
        width: (100 / (showMax + 1)).toString() + '%',
        //paddingLeft: (0.5 * fontSize).toString() + 'em',
        //paddingRight: (0.5 * fontSize).toString() + 'em',
    }
}
export default MidiMonitor
