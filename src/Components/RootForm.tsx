import React, { useState, useEffect } from 'react'
import * as Constants from '../Constants'
import * as Utils from '../utils/music'
import * as Types from '../types/music'
import { SequencerNote, SequencerSetting } from '../types/music'
import { Midi } from '@tonejs/midi'
import Dropzone from 'react-dropzone'
import MidiTypes from '@tonejs/midi/dist/Note'
import InputCell from './InputCell'

type numberOrNull = number | null
type Props = {
    form: numberOrNull[][]
    setting: SequencerSetting
    scaleForm: Types.ScaleFormType
    onChange: Function
}
const { pixelWidth } = Constants.Sequencer
const RootForm = (props: Props) => {
    const notesFromRoot = Utils.shiftArrayIndex(
        Constants.ALL_NOTES,
        props.scaleForm.root
    )
    const renderRootForm = () => {
        return props.form.map((bar, index1) => {
            return (
                <div
                    style={{
                        border: 'solid',
                        display: 'flex',
                        flexDirection: 'row',
                        width: `${pixelWidth * 8}px`,
                        justifyContent: 'space-between',
                    }}
                >
                    {bar.map((quarter, index2) => {
                        let degree = null
                        if (quarter !== null) {
                            //console.log('@@@notesFromRoot = ', notesFromRoot)
                            //console.log(quarter)
                            const ind = notesFromRoot.findIndex(
                                (elem) => elem.index === quarter
                            )
                            degree = Constants.ALL_DEGREES[ind]
                        }
                        return (
                            <div>
                                <InputCell
                                    value={quarter}
                                    index={index1 * 4 + index2}
                                    onChange={props.onChange}
                                />
                                <div>{degree ? degree.degree : '-'}</div>
                            </div>
                        )
                    })}
                </div>
            )
        })
    }
    return (
        <div
            className="RootForm"
            style={{
                width: `${props.form.length * pixelWidth * 8}px`,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                //width: '100%',
            }}
        >
            {renderRootForm()}
        </div>
    )
}
export default RootForm
