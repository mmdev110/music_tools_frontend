import React, { useState } from 'react'
import * as Constants from '../Constants'
import * as Types from '../types/music'

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
        <div className="flex min-w-full rounded-md border-4 border-black text-2xl">
            {Constants.ALL_DEGREES.map((elem, index) => {
                return (
                    <div
                        className="flex basis-1/12 flex-col items-center border-r-2 border-black last:border-r-0"
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
    const baseStyle =
        'min-w-full border-b-2 border-black first:border-b-4 last:border-b-0'
    const selected = 'bg-amber-400'
    return (
        <div
            onClick={onClick}
            className={
                props.cell.isSelected ? baseStyle + ' ' + selected : baseStyle
            }
        >
            {props.cell.value}
        </div>
    )
}
export default Intervals
