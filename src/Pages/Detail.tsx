import React, {
    useEffect,
    useState,
    useContext,
    useRef,
    SyntheticEvent,
} from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    useParams,
    useLocation,
} from 'react-router-dom'
import Modal from 'react-modal'
import ScaleForm from 'Components/ScaleForm'
import ScaleDisplay from 'Components/ScaleDisplay'
import ChordDisplay from 'Components/ChordDisplay2'
import Intervals from 'Components/Intervals'
import Section from 'Components/Section'
import Modes from 'Components/Modes'
import SequenceAnalyzer from 'Components/SequenceAnalyzer'
import MidiMonitorDescription from 'Components/MidiMonitorDescription'
import MidiMonitor from 'Components/MidiMonitor'
import AudioPlayer from 'Components/AudioPlayer'
import TagModal from 'Pages/Modals/Tag'
import GenreModal from 'Pages/Modals/Genre'
import ChordModal from 'Pages/Modals/Chord'
import Memo from 'Components/Memo'
import MediaRangeForm from 'Components/MediaRangeForm'
import { TERMS } from 'config/music'
import {
    User,
    Tag,
    ScaleFormType,
    AudioRange,
    UserSongSection,
    Genre,
    AudioState,
} from 'types'
import { UserSong } from 'types'
import {
    getFromS3,
    getUserSong,
    saveUserSong,
    uploadToS3,
    getTags,
    getGenres,
    saveTags,
    saveGenres,
} from 'API/request'
import * as Utils from 'utils/music'
import { adjustSortOrder } from 'utils/front'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'
import Song from 'Components/Song'
import { songInit, sectionInit } from 'config/front'

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

Modal.setAppElement('#root')
const Detail = () => {
    let { uuid } = useParams()
    const user = useContext(UserContext)
    const userRef = useRef<User | null>()
    useEffect(() => {
        userRef.current = user
    }, [user])

    //編集前の状態
    const [oldState, setOldState] = useState<UserSong>(
        structuredClone(songInit)
    )
    //編集中の状態
    const [userSong, setUserSong] = useState<UserSong>(
        structuredClone(songInit)
    )

    //audio, droppedAudio
    const [droppedAudio, setDroppedAudio] = useState<File>()

    const onDropAudio = (acceptedFiles: File[]) => {
        const file: File = acceptedFiles[0]
        setDroppedAudio(file)
        //URL.createObjectURL(file)
        setUserSong({
            ...userSong,
            audio: {
                name: file.name,
                url: { get: '', put: '' },
            },
        })
    }

    //MidiFile
    const [midiFiles, setMidiFiles] = useState<File[]>([])
    const onDropMidi = (sectionIndex: number, file: File) => {
        const newFiles = [...midiFiles]
        newFiles[sectionIndex] = file
        setMidiFiles(newFiles)
    }

    const save = async () => {
        console.log('@@@@save')
        const userSong = songRef.current!
        //sortOrderを配列のindexに合わせる
        adjustSortOrder(userSong.sections)
        //保存
        let response: UserSong | undefined
        try {
            const userSongId = uuid === 'new' ? 'new' : String(userSong.id!)
            response = await saveUserSong(userSong, userSongId)
            console.log(response)
            if (response) {
                setUserSong(structuredClone(response))
                setOldState(structuredClone(response))
            }
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
        console.log(response)
        if (response) {
            try {
                const audio = response.audio
                console.log(audioFileRef)
                console.log(audio)
                if (audio && audio.url.put && audioFileRef.current) {
                    //s3へのアップロード
                    const response = await uploadToS3(
                        audio.url.put,
                        audioFileRef.current
                    )
                    console.log('@@@upload finished')
                    console.log(response)
                }
                //midiアップロード
                //const midi = response.userLoopMidi
                ////TODO:常にアップロードされるので対策考える
                ////S3から拾ったものとドロップされたもの両方midiFileに格納してしまうため
                //if (midi && midi.url.put && midiFile) {
                //    console.log('upload midi')
                //    await uploadToS3(midi.url.put, midiFile)
                //}
            } catch (err) {
                if (isAxiosError(err)) console.log(err)
            }
            //await load(response.id!)
        }
    }
    const load = async (uuid: string) => {
        const response = await getUserSong(uuid)
        console.log('@@URI', response)
        //編集前の状態を保存しておく
        setOldState(structuredClone(response))
        setUserSong(structuredClone(response))

        const audio = response.audio
        //audio, midiのロード
        try {
            if (audio && audio.url.get) {
                console.log(audio.url.get)
            }
            for (let i = 0; i < response.sections.length; i++) {
                const midi = response.sections[i].midi
                if (midi && midi.url.get) {
                    const response = await getFromS3(midi.url.get)
                    const blob = await response.blob()
                    const file = new File([blob], midi.name)
                    onDropMidi(i, file)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        console.log({ uuid })
        if (uuid && uuid !== 'new') {
            //edit/:userSongIdのとき
            load(uuid)
            loadAllTags()
            loadAllGenres()
        }
    }, [])
    const handleBeforeUnload = () => {
        //ブラウザ更新時の保存処理
        console.log(`unload !!`)
        //console.log(oldState.title)
        //console.log('title: ', songRef.current!.title)
        //console.log('user: ', userRef.current)
        //console.log('isChanged: ', isChanged())
        if (userRef.current && isChanged()) save()
    }
    useEffect(() => {
        //ブラウザ更新、閉じた時の保存処理
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            //アンマウント時の保存処理
            if (userRef.current && isChanged()) save()
        }
    }, [])
    const songRef = useRef<UserSong>()
    useEffect(() => {
        songRef.current = userSong
    }, [userSong])
    const audioFileRef = useRef<File>()
    useEffect(() => {
        audioFileRef.current = droppedAudio
    }, [droppedAudio])

    const isChanged = (): boolean => {
        return !lo.isEqual(oldState, songRef.current)
    }

    const onSectionChange = (index: number, newSection: UserSongSection) => {
        //console.log('@@@onsectionchange')
        const sections = [...userSong.sections]
        sections[index] = newSection
        //console.log(sections)
        setUserSong({ ...userSong, sections })
    }
    const onSongChange = (newSong: UserSong) => {
        setUserSong({ ...newSong })
    }
    const [tags, setTags] = useState<Tag[]>([])
    const loadAllTags = async () => {
        try {
            const tags = await getTags()
            setTags(tags)
        } catch (e) {
            console.log(e)
        }
    }
    const onSaveTags = async (selected: Tag[], all: Tag[]) => {
        const isTagsChanged = (): boolean => {
            const A = all.map((e) => e.name)
            const B = tags.map((e) => e.name)
            return !lo.isEqual(A, B)
        }
        //userIdを付与
        all = all.map((t) => {
            t.userId = user?.userId
            return t
        })
        selected = selected.map((t) => {
            t.userId = user?.userId
            return t
        })
        //tagsに存在しないものがあれば保存
        if (isTagsChanged()) {
            try {
                all = await saveTags(all)
                //tags更新
                setTags(all)
            } catch (e) {
                console.log(e)
            }
        }
        //userSongの更新
        //全てのタグの中から、isSelectedのものをuserSongに追加
        const songTags = all.filter((tag) => {
            const isSelected = selected.find((ui) => ui.name === tag.name)
            return isSelected
        })
        setUserSong({ ...userSong, tags: songTags })
    }

    const [genres, setGenres] = useState<Genre[]>([])
    const loadAllGenres = async () => {
        try {
            const genres = await getGenres()
            setGenres(genres)
        } catch (e) {
            console.log(e)
        }
    }
    const onSaveGenres = async (selected: Genre[], all: Genre[]) => {
        const isTagsChanged = (): boolean => {
            const A = all.map((e) => e.name)
            const B = genres.map((e) => e.name)
            return !lo.isEqual(A, B)
        }
        //userIdを付与
        all = all.map((t) => {
            t.userId = user?.userId
            return t
        })
        selected = selected.map((t) => {
            t.userId = user?.userId
            return t
        })
        //tagsに存在しないものがあれば保存
        if (isTagsChanged()) {
            try {
                all = await saveGenres(all)
                //tags更新
                setGenres(all)
            } catch (e) {
                console.log(e)
            }
        }
        //userSongの更新
        //全てのタグの中から、isSelectedのものをuserSongに追加
        const songTags = all.filter((tag) => {
            const isSelected = selected.find((ui) => ui.name === tag.name)
            return isSelected
        })
        setUserSong({ ...userSong, genres: songTags })
    }

    const test = () => {
        //console.log(droppedAudio)
        //console.log(userSong)
        console.log(isChanged())
    }
    return (
        <BasicPage>
            <div className="text-2xl">楽曲分析</div>
            <div>
                {user
                    ? 'データは自動保存されます'
                    : 'ログインすることで入力データやオーディオファイルを保存して、再度開くことができます'}
            </div>
            <Song
                user={user || undefined}
                song={userSong}
                tags={tags}
                onSaveTags={onSaveTags}
                genres={genres}
                onSaveGenres={onSaveGenres}
                showAudio={true}
                showGenres={true}
                showTags={true}
                showMidi={true}
                onSongChange={onSongChange}
                onSectionChange={onSectionChange}
                onDropAudio={onDropAudio}
                droppedAudio={droppedAudio}
            />
        </BasicPage>
    )
}

export default Detail
