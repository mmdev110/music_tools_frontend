import { Button } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'

type Props = {
    closeModal: () => void
    noteIntervals: NoteIntervals
}

const ChordModal = ({ closeModal, noteIntervals }: Props) => {
    const cancel = () => {
        closeModal()
    }
    const renderInfo = () => {
        if (noteIntervals.length === 0) return
        //rootを一番下に表示させたい
        const rootIndex = noteIntervals.findIndex(
            (note) => note.interval === 'root'
        )
        const root = noteIntervals[rootIndex]
        return (
            <div className="flex flex-col items-center">
                {noteIntervals.map((info, index) => {
                    if (index !== rootIndex)
                        return (
                            <div key={info.noteName}>
                                {info.noteName}:{info.interval}
                            </div>
                        )
                })}
                <div>
                    {root.noteName}:{root.interval}
                </div>
            </div>
        )
    }
    return (
        <div>
            <div>コード詳細</div>
            {renderInfo()}
            <Button onClick={cancel}>cancel</Button>
        </div>
    )
}

export default ChordModal
