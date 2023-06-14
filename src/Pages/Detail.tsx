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
    Tag,
    ScaleFormType,
    AudioRange,
    UserSongSection,
    Genre,
    AudioState,
    TagUI,
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
    let { userSongId } = useParams()
    const user = useContext(UserContext)

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
        console.log(userSong)
        //保存
        let response: UserSong | undefined
        try {
            response = await saveUserSong(userSong, userSongId!)
            console.log(response)
            if (response) {
                setUserSong(structuredClone(response))
                setOldState(structuredClone(response))
            }
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
        if (response) {
            try {
                const audio = response.audio
                console.log(droppedAudio)
                console.log(audio)
                if (audio && audio.url.put && droppedAudio) {
                    //s3へのアップロード
                    const response = await uploadToS3(
                        audio.url.put,
                        droppedAudio
                    )
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
    const load = async (id: number) => {
        const response = await getUserSong(id)
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
        const id_int = parseInt(userSongId!)
        const isNumber = !isNaN(id_int)
        if (isNumber) {
            //edit/:userSongIdのとき
            load(id_int)
            loadAllTags()
            loadAllGenres()
        }
    }, [])

    const isChanged = (): boolean => {
        return !lo.isEqual(oldState, userSong)
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
    const onSaveTags = async (tagUIs: TagUI[]) => {
        //TagUIからtagsをビルド
        let newTags: Tag[] = tagUIs.map((tagui, index): Tag => {
            const existingTag = tags.find((t) => tagui.name === t.name)
            return (
                existingTag || {
                    userId: user!.userId,
                    name: tagui.name,
                    sortOrder: index,
                }
            )
        })
        const isTagsChanged = (): boolean => {
            const A = newTags.map((e) => e.name)
            const B = tags.map((e) => e.name)
            console.log(A)
            console.log(B)
            return !lo.isEqual(A, B)
        }
        //tagsに存在しないものがあれば保存
        if (isTagsChanged()) {
            try {
                newTags = await saveTags(newTags)
                //tags更新
                setTags(newTags)
            } catch (e) {
                console.log(e)
            }
        }
        //userSongの更新
        const selectedUIs = tagUIs.filter((ui) => ui.isSelected)
        //全てのタグの中から、isSelectedのものをuserSongに追加
        const songTags = newTags.filter((tag) => {
            const isSelected = selectedUIs.find((ui) => ui.name === tag.name)
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
    const onSaveGenres = async (tagUIs: TagUI[]) => {
        //TagUIからgenresをビルド
        let newGenres: Genre[] = tagUIs.map((genreui, index): Genre => {
            const existinGgenre = genres.find((g) => genreui.name === g.name)
            return (
                existinGgenre || {
                    userId: user!.userId,
                    name: genreui.name,
                    sortOrder: index,
                }
            )
        })
        const isGenresChanged = (): boolean => {
            const A = newGenres.map((e) => e.name)
            const B = genres.map((e) => e.name)
            return !lo.isEqual(A, B)
        }
        //genresに存在しないものがあれば保存
        if (isGenresChanged()) {
            try {
                newGenres = await saveGenres(newGenres)
                //genres更新
                setGenres(newGenres)
            } catch (e) {
                console.log(e)
            }
        }
        //userSongの更新
        const selectedUIs = tagUIs.filter((ui) => ui.isSelected)
        //全てのタグの中から、isSelectedのものをuserSongに追加
        const songGenres = newGenres.filter((genre) => {
            const isSelected = selectedUIs.find((ui) => ui.name === genre.name)
            return isSelected
        })
        setUserSong({ ...userSong, genres: songGenres })
    }
    const test = () => {
        console.log(oldState)
        console.log(userSong)
        console.log(isChanged())
    }
    return (
        <BasicPage>
            <div className="text-2xl">Song Editor</div>
            <Button onClick={test}>test</Button>
            {user ? (
                <div>
                    <Button disabled={!isChanged()} onClick={save}>
                        save
                    </Button>
                </div>
            ) : null}
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
