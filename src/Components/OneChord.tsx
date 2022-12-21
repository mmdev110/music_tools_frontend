import React, { useState, useEffect, useRef } from 'react'
import * as Constants from '../Constants'
import * as Types from '../types'
import * as Utils from '../utils/music'

type Props = {
    chord: string
    degree: string
    transposedChord: string
    chara_itself: string[]
    chara_relation: string[]
    index: number
    onChange: Function
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
        const relation = props.chara_relation
        if (itself.length === 0 && relation.length === 0) return <div>-</div>
        return (
            <div className="flex flex-col items-center">
                {itself.map((chara, index) => {
                    return <div key={index}>{chara}</div>
                })}
                {relation.map((chara, index) => {
                    return <div key={index}>{chara}</div>
                })}
            </div>
        )
    }

    return (
        <div className="flex basis-1/4 flex-col items-center">
            {isInputting ? renderInputForm() : renderChordText()}
            <div>{props.degree}</div>
            {renderCharacteristic()}
            <div className="mt-auto">{props.transposedChord}</div>
        </div>
    )
}
export default OneChord
