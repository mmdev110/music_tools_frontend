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
    const [row, setRow] = useState<(UserSongInstrument | null)[]>([]) //横軸
    const [column, setColumn] = useState<(UserSongSection | null)[]>([]) //縦軸

    useEffect(() => {
        const rowValues: (UserSongInstrument | null)[] = [null, null] //section名、再生ボタンの分を空けておく
        INSTRUMENT_CATEGORIES.forEach((categ) => {
            const filtered = instruments.filter(
                (inst) => inst.category === categ
            )
            rowValues.push(...filtered)
        })
        setRow(rowValues)
    }, [instruments])
    useEffect(() => {
        setColumn([null, ...sections]) //inst名表示部分を開けておく
    }, [sections])

    const renderColumn = (indexCol: number) => {
        return (
            <div className="flex basis-20 flex-col" key={indexCol}>
                {row.map((inst, indexRow) => {
                    let value: React.ReactNode = ''
                    let style = 'text-sm border-2 basis-12 border-black'
                    let onCellClick = () => {}
                    if (inst) {
                        if (indexCol === 0) {
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
                        if (indexCol >= 1) {
                            console.log({ indexCol })
                            const section = sections[indexCol - 1]
                            //instがない=上部の2列分の表示
                            if (indexRow === 0) {
                                //sectionName
                                value = section.section
                            } else if (indexRow === 1) {
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
            {column.map((sectionName, index) => renderColumn(index))}
        </div>
    )
}
export default SectionOverView
