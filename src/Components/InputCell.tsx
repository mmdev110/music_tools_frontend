import React, { useState, useEffect, useRef } from 'react'
import * as Constants from '../constants'
import * as Types from '../types'
import * as Utils from '../utils'

const init = Constants.InitChordBox
type Props = {
    index: number
    value: number | null
    onChange: Function
}

const InputCell = (props: Props) => {
    const [isInputting, setIsInputting] = useState(false)
    const [input, setInput] = useState('')
    const formRef = useRef<HTMLInputElement>(null)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('change at Input Cell')
        const newInput = event.target.value
        setInput(newInput)
        props.onChange(newInput, props.index)
    }

    const renderInputForm = () => {
        return (
            <input
                type="text"
                value={input}
                onChange={onChange}
                onBlur={inputFormOnBlur}
                onFocus={onClick}
                ref={formRef}
                autoFocus
                style={{ width: '2em' }}
            />
        )
    }
    const onClick = (event: React.FocusEvent<HTMLInputElement>) => {
        event.target.select()
    }
    const inputFormOnBlur = () => {
        setIsInputting(false)
    }
    const renderChordText = () => {
        const text = input || '□'
        return <div onClick={chordTextOnClick}>{text}</div>
    }
    const chordTextOnClick = () => {
        setIsInputting(true)
        //formRef.current?.focus()
    }

    return (
        <div className="One-Chord">
            {isInputting ? renderInputForm() : renderChordText()}
        </div>
    )
}
export default InputCell
