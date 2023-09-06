import React, { useEffect, useState, useContext } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    useNavigate,
} from 'react-router-dom'
import Modal from 'react-modal'
import { TERMS } from 'config/music'
import TAILWIND from 'config/tailwind'
import Detail from 'Pages/Detail'
import * as Types from 'types/music'
import {
    UserSong,
    Tag,
    UserSongSearchCondition,
    AudioRange,
    Genre,
    Order,
} from 'types/'
import { UserContext } from 'App'
import * as Utils from 'utils/music'
//import './App.css'
import { getUserSongs, getTags, deleteUserSong, getGenres } from 'API/request'
import { isAxiosError } from 'axios'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'
import SongSummary from 'Components/SongSummary'
import AudioPlayer from 'Components/AudioPlayer'
import { getDisplayName } from 'utils/front'
import SearchField from 'Components/SearchField'
import lo from 'lodash'
import { Newspaper } from '@mui/icons-material'

const Health = () => {
    return <div>health!</div>
}

export default Health
