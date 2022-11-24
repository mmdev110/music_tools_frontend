import React, { useState } from 'react'
import * as Constants from '../constants'
import * as Types from '../types'

type Props = {}
type Cell = {
    isSelected: boolean
    value: string
}
const Intervals = (props: Props) => {
    //console.log('@@@@ChordDisplay')
    //初期状態を生成する
    const intervalsInitial: Cell[][] = Constants.ALL_DEGREES.map(
        (elem, index) => {
            const left = Constants.ALL_NOTES.slice(0, index)
            const right = Constants.ALL_NOTES.slice(index)

            return right.concat(left).map((elem) => {
                return { isSelected: false, value: elem.flat }
            })
        }
    )
    const [intervals, SetIntervals] = useState(intervalsInitial)
    const selectNote = (note: string) => {
        console.log(note)
        const newIntervals: Cell[][] = intervals.map((column) => {
            return column.map((elem) => {
                if (elem.value === note) {
                    const isSelected = !elem.isSelected
                    return { ...elem, isSelected }
                }
                return elem
            })
        })
        SetIntervals(newIntervals)
    }
    return (
        <div className="Intervals">
            <div className="Intervals-List">
                {Constants.ALL_DEGREES.map((elem, index) => {
                    return (
                        <div
                            className="Intervals-Column"
                            key={'column' + index.toString()}
                        >
                            <Cell
                                cell={{
                                    isSelected: false,
                                    value: elem.interval,
                                }}
                            />
                            {intervals[index].map((elem, index2) => {
                                return (
                                    <Cell
                                        key={
                                            'Cell' +
                                            index
                                                .toString()
                                                .concat(index2.toString())
                                        }
                                        onClick={selectNote}
                                        cell={elem}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

type CellProps = {
    cell: Cell
    onClick?: Function
}
const Cell = (props: CellProps) => {
    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (props.onClick) props.onClick(event.currentTarget.innerText)
    }
    //console.log(props.cell)
    return (
        <div
            onClick={onClick}
            className={`Cell ${props.cell.isSelected ? 'Selected' : ''}`}
        >
            {props.cell.value}
        </div>
    )
}
export default Intervals
