import React, { useContext, useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import * as Types from 'types/music'
import { Tag, UserSong, TagUI } from 'types/'
import { getTags, saveTags } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'
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
