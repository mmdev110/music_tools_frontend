import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'
import {
    AudioRange,
    UserSongSection,
    UserSongInstrument,
    User,
} from 'types/front'
import { INSTRUMENT_CATEGORIES } from 'config/front'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import OneTag from 'Components/OneTag2'

type Props = {
    sections: UserSongSection[]
    instruments: UserSongInstrument[]
    onClick: (newSections: UserSongSection[]) => void
    onClickPlayButton: (range: AudioRange) => void
}
const SectionOverView = ({
    sections,
    instruments,
    onClick,
    onClickPlayButton,
}: Props) => {
    const row: (UserSongInstrument | string)[] = [
        'sectionname',
        'bars',
        'play',
        'copy',
    ] //横軸
    INSTRUMENT_CATEGORIES.forEach((categ) => {
        //instrumentをカテゴリごとに並べ直す
        const filtered = instruments.filter((inst) => inst.category === categ)
        row.push(...filtered)
    })

    const column: (UserSongSection | string)[] = ['instname', ...sections] //縦軸

    //左端の一列目
    const renderInstNamesCol = (indexCol: number) => {
        let tailwind_child =
            'flex justify-center items-center text-sm first:border-2 border-b-2 border-l-2 border-r-2 h-8 w-48 border-black'
        return (
            <div className="flex flex-col" key={indexCol}>
                {row.map((rowValue, rowIndex) => {
                    let value: React.ReactNode = ''
                    switch (rowValue) {
                        case 'sectionname':
                            value = 'section'
                            break
                        case 'bars':
                            value = 'bars'
                            break
                        case 'play':
                            value = 'play'
                            break
                        case 'copy':
                            value = 'copy'
                            break
                        default:
                            const inst = rowValue as UserSongInstrument
                            value = (
                                <OneTag
                                    color="bg-gray-400"
                                    name={inst.name}
                                    tooltipText={inst.memo}
                                />
                            )
                    }
                    return <div className={tailwind_child}>{value}</div>
                })}
            </div>
        )
    }
    //2列目以降
    const renderInstCol = (sectionIndex: number, indexCol: number) => {
        const section = sections[sectionIndex]
        return (
            <div className="flex flex-col" key={indexCol}>
                {row.map((rowValue, rowIndex) => {
                    let tailwind_child =
                        'flex justify-center items-center text-sm first:border-t-2 border-r-2 border-b-2 h-8 w-16 border-black'
                    let value: React.ReactNode = ''
                    let onClick = () => {}
                    switch (rowValue) {
                        case 'sectionname':
                            value = section.section
                            break
                        case 'bars':
                            value = section.barLength
                            break
                        case 'play':
                            value =
                                section.audioRanges[0] && playButton(section)
                            break
                        case 'copy':
                            value = '-'
                            break
                        default:
                            const inst = rowValue as UserSongInstrument
                            //sectionにinstが含まれてるかどうか
                            const foundIndex = section.instruments.findIndex(
                                (i) => i.name === inst.name
                            )
                            tailwind_child += ` ${instCellColor(
                                inst,
                                foundIndex !== -1
                            )}`
                            value = ''
                            onClick = () =>
                                onInstCellClick(sectionIndex, foundIndex, inst)
                    }
                    return (
                        <div className={tailwind_child} onClick={onClick}>
                            {value}
                        </div>
                    )
                })}
            </div>
        )
    }
    const playButton = (section: UserSongSection) => {
        return (
            <Button
                onClick={() => {
                    onClickPlayButton(section.audioRanges[0])
                }}
            >
                ▷
            </Button>
        )
    }
    const copyButton = (sectionIndex: number) => {
        return (
            <Button
                onClick={() => {
                    if (sectionIndex > 0) {
                        const newSections = [...sections]
                        newSections[sectionIndex].instruments = structuredClone(
                            newSections[sectionIndex - 1].instruments
                        )
                        onClick(newSections)
                    }
                }}
            >
                copy
            </Button>
        )
    }

    const renderColumn2 = (
        valueCol: UserSongSection | string,
        indexCol: number
    ) => {
        if (valueCol === 'instname') {
            return renderInstNamesCol(0)
        } else {
            const sectionIndex = indexCol - 1
            return renderInstCol(sectionIndex, indexCol)
        }
    }
    const instCellColor = (inst: UserSongInstrument, isFound: boolean) => {
        if (!isFound) return 'bg-transparent'
        if (inst.category === INSTRUMENT_CATEGORIES[0]) return 'bg-sky-500'
        if (inst.category === INSTRUMENT_CATEGORIES[1]) return 'bg-red-500'
        if (inst.category === INSTRUMENT_CATEGORIES[2]) return 'bg-green-500'
        return 'bg-transparent'
    }
    const onInstCellClick = (
        sectionIndex: number,
        foundIndex: number,
        inst: UserSongInstrument
    ) => {
        const newSections = [...sections]
        if (foundIndex !== -1) {
            //sectionsにある場合、section.instrumentsからfoundIndexを削除する
            newSections[sectionIndex].instruments.splice(foundIndex, 1)
        } else {
            //sectionsにない場合、instrumentを追加する
            newSections[sectionIndex].instruments.push(inst)
        }
        return onClick(newSections)
    }
    return (
        <div className="flex">
            {column.map((value, index) => renderColumn2(value, index))}
        </div>
    )
}
export default SectionOverView
