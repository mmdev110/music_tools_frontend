import React, { useState, useEffect, useRef } from 'react'
import { TERMS } from '../Constants'
import * as Util from '../utils/music'
import * as Types from '../types'
import { SequencerNote, SequencerSetting } from '../types'
import { Midi } from '@tonejs/midi'
import Dropzone from 'react-dropzone'
import MidiTypes from '@tonejs/midi/dist/Note'
import InputCell from './InputCell'

type Props = {
    onChange: React.ChangeEventHandler<HTMLSelectElement>
    showTranspose: boolean
    scaleForm: Types.ScaleForm
}
const ScaleForm = (props: Props) => {
    const rootRef = useRef<HTMLSelectElement>(null)
    const scaleRef = useRef<HTMLSelectElement>(null)
    useEffect(() => {
        //props.scaleFormに選択状態を合わせる
        for (let i = 0; i < rootRef.current?.children.length!; i++) {
            const option = rootRef.current?.children[i] as HTMLOptionElement
            if (option.value === props.scaleForm.root.toString())
                option.selected = true
        }
        for (let i = 0; i < scaleRef.current?.children.length!; i++) {
            const option = scaleRef.current?.children[i] as HTMLOptionElement
            console.log(option.value)
            if (option.value === props.scaleForm.scale) option.selected = true
        }
    }, [props.scaleForm])
    return (
        <div className="Scale-Form" style={{}}>
            <form>
                <select ref={rootRef} name="root" onChange={props.onChange}>
                    <option value="0">C</option>
                    <option value="1">C#/Db</option>
                    <option value="2">D</option>
                    <option value="3">D#/Eb</option>
                    <option value="4">E</option>
                    <option value="5">F</option>
                    <option value="6">F#/Gb</option>
                    <option value="7">G</option>
                    <option value="8">G#/Ab</option>
                    <option value="9">A</option>
                    <option value="10">A#/Bb</option>
                    <option value="11">B</option>
                </select>
                <select ref={scaleRef} name="scale" onChange={props.onChange}>
                    <option value={TERMS.MAJOR}>メジャー</option>
                    <option value={TERMS.NATURAL_MINOR}>
                        ナチュラルマイナー
                    </option>
                    <option value={TERMS.HARMONIC_MINOR}>
                        ハーモニックマイナー
                    </option>
                    <option value={TERMS.MELODIC_MINOR}>
                        メロディックマイナー
                    </option>
                </select>
                {props.showTranspose ? (
                    <select name="transposeRoot" onChange={props.onChange}>
                        <option>(移調)</option>
                        <option value="0">C</option>
                        <option value="1">C#/Db</option>
                        <option value="2">D</option>
                        <option value="3">D#/Eb</option>
                        <option value="4">E</option>
                        <option value="5">F</option>
                        <option value="6">F#/Gb</option>
                        <option value="7">G</option>
                        <option value="8">G#/Ab</option>
                        <option value="9">A</option>
                        <option value="10">A#/Bb</option>
                        <option value="11">B</option>
                    </select>
                ) : null}
            </form>
        </div>
    )
}
export default ScaleForm
