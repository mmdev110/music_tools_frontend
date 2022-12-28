import React, { useState, useEffect } from 'react'
import * as Constants from '../config/music'
import { TERMS, NoteColors } from 'config/music'
import * as Utils from '../utils/music'
import * as Types from '../types/music'

type Props = {
    scaleForm: Types.ScaleFormType
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
                    if (mode.chordTones.includes(index))
                        style = NoteColors.ChordTone
                    if (mode.avoids.includes(index)) style = NoteColors.Avoid
                    if (mode.naturalTensions.includes(index))
                        style = NoteColors.NaturalTension
                    if (mode.alteredTensions.includes(index))
                        style = NoteColors.AlteredTension
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

    const [intervals, SetIntervals] = useState<Cell[][]>()

    const renderNotes = (index: number) => {
        if (!intervals) return
        return intervals.map((elem) => {
            const cell = elem[index]
            return (
                <div className="min-w-full border-b-2 border-black last:border-b-0">
                    <Cell style={cell.style}>{cell.value}</Cell>
                </div>
            )
        })
    }
    const shiftedNotes = Utils.shiftArrayIndex(
        Constants.ALL_NOTES,
        props.scaleForm.root
    )
    return (
        <div className="min-w-full text-2xl">
            <div className="flex rounded-md border-4 border-black">
                {/*左端の列*/}
                <div className="flex flex-col items-center justify-evenly border-r-4 border-black text-lg">
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
                            <div className="min-w-full border-b-2 border-black first:border-y-2 last:border-b-0">
                                <Cell key={'aa' + index.toString()} style="">
                                    {text}
                                </Cell>
                            </div>
                        )
                    })}
                </div>
                {/*それ以降*/}
                {Constants.ALL_DEGREES.map((elem, index) => {
                    let text = elem.interval
                    return (
                        <div className="flex basis-1/12 flex-col items-center justify-evenly border-r-2 border-black last:border-r-0">
                            <div className="min-w-full border-b-2 border-black last:border-b-0">
                                <Cell
                                    key={'aa' + index.toString()}
                                    style="text-lg"
                                >
                                    {text}
                                </Cell>
                            </div>

                            {renderNotes(index)}
                        </div>
                    )
                })}
            </div>
            {/*凡例*/}
            <div className="ml-5 mt-5 flex flex-col">
                <div className="flex">
                    <div className={NoteColors.ChordTone + ' px-4'}></div>
                    <div>コードトーン</div>
                </div>
                <div className="flex">
                    <div className={NoteColors.NaturalTension + ' px-4'}></div>
                    <div>ナチュラルテンション</div>
                </div>

                <div className="flex">
                    <div className={NoteColors.AlteredTension + ' px-4'}></div>

                    <div>オルタードテンション</div>
                </div>
                <div className="flex">
                    <div className={NoteColors.Avoid + ' px-4'}></div>
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
        <div onClick={onClick} className={props.style || ''}>
            {props.children}
        </div>
    )
}

export default Modes
