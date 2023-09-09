import { Genre, UserSongInstrument } from 'types/'
import InstrumentsView from 'Pages/Modals/InstrumentsView'

type Props = {
    closeModal: () => void
    onSave: (
        selected: UserSongInstrument[],
        tagList: UserSongInstrument[]
    ) => void
    currentInstruments: UserSongInstrument[]
    allInstruments: UserSongInstrument[]
}

const InstrumentsModal = ({
    onSave,
    closeModal,
    currentInstruments,
    allInstruments,
}: Props) => {
    return (
        <div>
            <h2>instruments編集</h2>
            <InstrumentsView<UserSongInstrument>
                onCancelButtonClick={closeModal}
                onSaveButtonClick={onSave}
                selectedTags={currentInstruments}
                allTags={allInstruments}
            />
        </div>
    )
}

export default InstrumentsModal
