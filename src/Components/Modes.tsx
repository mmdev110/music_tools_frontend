import React, { useState, useEffect } from 'react'
import * as Constants from '../Constants'
import { TERMS } from '../Constants'
import * as Utils from '../utils'
import * as Types from '../types'

type Props = {
    scaleForm: Types.ScaleForm
}
type Cell = {
    style: string
    value: string
}
const Modes = (props: Props) => {
    //console.log('@@@@ChordDisplay')
    //初期状態を生成する
    const generateIntervals = (root: number, scale_name: string) => {
        //console.log('@@@@@generateIntervals')
        //stateは行で、描画は列で行っていく
        const shifted_notes = Utils.shiftArrayIndex(Constants.ALL_NOTES, root)
        const gen = shifted_notes.map((elem, index) => {
            const notes: Types.NOTE[] = Utils.shiftArrayIndex(
                shifted_notes,
                index
            )
            const modeName = Utils.getModeName(
                Constants.ALL_NOTES.indexOf(notes[0]),
                root,
                scale_name
            )
            const mode =
                modeName in Constants.SCALES ? Constants.SCALES[modeName] : null
            //console.log(elem, modeName)

            return notes.map((elem, index) => {
                let style = ''
                if (mode) {
                    //console.log(index)
                    //console.log(mode)
                    if (mode.chordTones.includes(index)) style = 'Chord-Tone'
                    if (mode.avoids.includes(index)) style = 'Avoid'
                    if (mode.naturalTensions.includes(index))
                        style = 'Natural-Tension'
                    if (mode.alteredTensions.includes(index))
                        style = 'Altered-Tension'
                }
                return { style: style, value: elem.flat }
            })
        })
        //console.log(gen)
        return gen
    }
    useEffect(() => {
        //console.log(props.scaleForm)
        const newInterval: Cell[][] = generateIntervals(
            props.scaleForm.root,
            props.scaleForm.scale === TERMS.MAJOR
                ? TERMS.MAJOR
                : TERMS.NATURAL_MINOR
        )
        //console.log(newInterval)
        SetIntervals(newInterval)
    }, [props.scaleForm])

    //型問題解消のため
    const [intervals, SetIntervals] = useState<Cell[][]>()
    const selectNote = (note: string) => {
        //console.log(note)
    }
    const renderNotes = (index: number) => {
        if (!intervals) return
        return intervals.map((elem) => {
            const cell = elem[index]
            return <Cell style={cell.style}>{cell.value}</Cell>
        })
    }
    const shiftedNotes = Utils.shiftArrayIndex(
        Constants.ALL_NOTES,
        props.scaleForm.root
    )
    return (
        <div className="Intervals">
            <div className="Intervals-List">
                {/*左端の列*/}
                <div className="Intervals-Column">
                    <Cell>-</Cell>
                    {shiftedNotes.map((elem, index) => {
                        let text =
                            Utils.getModeName(
                                elem.index,
                                props.scaleForm.root,
                                props.scaleForm.scale === TERMS.MAJOR
                                    ? TERMS.MAJOR
                                    : TERMS.NATURAL_MINOR
                            ) || '-'
                        return (
                            <Cell key={'aa' + index.toString()} style="">
                                {text}
                            </Cell>
                        )
                    })}
                </div>
                {/*それ以降*/}
                {Constants.ALL_DEGREES.map((elem, index) => {
                    let text = elem.interval
                    return (
                        <div className="Intervals-Column">
                            <Cell key={'aa' + index.toString()} style="">
                                {text}
                            </Cell>
                            {renderNotes(index)}
                        </div>
                    )
                })}
            </div>
            {/*凡例*/}
            <div className="Legend">
                <div className="Legend Color">
                    <div className="Cell Chord-Tone Legend ColorBox"></div>
                    <div className="Cell Natural-Tension Legend ColorBox"></div>
                    <div className="Cell Altered-Tension Legend ColorBox"></div>
                    <div className="Cell Avoid Legend ColorBox"></div>
                </div>
                <div className="Legend Type">
                    <div>コードトーン</div>
                    <div>ナチュラルテンション</div>
                    <div>オルタードテンション</div>
                    <div>アボイド</div>
                </div>
            </div>
        </div>
    )
}

type CellProps = {
    style?: string
    onClick?: Function
    children: React.ReactNode
}
const Cell = (props: CellProps) => {
    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (props.onClick) props.onClick(event.currentTarget.innerText)
    }
    return (
        <div onClick={onClick} className={`Cell ${props.style || ''}`}>
            {props.children}
        </div>
    )
}

export default Modes
