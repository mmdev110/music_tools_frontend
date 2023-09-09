import { Tag } from 'types/'
import TagView2 from 'Pages/Modals/TagView2'

type Props = {
    closeModal: () => void
    onSaveTags: (selected: Tag[], all: Tag[]) => void
    songTags: Tag[]
    allTags: Tag[]
}

const TagModal = ({ onSaveTags, closeModal, songTags, allTags }: Props) => {
    return (
        <div>
            <h2>タグ編集</h2>
            <TagView2<Tag>
                onCancelButtonClick={closeModal}
                onSaveButtonClick={onSaveTags}
                selectedTags={songTags}
                allTags={allTags}
            />
        </div>
    )
}

export default TagModal
