import React, { useContext, useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import * as Types from 'types/music'
import { Genre } from 'types/'
import { getGenres, saveGenres } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'
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
