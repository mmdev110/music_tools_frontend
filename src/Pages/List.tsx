import React, { useEffect, useState } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    useNavigate,
} from 'react-router-dom'
import Modal from 'react-modal'
import { TERMS } from 'config/music'
import Detail from 'Pages/Detail'
import * as Types from 'types/music'
import { UserSong, Tag, UserSongSearchCondition, AudioRange } from 'types/'
import * as Utils from 'utils/music'
//import './App.css'
import { getUserSongs, getTags, deleteUserSong } from 'API/request'
import { isAxiosError } from 'axios'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'
import SongSummary from 'Components/SongSummary'
import AudioPlayer from 'Components/AudioPlayer'
import { getDisplayName } from 'utils/front'
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
type TagUI = Tag & {
    isSelected: boolean
}
const List = () => {
    const navigate = useNavigate()
    const [userSongs, setUserSongs] = useState<UserSong[]>([])
    const [allTags, setAllTags] = useState<TagUI[]>([])
    const [isFiltering, setIsFiltering] = useState(false)
    const selectTag = async (index: number) => {
        const newTags = [...allTags]
        newTags[index].isSelected = !newTags[index].isSelected
        setAllTags(newTags)
        //songsを再検索
        const selected = newTags.filter((tag) => tag.isSelected)
        setIsFiltering(selected.length > 0)
        const selectedTagIds = selected.map((tag) => tag.id!)
        await loadSongs({ tagIds: selectedTagIds })
    }
    const loadSongs = async (condition: UserSongSearchCondition) => {
        try {
            const data = await getUserSongs(condition)
            if (data) setUserSongs(data)
            //console.log(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    const loadAllTags = async () => {
        try {
            const responseTags = await getTags()

            const t: TagUI[] = responseTags.map((tag) => {
                return {
                    ...tag,
                    isSelected: false,
                }
            })
            setAllTags(t)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        loadSongs({})
        loadAllTags()
    }, [])
    const navigateNew = (duplicateFromId: number | null) => {
        if (duplicateFromId) {
            //パラメータを複製して新規作成
            navigate('/edit/new', { state: { id: duplicateFromId } })
        } else {
            navigate('/edit/new')
        }
    }
    const move = (song: UserSong) => {
        navigate(`/edit/${song.id}`)
    }
    const play = (song: UserSong) => {
        console.log('play')
        console.log(song)
        const userAudio = song.audio
        if (!userAudio) return
        setAudio({
            name: userAudio.name,
            url: userAudio.url.get,
        })
        setMediaRange({
            //listページではrange無効
            start: 0,
            end: 0,
        })
    }
    const [mediaRange, setMediaRange] = useState<AudioRange>({
        start: 0,
        end: 0,
    })
    const [audio, setAudio] = useState<Audio>({ url: '', name: '' })
    const renderTags = () => {
        return (
            <div className="flex flex-row gap-x-1">
                {allTags.map((tag, index) => {
                    return isTagUsed(tag) ? (
                        <Button
                            key={'tagbtn' + index.toString()}
                            bgColor={
                                tag.isSelected ? 'bg-sky-500' : 'bg-sky-300'
                            }
                            onClick={() => selectTag(index)}
                        >
                            {tag.name}
                        </Button>
                    ) : null
                })}
            </div>
        )
    }
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
            name: '設定をコピーして新規作成',
            onClick: (input: UserSong) => {
                navigateNew(input.id!)
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
                <div>YOUR LOOPS</div>
                <div>
                    <Button onClick={() => navigateNew(null)}>New</Button>
                </div>
                {renderTags()}
                <div className="flex flex-col gap-y-5">
                    {userSongs.length ? (
                        userSongs.map((song) => {
                            return (
                                <SongSummary
                                    key={`song${song.id!.toString()}`}
                                    song={song}
                                    onInfoClick={move}
                                    onPlayButtonClick={play}
                                    onClickX={toggleConfirmationModal}
                                    menuItems={MENU_ITEMS}
                                />
                            )
                        })
                    ) : (
                        <div>NO LOOPS. LET'S CREATE ONE!!</div>
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
