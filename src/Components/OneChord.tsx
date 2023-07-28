import React, { useState, useEffect, useRef } from 'react'
import Tooltip from '@mui/material/Tooltip'
import * as Constants from '../config/music'
import * as Types from '../types/music'
import * as Utils from '../utils/music'
import { TERMS } from '../config/music'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'

type Props = {
    chord: string
    degree: string
    transposedChord: string
    chara_itself: string[]
    index: number
    onChange: Function
    noteIntervals: NoteIntervals
}

const OneChord = (props: Props) => {
    //console.log('@@@@OneChord')
    //console.log(props.chord)
    const [state, setState] = useState('')
    const [isInputting, setIsInputting] = useState(false)
    const formRef = useRef<HTMLInputElement>(null)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('change at OneChord')
        const newState = event.target.value
        setState(newState)
        props.onChange(props.index, newState)
    }
    useEffect(() => {
        //console.log('useEffect at OneChord')
        if (props.chord !== state) {
            setState(props.chord)
        }
    }, [props.chord])

    //if (state.input && !state.keyChanged) keyChangedDisplay = '×' //inputがおかしい場合
    const renderInputForm = () => {
        return (
            <input
                type="text"
                value={state}
                onChange={onChange}
                onBlur={inputFormOnBlur}
                onFocus={(event) => event.target.select()}
                ref={formRef}
                autoFocus
            />
        )
    }
    const inputFormOnBlur = () => {
        setIsInputting(false)
    }
    const renderChordText = () => {
        const text = state || '□'
        return <div onClick={chordTextOnClick}>{text}</div>
    }
    const chordTextOnClick = () => {
        setIsInputting(true)
        //formRef.current?.select()
    }
    const renderCharacteristic = () => {
        const itself = props.chara_itself
        if (itself.length === 0) return <div>-</div>
        return (
            <div className="flex flex-col items-center text-sm">
                {itself.map((chara, index) => {
                    return <div key={index}>{chara}</div>
                })}
            </div>
        )
    }
    const renderNoteDetails = () => {
        //console.log('@@@@NoteIntervals', props.noteIntervals)
        const { noteIntervals } = props
        let tooltipText = ''
        tooltipText += `${props.chord}\n`
        const rootIndex = noteIntervals.findIndex(
            (note) => note.interval === 'root'
        )
        const root = noteIntervals[rootIndex]
        noteIntervals.forEach((interval, index) => {
            if (index !== rootIndex) {
                const line = `${interval.noteName}: ${interval.interval}\n`
                tooltipText += line
            }
        })
        tooltipText += `${root.noteName}: ${root.interval}\n`
        return (
            <Tooltip
                title={
                    <span
                        className="text-xl"
                        style={{ whiteSpace: 'pre-line' }}
                    >
                        {tooltipText}
                    </span>
                }
                placement="right-end"
                arrow
            >
                <div>
                    <Button
                        onClick={() => {
                            //props.onNoteIntervalsClick(props.noteIntervals)
                        }}
                    >
                        詳細
                    </Button>
                </div>
            </Tooltip>
        )
    }

    return (
        <div className="flex basis-1/2 flex-col items-center">
            {isInputting ? renderInputForm() : renderChordText()}
            <div>{props.degree}</div>
            {renderCharacteristic()}
            <div className="mt-auto">
                {props.noteIntervals.length !== 0 ? renderNoteDetails() : null}
                {props.transposedChord ? (
                    <div className="mt-auto">{props.transposedChord}</div>
                ) : null}
            </div>
        </div>
    )
}
export default OneChord
