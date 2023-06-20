import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'
import { AudioRange, UserSongSection, UserSongInstrument } from 'types/front'
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

    const renderColumn = (
        valueCol: UserSongSection | string,
        indexCol: number
    ) => {
        //kusosugi
        return (
            <div className="flex basis-20 flex-col" key={indexCol}>
                {row.map((valueRow, indexRow) => {
                    let value: React.ReactNode = ''
                    let style = 'text-sm border-2 basis-12 border-black'
                    let onCellClick = () => {}
                    if (typeof valueRow !== 'string') {
                        const inst = valueRow as UserSongInstrument
                        if (valueCol === 'instname') {
                            //左端
                            value = (
                                <OneTag
                                    color={'bg-gray-400'}
                                    onClick={() => {}}
                                    onRightClick={() => {}}
                                    name={inst.name}
                                    tooltipText={inst.memo}
                                />
                            )
                        } else {
                            //const indexInst = indexRow - 2
                            const indexSec = indexCol - 1
                            const foundIndex = sections[
                                indexSec
                            ].instruments.findIndex(
                                (instSec) => instSec.name === inst.name
                            )
                            let bgcolor = 'bg-transparent'
                            if (foundIndex !== -1) {
                                //存在する場合、背景色を変える
                                if (inst.category === INSTRUMENT_CATEGORIES[0])
                                    bgcolor = 'bg-sky-500'
                                if (inst.category === INSTRUMENT_CATEGORIES[1])
                                    bgcolor = 'bg-red-500'
                                if (inst.category === INSTRUMENT_CATEGORIES[2])
                                    bgcolor = 'bg-green-500'
                            }

                            style += ` ${bgcolor} `
                            onCellClick = () => {
                                const newSections = [...sections]
                                if (foundIndex !== -1) {
                                    //sectionsにある場合、foundIndexを削除する
                                    newSections[indexSec].instruments.splice(
                                        foundIndex,
                                        1
                                    )
                                } else {
                                    //sectionsにない場合、instrumentを追加する
                                    newSections[indexSec].instruments.push(inst)
                                }
                                onClick(newSections)
                            }
                        }
                    } else {
                        if (valueCol !== 'instname') {
                            const section = valueCol as UserSongSection
                            //instがない=上部の2列分の表示
                            if (valueRow === 'sectionname') {
                                //sectionName
                                value = section.section
                            } else if (valueRow === 'play') {
                                //再生ボタン
                                value = section.audioRanges[0] ? (
                                    <Button
                                        onClick={() => {
                                            onClickPlayButton(
                                                section.audioRanges[0]
                                            )
                                        }}
                                    >
                                        ▷
                                    </Button>
                                ) : (
                                    ''
                                )
                            } else if (valueRow === 'copy') {
                                //コピーボタン
                                value = section.audioRanges[0] ? (
                                    <Button
                                        onClick={() => {
                                            const indexSec = indexCol - 1
                                            if (indexSec > 0) {
                                                const newSections = [
                                                    ...sections,
                                                ]
                                                newSections[
                                                    indexSec
                                                ].instruments = structuredClone(
                                                    newSections[indexSec - 1]
                                                        .instruments
                                                )
                                                onClick(newSections)
                                            }
                                        }}
                                    >
                                        copy
                                    </Button>
                                ) : (
                                    ''
                                )
                            } else if (valueRow === 'bars') {
                                value = section.barLength
                            }
                        } else {
                            value =
                                valueRow === 'bars'
                                    ? 'bars'
                                    : valueRow === 'sectionname'
                                    ? ''
                                    : ''
                        }
                    }

                    return (
                        <div
                            key={indexRow}
                            className={style}
                            onClick={onCellClick}
                        >
                            {value}
                        </div>
                    )
                })}
            </div>
        )
    }
    return (
        <div className="flex">
            {column.map((value, index) => renderColumn(value, index))}
        </div>
    )
}
export default SectionOverView
