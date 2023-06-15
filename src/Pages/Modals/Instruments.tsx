import React, { useContext, useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import * as Types from 'types/music'
import { Genre, TagUI, UserSongInstrument } from 'types/'
import { getGenres, saveGenres } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'
import TagView2 from 'Pages/Modals/TagView2'

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
            <TagView2<UserSongInstrument>
                onCancelButtonClick={closeModal}
                onSaveButtonClick={onSave}
                selectedTags={currentInstruments}
                allTags={allInstruments}
            />
        </div>
    )
}

export default InstrumentsModal