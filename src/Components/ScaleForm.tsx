import React, { useState, useEffect } from 'react'
import { TERMS } from '../constants'
import * as Util from '../utils'
import * as Types from '../types'
import { SequencerNote, SequencerSetting } from '../types'
import { Midi } from '@tonejs/midi'
import Dropzone from 'react-dropzone'
import MidiTypes from '@tonejs/midi/dist/Note'
import InputCell from './InputCell'

type Props = {
    onChange: React.ChangeEventHandler<HTMLSelectElement>
    showTranspose: boolean
}
const ScaleForm = (props: Props) => {
    return (
        <div className="Scale-Form" style={{}}>
            <form>
                <select name="root" onChange={props.onChange}>
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
                <select name="scale" onChange={props.onChange}>
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
