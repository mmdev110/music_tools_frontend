import { Genre } from 'types/'
import TagView2 from 'Pages/Modals/TagView2'

type Props = {
    closeModal: () => void
    onSaveGenres: (selected: Genre[], all: Genre[]) => void
    songGenres: Genre[]
    allGenres: Genre[]
}

const GenreModal = ({
    onSaveGenres,
    closeModal,
    songGenres,
    allGenres,
}: Props) => {
    return (
        <div>
            <h2>ジャンル編集</h2>
            <TagView2<Genre>
                onCancelButtonClick={closeModal}
                onSaveButtonClick={onSaveGenres}
                selectedTags={songGenres}
                allTags={allGenres}
            />
        </div>
    )
}

export default GenreModal
