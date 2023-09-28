import React, { useState, useEffect } from 'react'
import * as Types from '../types/music'
import ChordProgression from '../Classes/ChordProgression'
import lo from 'lodash'
import OneChord from './OneChord'
import OneRelation from './OneRelation'

type Props = {
    scaleForm: Types.ScaleFormType
    onProgressionsChange: (progressions: string[]) => void
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
    const [progression, setProgression] = useState<ChordProgression>(
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
    }, [
        scaleForm.root, //scaleFormを入れるとrender毎に走ってしまうので、分解している
        scaleForm.scale,
        scaleForm.transposeRoot,
        progressionNames,
    ])
    const onReset = () => {
        const reset = lo.cloneDeep(ResetChordNames)
        onProgressionsChange(reset)
        updateProgression(reset)
    }
    const updateProgression = (chordNames: string[]) => {
        //console.log('updateprogression')
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
                    className="flex justify-around border-t-4 border-black first:border-t-0 "
                >
                    {chunk.map((chord, index2) => {
                        const { degree, detail, characteristics } = chord
                        //const { scaleForm } = props
                        let degreeName: string = chord.getDegreeName()
                        let transposed = ''
                        if (scaleForm.transposeRoot) {
                            const [newRoot, newOn] = chord.getTransposedRoot(
                                scaleForm.root,
                                scaleForm.transposeRoot,
                                scaleForm.scale
                            )
                            transposed = newRoot + chord.detail.quality
                            if (newOn) transposed += '/' + newOn
                        }
                        const noteIntervals = chord.getNoteIntervals()

                        return (
                            <div
                                key={index2}
                                className="flex basis-1/4 flex-row"
                            >
                                <OneChord
                                    chord={chord.name}
                                    degree={degreeName}
                                    chara_itself={characteristics.itself}
                                    index={index * 4 + index2}
                                    transposedChord={transposed}
                                    onChange={onChange}
                                    noteIntervals={noteIntervals}
                                />
                                <OneRelation
                                    chara_relation={characteristics.relation}
                                />
                            </div>
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
