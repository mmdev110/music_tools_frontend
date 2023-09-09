import React, { useState, useEffect } from 'react'
import * as Constants from '../config/music'
import { TERMS } from 'config/music'
import * as Utils from '../utils/music'
import * as Types from '../types/music'

type Props = {
    scaleForm: Types.ScaleFormType
}
type Cell = {
    style: string
    value: string
}
const Rows = [
    '-',
    TERMS.MAJOR,
    TERMS.NATURAL_MINOR,
    TERMS.HARMONIC_MINOR,
    TERMS.NATURAL_MINOR,
    TERMS.IONIAN,
    TERMS.DORIAN,
    TERMS.AEORIAN,
    TERMS.LYDIAN,
    TERMS.MIXOLYDIAN,
    TERMS.PHRYGIAN,
    TERMS.LOCRIAN,
]
const Columns = ['-', ...Constants.ALL_DEGREES.map((deg) => deg.degree)]

const DiatonicChords = ({ scaleForm }: Props) => {
    const [notes, setNotes] = useState<Types.NOTE[]>([])
    useEffect(() => {
        const shifted_notes = Utils.shiftArrayIndex(
            Constants.ALL_NOTES,
            scaleForm.root
        )
        setNotes(shifted_notes)
    }, [scaleForm])
    const renderRow = (row: string) => {
        return (
            <div className="flex">
                {Columns.map((col, colIndex) => {
                    let tailwind_style = 'basis-16 border-b-2 border-black'
                    let value: string = ''
                    if (col === '-') {
                        //左端の列
                        value = row
                        if (row === '-') {
                            tailwind_style =
                                'basis-32 border-l-2 border-t-2 border-b-4 border-r-4 border-black shrink-0'
                        } else {
                            tailwind_style =
                                'basis-32 border-l-2 border-b-2 border-r-4 border-black shrink-0'
                        }
                    } else if (row === '-') {
                        //上端の行
                        value = col
                        tailwind_style =
                            'basis-20 border-t-2 border-b-4 border-r-2 border-black text-center'
                    } else {
                        tailwind_style =
                            'basis-20 border-b-2 border-r-2 border-black text-center'
                        const noteIndex = colIndex - 1
                        console.log(notes[noteIndex])
                        const note = notes[noteIndex]
                        const scaleName = row
                        const scale = Constants.SCALES[scaleName]

                        const diatonic = scale.diatonics?.find(
                            (d) => d.root === noteIndex
                        )
                        if (diatonic) {
                            const { third, fifth, seventh } = diatonic
                            value = note.flat + third + seventh + fifth
                            tailwind_style += ' bg-sky-400'
                        } else {
                            value = '(' + note.flat + ')'
                        }
                    }
                    return (
                        <div className={tailwind_style} key={colIndex}>
                            {value}
                        </div>
                    )
                })}
            </div>
        )
    }
    return (
        <div className="flex flex-col">
            {notes.length > 0
                ? Rows.map((row, index) => {
                      return <div key={index}>{renderRow(row)}</div>
                  })
                : null}
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

export default DiatonicChords
