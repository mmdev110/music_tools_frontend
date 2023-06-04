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
    Genre,
    User,
    ScaleFormType,
    AudioRange,
    UserSongSection,
    AudioState,
    TagUI,
} from 'types'
import { UserSong } from 'types'
import { getFromS3, getUserSong, saveUserSong, uploadToS3 } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'

const DefaultChordNames: string[] = [
    'CM7',
    'Am7',
    'Dm7',
    'G7',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
]
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
const sectionInit: UserSongSection = {
    section: '',
    progressions: DefaultChordNames,
    progressionsCsv: '',
    key: 0,
    scale: TERMS.MAJOR,
    bpm: 0,
    memo: '',
    audioPlaybackRange: {
        start: 0,
        end: 0,
    },
    midi: null,
    sortOrder: 0,
}
const songInit: UserSong = {
    title: '',
    artist: '',
    sections: [lo.clone(sectionInit)],
    memo: '',
    audio: null,
    tags: [],
    genres: [],
}
type Props = {
    user?: User
    song: UserSong
    tags?: Tag[]
    genres?: Genre[]
    showGenres: boolean
    showTags: boolean
    showAudio: boolean
    showMidi: boolean
    onDropAudio?: (files: File[]) => void
    droppedAudio?: File
    onDropMidi?: (sectionIndex: number, file: File) => void
    onSongChange: (newSong: UserSong) => void
    onSectionChange: (index: number, newSection: UserSongSection) => void
    onSectionAppendButtonClick?: (index: number) => void
    onSectionDeleteButtonClick?: (index: number) => void
    onSaveTags?: (tagUIs: TagUI[]) => void
    onSaveGenres?: (genreUIs: TagUI[]) => void
}
Modal.setAppElement('#root')
const Song = ({
    user,
    song,
    tags,
    genres,
    showGenres,
    showTags,
    showAudio,
    showMidi,
    onDropAudio,
    droppedAudio,
    onSongChange,
    onSectionChange,
    onDropMidi,
    onSaveTags,
    onSaveGenres,
}: Props) => {
    //tag modal
    const [tagModalIsOpen, setTagIsOpen] = React.useState(false)
    const showTagModal = () => {
        setTagIsOpen(true)
    }
    const closeTagModal = () => {
        setTagIsOpen(false)
    }
    //genre modal
    const [genreModalIsOpen, setGenreIsOpen] = React.useState(false)
    const showGenreModal = () => {
        setGenreIsOpen(true)
    }
    const closeGenreModal = () => {
        setGenreIsOpen(false)
    }
    //コード詳細 modal
    const [chordModalIsOpen, setChordIsOpen] = React.useState(false)
    const [noteIntervals, setNoteIntervals] = React.useState<NoteIntervals>([])
    const showChordModal = (info: NoteIntervals) => {
        setNoteIntervals(info)
        setChordIsOpen(true)
    }

    const closeChordModal = () => {
        setNoteIntervals([])
        setChordIsOpen(false)
    }
    const [audioState, setAudioState] = useState<AudioState>({
        currentTime_sec: 0,
        duration_sec: 0,
    })
    const onAudioMetadataLoaded = (event: any) => {
        const duration = Math.floor(event.target.duration as number)
        //durationが取れるので保存する
        setAudioState({ ...audioState, duration_sec: duration })
        //sectionsにendを設定
        const newSong = { ...song }
        for (const sec of newSong.sections) {
            if (sec.audioPlaybackRange.end === 0)
                sec.audioPlaybackRange.end = duration
        }
    }
    const onAudioTimeUpdate = (currentTime: number) => {
        setAudioState({
            ...audioState,
            currentTime_sec: Math.floor(currentTime),
        })
    }
    const [toggleAudioFlag, setToggleAudioFlag] = useState(false) //このstateを変化させることで再生停止を切り替える
    const appendNewSection = (index: number) => {
        console.log('@@@appendnew')
        //indexの後ろにsection追加
        const sections = [...song.sections]
        const newSection = structuredClone(sectionInit) as UserSongSection
        //ある程度の情報は引き継ぐ
        newSection.bpm = sections[index].bpm
        newSection.key = sections[index].key
        newSection.scale = sections[index].scale
        newSection.sortOrder = sections[index].sortOrder + 1
        newSection.audioPlaybackRange.start =
            sections[index].audioPlaybackRange.end
        newSection.audioPlaybackRange.end = audioState.duration_sec

        sections.splice(index + 1, 0, newSection)
        onSongChange({
            ...song,
            sections: sections,
        })
    }
    const deleteSection = (index: number) => {
        console.log('delete')
        if (song.sections.length <= 1) return
        const sections = [...song.sections]
        sections.splice(index, 1)
        onSongChange({ ...song, sections })
    }
    const isAudioLoaded = !!(droppedAudio || song.audio?.url.get !== '')
    const isHLS = !!song.audio?.url.get
    const [audioPlaybackRange, setAudioPlaybackRange] = useState<AudioRange>({
        start: 0,
        end: 0,
    })
    const playAudioWithRange = (range: AudioRange) => {
        if (!isAudioLoaded) return
        const isSameRange = lo.isEqual(audioPlaybackRange, range)

        if (isSameRange) {
            //再生停止を切り替え
            setToggleAudioFlag(!toggleAudioFlag)
        } else {
            //rangeを変更して再生
            setAudioPlaybackRange(range)
            setToggleAudioFlag(true)
        }
    }

    const test = () => {
        console.log(song)
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <Button onClick={test}>test</Button>
                <div className="text-2xl">title</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={song.title}
                    onChange={(str) => {
                        onSongChange({ ...song, title: str })
                    }}
                />
                <div className="text-2xl">artist</div>
                <Memo
                    className="h-6 w-1/4 border-2 border-sky-400"
                    memo={song.artist}
                    onChange={(str) => {
                        onSongChange({ ...song, artist: str })
                    }}
                />
                {user && showGenres ? (
                    <div className="flex flex-col gap-y-5">
                        <Button onClick={showGenreModal}>ジャンル編集</Button>
                        <div className="flex flex-row gap-x-4">
                            {song.genres.map((genre, index) => (
                                <Button key={index}>{genre.name}</Button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {user && showTags ? (
                    <div className="flex flex-col gap-y-5">
                        <Button onClick={showTagModal}>タグ編集</Button>
                        <div className="flex flex-row gap-x-4">
                            {song.tags.map((tag, index) => (
                                <Button key={index}>{tag.name}</Button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {showAudio ? (
                    <div>
                        <div className="text-2xl">AudioPlayer</div>
                        <div>
                            mp3, wav, m4aファイルをドロップできます。
                            <br />
                            start, endでループ範囲を指定できます。
                        </div>
                        <AudioPlayer
                            droppedFile={droppedAudio}
                            audioUrl={song.audio?.url.get || ''}
                            audioName={song.audio?.name || ''}
                            onDrop={onDropAudio}
                            isHLS={isHLS}
                            dropDisabled={false}
                            mini={false}
                            range={audioPlaybackRange}
                            toggle={toggleAudioFlag}
                            onTimeUpdate={onAudioTimeUpdate}
                            onMetadataLoaded={onAudioMetadataLoaded}
                        />
                    </div>
                ) : null}

                <div className="text-2xl">Memo</div>
                <Memo
                    className="h-1/2 w-full border-2 border-sky-400"
                    memo={song.memo}
                    onChange={(str) => onSongChange({ ...song, memo: str })}
                />
                <div className="text-2xl">sections</div>
                {song.sections.map((section, index) => (
                    <div key={index}>
                        <Section
                            sectionIndex={index}
                            section={section}
                            showMidi={showMidi}
                            onDropMidi={onDropMidi || undefined}
                            midiFile={null}
                            onSectionChange={(newSection: UserSongSection) =>
                                onSectionChange(index, newSection)
                            }
                            onDeleteButtonClick={() => deleteSection(index)}
                            onClickPlayButton={() =>
                                playAudioWithRange(section.audioPlaybackRange)
                            }
                            showAudioRange={isAudioLoaded}
                            onRangeClick={(action: string) => {
                                const newRange = {
                                    ...song.sections[index].audioPlaybackRange,
                                }
                                if (audioState) {
                                    if (action === 'set-start') {
                                        newRange.start =
                                            audioState.currentTime_sec
                                    } else if (action === 'set-end') {
                                        newRange.end =
                                            audioState.currentTime_sec
                                    }
                                    onSectionChange(index, {
                                        ...section,
                                        audioPlaybackRange: { ...newRange },
                                    })
                                }
                            }}
                            onClickChordInfo={showChordModal}
                        />
                        <Button onClick={() => appendNewSection(index)}>
                            +
                        </Button>
                    </div>
                ))}

                <div style={{ marginTop: '10em' }}></div>
            </div>
            {/* tag編集*/}
            <Modal
                isOpen={tagModalIsOpen}
                //onAfterOpen={afterOpenModal}
                onRequestClose={closeTagModal}
                style={ModalStyle}
                contentLabel="Example Modal"
            >
                <TagModal
                    onSaveTags={(tagUIs: TagUI[]) => {
                        if (onSaveTags) onSaveTags(tagUIs)
                        closeTagModal()
                    }}
                    closeModal={closeTagModal}
                    songTags={song.tags}
                    allTags={tags || []}
                />
            </Modal>
            {/* genre編集*/}
            <Modal
                isOpen={genreModalIsOpen}
                //onAfterOpen={afterOpenModal}
                onRequestClose={closeGenreModal}
                style={ModalStyle}
                contentLabel="Example Modal"
            >
                <GenreModal
                    onSaveGenres={(tagUIs: TagUI[]) => {
                        if (onSaveGenres) onSaveGenres(tagUIs)
                        closeGenreModal()
                    }}
                    closeModal={closeGenreModal}
                    songGenres={song.genres}
                    allGenres={genres || []}
                />
            </Modal>
            {/* コード詳細*/}
            <Modal
                isOpen={chordModalIsOpen}
                //onAfterOpen={afterOpenModal}
                style={ModalStyle}
                onRequestClose={closeChordModal}
                contentLabel="Example Modal"
            >
                <ChordModal
                    closeModal={closeChordModal}
                    noteIntervals={noteIntervals}
                />
            </Modal>
        </BasicPage>
    )
}

export default Song
