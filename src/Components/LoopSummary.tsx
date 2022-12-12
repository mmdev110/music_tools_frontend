import react, { memo } from 'react'
import { Link } from 'react-router-dom'
import { UserLoopInput } from 'types'
import { ALL_NOTES, ALL_DEGREES } from 'Constants'
import { Button } from 'Components/HTMLElementsWrapper'
import ChordProgression from 'Classes/ChordProgression'
import Chord from 'Classes/Chord'
import lo from 'lodash'
type Props = {
    input: UserLoopInput
    onPlayButtonClick: (input: UserLoopInput) => void
    onInfoClick: (input: UserLoopInput) => void
}
const LoopSummary = ({ input, onPlayButtonClick, onInfoClick }: Props) => {
    const note = ALL_NOTES[input.key]
    const onButtonClick = () => {
        onPlayButtonClick(input)
    }
    const onClick = () => {
        onInfoClick(input)
    }
    const degrees = input.progressions.map((name) => {
        if (name === '') return name
        const chord = Chord.newFromChordName(name)
        chord._calcDegree(input.key)
        return chord.getDegreeName()
    })
    const formatProgressions = (progressions: string[]): string => {
        let str = ''
        const chunkBy4 = lo.chunk(progressions, 4)
        chunkBy4.forEach((chord4) => {
            const containsChord = chord4.find((chord) => chord !== '')
            if (containsChord) {
                str += '['
                str += chord4.join(', ')
                str += ']\n'
            }
        })
        return str
    }

    return (
        <div className="flex w-full justify-between rounded-md border-2 border-black">
            <div
                className="flex h-full w-full justify-between"
                onClick={onClick}
            >
                <div className="w-1/5  overflow-y-clip break-words border-r-2 border-black">
                    {input.userLoopAudio.name || 'name'}
                </div>
                <div className="w-1/12 border-r-2 border-black">
                    <div>{note.flat}</div>
                    <div>{input.scale}</div>
                </div>
                <div className="w-1/3 whitespace-pre-wrap border-r-2 border-black">
                    <div>{formatProgressions(input.progressions)}</div>
                    <div>{formatProgressions(degrees)}</div>
                </div>
                <div className="w-1/3 overflow-y-clip whitespace-pre-wrap break-words border-r-2 border-black">
                    {input.memo || ''}
                </div>
            </div>
            <div className="min-h-full w-12">
                {input.userLoopAudio.url.get === '' ? (
                    <Button className="h-full w-full rounded bg-red-400 font-bold text-white">
                        ×
                    </Button>
                ) : (
                    <Button
                        className="h-full w-full rounded bg-sky-500 px-4 font-bold text-white"
                        onClick={onButtonClick}
                    >
                        ▷
                    </Button>
                )}
            </div>
        </div>
    )
}

export default LoopSummary
