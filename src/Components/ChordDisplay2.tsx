import React, { useState, useEffect } from 'react'
import { ALL_DEGREES, TERMS } from '../constants'
import * as Types from '../types'
import ChordProgression from '../Classes/ChordProgression'
import lo from 'lodash'
import OneChord from './OneChord'
import ScaleForm from './ScaleForm'

type Props = {
    scaleForm: Types.ScaleForm
}
const DefaultChordNames: string[] = [
    'CM7',
    'Am7',
    'Dm7',
    'G7',
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
const chordProgressionDefault: ChordProgression =
    ChordProgression.newFromChordNames(DefaultChordNames, 0, TERMS.MAJOR)
const ChordDisplay2 = (props: Props) => {
    //console.log('@@@@ChordDisplay')
    const [input, setInput] = useState(DefaultChordNames)
    const [progression, setProgression] = useState(chordProgressionDefault)
    const onChange = (index: number, chords: string) => {
        console.log('onchange at ChordDisplay')
        let newInput = input
        newInput[index] = chords
        setInput(newInput)
        console.log(newInput)
        updateProgression(newInput)
    }
    useEffect(() => {
        updateProgression(input)
    }, [props.scaleForm])
    const onReset = () => {
        const reset = lo.cloneDeep(ResetChordNames)
        setInput(reset)
        updateProgression(reset)
    }
    const updateProgression = (chordNames: string[]) => {
        const { root, scale } = props.scaleForm
        console.log({ chordNames })
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
                <div className="One-Bar">
                    {chunk.map((chord, index2) => {
                        const { degree, detail, characteristics } = chord
                        const { scaleForm } = props
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
        <div className="Chord-Display">
            <button onClick={onReset}>reset</button>
            {render()}
        </div>
    )
}
export default ChordDisplay2
