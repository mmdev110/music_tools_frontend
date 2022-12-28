import React, { useState, useEffect } from 'react'
import { ALL_DEGREES, TERMS } from '../config/music'
import * as Types from '../types/music'
import ChordProgression from '../Classes/ChordProgression'
import lo from 'lodash'
import OneChord from './OneChord'
import ScaleForm from './ScaleForm'

type Props = {
    scaleForm: Types.ScaleFormType
    onProgressionsChange: Function
    progressionNames: string[]
}
const ResetChordNames: string[] = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
]

const ChordDisplay2 = ({
    progressionNames,
    onProgressionsChange,
    scaleForm,
}: Props) => {
    //console.log('@@@@ChordDisplay')
    const [progression, setProgression] = useState(
        ChordProgression.newFromChordNames(
            ResetChordNames,
            scaleForm.root,
            scaleForm.scale
        )
    )
    const onChange = (index: number, chords: string) => {
        let newInput = progressionNames
        newInput[index] = chords
        //親のstate更新
        onProgressionsChange(newInput)
        //degree等を更新
        updateProgression(newInput)
    }
    useEffect(() => {
        updateProgression(progressionNames)
    }, [scaleForm, progressionNames])
    const onReset = () => {
        const reset = lo.cloneDeep(ResetChordNames)
        onProgressionsChange(reset)
        updateProgression(reset)
    }
    const updateProgression = (chordNames: string[]) => {
        const { root, scale } = scaleForm
        const newProgression = ChordProgression.newFromChordNames(
            chordNames,
            root,
            scale
        )
        newProgression.analyzeChordProgression()
        setProgression(newProgression)
    }
    const render = () => {
        const chunkBy4 = lo.chunk(progression.chords, 4)
        return chunkBy4.map((chunk, index) => {
            return (
                <div
                    key={index}
                    className="flex grow justify-around border-t-4 border-black first:border-t-0 "
                >
                    {chunk.map((chord, index2) => {
                        const { degree, detail, characteristics } = chord
                        //const { scaleForm } = props
                        let degreeName: string = ''
                        if (degree.root !== -1) {
                            degreeName =
                                ALL_DEGREES[degree.root].degree + detail.quality
                            if (degree.on !== -1)
                                degreeName +=
                                    '/' + ALL_DEGREES[degree.on].degree
                        }
                        let transposed = '-'
                        if (scaleForm.transposeRoot) {
                            const [newRoot, newOn] = chord.getTransposedRoot(
                                scaleForm.root,
                                scaleForm.transposeRoot,
                                scaleForm.scale
                            )
                            transposed = newRoot + chord.detail.quality
                            if (newOn) transposed += '/' + newOn
                        }

                        return (
                            <OneChord
                                key={index2}
                                chord={chord.name}
                                degree={degreeName}
                                chara_itself={characteristics.itself}
                                chara_relation={characteristics.relation}
                                index={index * 4 + index2}
                                transposedChord={transposed}
                                onChange={onChange}
                            />
                        )
                    })}
                </div>
            )
        })
    }
    return (
        <div className="w-full">
            <button onClick={onReset}>reset</button>
            <div className="flex flex-col rounded-xl border-4 border-black">
                {render()}
            </div>
        </div>
    )
}
export default ChordDisplay2
