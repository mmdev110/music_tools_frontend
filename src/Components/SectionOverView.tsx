import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'
import { AudioRange, UserSongSection, UserSongInstrument } from 'types/front'
import { INSTRUMENT_CATEGORIES } from 'config/front'
import { Button, Input } from 'Components/HTMLElementsWrapper'

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
    const [row, setRow] = useState<(UserSongInstrument | string)[]>([]) //横軸
    const [column, setColumn] = useState<(UserSongSection | string)[]>([]) //縦軸

    useEffect(() => {
        const rowValues: (UserSongInstrument | string)[] = [
            'sectionname',
            'play',
            'copy',
        ] //section名、再生ボタンの分を空けておく
        INSTRUMENT_CATEGORIES.forEach((categ) => {
            const filtered = instruments.filter(
                (inst) => inst.category === categ
            )
            rowValues.push(...filtered)
        })
        setRow(rowValues)
    }, [instruments])
    useEffect(() => {
        setColumn(['instname', ...sections]) //inst名表示部分を開けておく
    }, [sections])

    const renderColumn = (
        valueCol: UserSongSection | string,
        indexCol: number
    ) => {
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
                            value = inst.name || ''
                        } else {
                            const indexInst = indexRow - 2
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
                                value = section.audioPlaybackRange ? (
                                    <Button
                                        onClick={() => {
                                            onClickPlayButton(
                                                section.audioPlaybackRange
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
                                value = section.audioPlaybackRange ? (
                                    <Button
                                        onClick={() => {
                                            const indexSec = indexCol - 1
                                            if (indexSec > 0) {
                                                const newSections = [
                                                    ...sections,
                                                ]
                                                newSections[indexSec] =
                                                    structuredClone(
                                                        newSections[
                                                            indexSec - 1
                                                        ]
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
                            }
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
