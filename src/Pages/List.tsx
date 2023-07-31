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
const ModalStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
}
type Audio = {
    name: string
    url: string
}
const SearchConditionInit: UserSongSearchCondition = {
    userIds: [],
    tagIds: [],
    genreIds: [],
    sectionName: '',
    orderBy: 'created_at',
    ascending: true,
}

const orders: Order[] = [
    { displayString: '作成日-昇順', orderBy: 'created_at', ascending: true },
    { displayString: '作成日-降順', orderBy: 'created_at', ascending: false },
    {
        displayString: '最後に編集した-昇順',
        orderBy: 'last_modified_at',
        ascending: true,
    },
    {
        displayString: '最後に編集した-降順',
        orderBy: 'last_modified_at',
        ascending: false,
    },
    {
        displayString: '最後に見た-昇順',
        orderBy: 'last_viewed_at',
        ascending: true,
    },
    {
        displayString: '最後に見た-降順',
        orderBy: 'last_viewed_at',
        ascending: false,
    },
    { displayString: '見た回数-昇順', orderBy: 'view_times', ascending: true },
    { displayString: '見た回数-降順', orderBy: 'view_times', ascending: false },
]

const List = () => {
    const navigate = useNavigate()
    const user = useContext(UserContext)
    const [userSongs, setUserSongs] = useState<UserSong[]>([])
    const [allTags, setAllTags] = useState<Tag[]>([])
    //const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    const [allGenres, setAllGenres] = useState<Genre[]>([])
    const [searchCondition, setSearchCondition] =
        useState<UserSongSearchCondition>(SearchConditionInit)
    //const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])
    const [isFiltering, setIsFiltering] = useState(false)

    const loadSongs = async (condition: UserSongSearchCondition) => {
        try {
            const data = await getUserSongs(condition)
            setUserSongs(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllTags = async () => {
        try {
            const responseTags = await getTags()
            setAllTags(responseTags)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllGenres = async () => {
        try {
            const responseGenres = await getGenres()

            setAllGenres(responseGenres)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        if (user) {
            const newCond = { ...searchCondition }
            newCond.userIds = [user.userId]
            setSearchCondition(newCond)
            loadAllTags()
            loadAllGenres()
        }
    }, [user])
    useEffect(() => {
        console.log(searchCondition)
        if (searchCondition.userIds.length > 0) loadSongs(searchCondition)
    }, [searchCondition])
    const navigateNew = (duplicateFromId: number | null) => {
        if (duplicateFromId) {
            //パラメータを複製して新規作成
            navigate('/edit/new', { state: { id: duplicateFromId } })
        } else {
            navigate('/edit/new')
        }
    }
    const move = (song: UserSong) => {
        navigate(`/edit/${song.uuid}`)
    }

    const [isPlayingAudio, setIsPlayingAudio] = useState(false) //このstateを変化させることで再生停止を切り替える
    const play = (song: UserSong, range: AudioRange) => {
        console.log('play')
        console.log(song)
        const userAudio = song.audio
        if (!userAudio) return
        const audioChanged = audio.url !== userAudio.url.get
        const rangeChanged = !lo.isEqual(mediaRange, range)
        setAudio({
            name: userAudio.name,
            url: userAudio.url.get,
        })
        setMediaRange(range)
        //変更があれば再生、変更がなければ再生停止を切り替え
        const newFlag = audioChanged || rangeChanged ? true : !isPlayingAudio
        setIsPlayingAudio(newFlag)
    }
    const [mediaRange, setMediaRange] = useState({
        start: 0,
        end: 0,
    })
    const [audio, setAudio] = useState<Audio>({ url: '', name: '' })

    const isTagUsed = (tag: Tag): boolean => {
        //tagが、現在のuserSongsに使われているものを探す
        for (const song of userSongs) {
            const tags = song.tags
            const found = tags.find((ult) => ult.id === tag.id)
            if (found) return true
        }
        return false
    }

    //modal周り
    const [modalIsOpen, setIsOpen] = React.useState(false)

    const closeModal = () => {
        setIsOpen(false)
    }
    const [songToDelete, setSongToDelete] = useState<UserSong>()
    const toggleConfirmationModal = (selectedSong: UserSong) => {
        setSongToDelete(selectedSong)
        setIsOpen(true)
    }
    const execDelete = async (input: UserSong) => {
        console.log(input)
        //console.log(window.localStorage.getItem('access_token'))
        const data = await deleteUserSong(input.id!)
        closeModal()
        window.location.reload()
    }

    const MENU_ITEMS = [
        {
            name: '編集',
            onClick: (input: UserSong) => {
                move(input)
            },
        },
        {
            name: '削除',
            onClick: (input: UserSong) => {
                toggleConfirmationModal(input)
            },
        },
    ]
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>YOUR SONGS</div>
                <div>
                    <Button onClick={() => navigateNew(null)}>New</Button>
                </div>
                <SearchField
                    hideViewType={true}
                    tags={allTags}
                    genres={allGenres}
                    onTagsChange={(newTags) => {
                        const newSearchCondition = { ...searchCondition }
                        newSearchCondition.tagIds = newTags.map((t) => t.id!)
                        setSearchCondition(newSearchCondition)
                    }}
                    onGenresChange={(newGenres) => {
                        const newSearchCondition = { ...searchCondition }
                        newSearchCondition.tagIds = newGenres.map((g) => g.id!)
                        setSearchCondition(newSearchCondition)
                    }}
                    orders={orders}
                    onOrderChange={(newOrder: Order) => {
                        console.log(newOrder)
                        const newSearchCondition = { ...searchCondition }
                        newSearchCondition.orderBy = newOrder.orderBy
                        newSearchCondition.ascending = newOrder.ascending
                        setSearchCondition(newSearchCondition)
                    }}
                />
                <div className={`flex flex-col`}>
                    {userSongs.length ? (
                        userSongs.map((song, index) => {
                            return (
                                <SongSummary
                                    key={index}
                                    song={song}
                                    onPlayButtonClick={play}
                                    onClickX={toggleConfirmationModal}
                                    menuItems={MENU_ITEMS}
                                    viewType={{
                                        name: 'overview',
                                        sortOrder: 0,
                                    }}
                                />
                            )
                        })
                    ) : (
                        <div>NO SONGS. LET'S CREATE ONE!!</div>
                    )}
                </div>
            </div>
            {audio.url !== '' && (
                <AudioPlayer
                    dropDisabled={true}
                    audioUrl={audio.url}
                    mini={true}
                    autoPlay
                    isHLS={true}
                    range={mediaRange}
                    toggle={isPlayingAudio}
                />
            )}
            <Modal
                isOpen={modalIsOpen}
                //onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={ModalStyle}
                contentLabel="Example Modal"
            >
                <Confirmation
                    onOK={execDelete}
                    onCancel={closeModal}
                    input={songToDelete}
                />
            </Modal>
        </BasicPage>
    )
}
type ConfirmationProps = {
    input?: UserSong
    onCancel: () => void
    onOK: (input: UserSong) => void
}
const Confirmation = ({ input, onCancel, onOK }: ConfirmationProps) => {
    const onClickExec = () => {
        if (input) onOK(input)
    }
    return input ? (
        <div>
            <div>削除確認</div>
            <div>{getDisplayName(input)}を削除しますか？</div>
            <div>
                <Button onClick={onClickExec}>削除</Button>
                <Button onClick={onCancel}>キャンセル</Button>
            </div>
        </div>
    ) : (
        <div>削除するループが見つかりませんでした。</div>
    )
}

export default List
