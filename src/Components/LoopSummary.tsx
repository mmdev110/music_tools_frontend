import react, { memo } from 'react'
import { Link } from 'react-router-dom'
import { UserLoopInput } from 'types'
import { ALL_NOTES, ALL_DEGREES } from 'config/music'
import { Button } from 'Components/HTMLElementsWrapper'
import ChordProgression from 'Classes/ChordProgression'
import Chord from 'Classes/Chord'
import lo from 'lodash'
import { getDisplayName } from 'utils/front'
type Props = {
    input: UserLoopInput
    onPlayButtonClick: (input: UserLoopInput) => void
    onInfoClick: (input: UserLoopInput) => void
    onClickX: (input: UserLoopInput) => void
}
const LoopSummary = ({
    input,
    onPlayButtonClick,
    onInfoClick,
    onClickX,
}: Props) => {
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
    const onClickXButton = () => {
        onClickX(input)
    }

    return (
        <div className="flex w-full flex-col rounded-md border-2 border-black">
            <div className="flex justify-between">
                <div className="overflow-x-clip break-words">
                    {getDisplayName(input)}
                </div>
                <div className="border-blacks w-12 justify-between border-l-2">
                    <Button
                        onClick={onClickXButton}
                        width="w-full"
                        bgColor="bg-red-500"
                    >
                        ×
                    </Button>
                </div>
            </div>
            <div className="flex justify-between border-t-2 border-black">
                <div
                    className="flex h-full w-full justify-between"
                    onClick={onClick}
                >
                    <div className="w-1/12 border-r-2 border-black">
                        <div>{note.flat}</div>
                        <div>{input.scale}</div>
                    </div>
                    <div className="w-1/5 whitespace-pre-wrap border-r-2 border-black">
                        <div>{formatProgressions(input.progressions)}</div>
                    </div>
                    <div className="w-1/5 whitespace-pre-wrap border-r-2 border-black">
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
        </div>
    )
}

export default LoopSummary
