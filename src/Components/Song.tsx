import React, { useState } from 'react'
import Modal from 'react-modal'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import Section from 'Components/Section'
import AudioPlayer from 'Components/AudioPlayer'
import TagModal from 'Pages/Modals/Tag'
import GenreModal from 'Pages/Modals/Genre'
import InstrumentsModal from 'Pages/Modals/Instruments'
import Memo from 'Components/Memo'
import TAILWIND from 'config/tailwind'
import SectionOverView from 'Components/SectionOverView'
import { sectionInit } from 'config/front'
import {
    Tag,
    Genre,
    User,
    AudioRange,
    UserSongSection,
    AudioState,
    UserSongInstrument,
} from 'types'
import { UserSong } from 'types'
import lo from 'lodash'
import { Button, Input } from 'Components/HTMLElementsWrapper'

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
const WideModalStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: '30%',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
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
    onSaveTags?: (selected: Tag[], all: Tag[]) => void
    onSaveGenres?: (selected: Genre[], all: Genre[]) => void
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
    const [tagModalIsOpen, setTagIsOpen] = useState(false)
    const showTagModal = () => {
        setTagIsOpen(true)
    }
    const closeTagModal = () => {
        setTagIsOpen(false)
    }
    //genre modal
    const [genreModalIsOpen, setGenreIsOpen] = useState(false)
    const showGenreModal = () => {
        setGenreIsOpen(true)
    }
    const closeGenreModal = () => {
        setGenreIsOpen(false)
    }
    //instruments modal
    const [instrumentsModalIsOpen, setInstrumentsIsOpen] = useState(false)
    const [sectionIndex, setSectionIndex] = useState(0)
    const showInstrumentsModal = (index: number) => {
        setSectionIndex(index)
        setInstrumentsIsOpen(true)
    }
    const closeInstrumentsModal = () => {
        setInstrumentsIsOpen(false)
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
        newSong.sections.forEach((section) => {
            section.audioRanges.forEach((range) => {
                if (range.end === 0) range.end = duration
            })
        })
    }
    const onAudioTimeUpdate = (currentTime: number) => {
        setAudioState({
            ...audioState,
            currentTime_sec: Math.floor(currentTime),
        })
    }
    const [toggleAudioFlag, setToggleAudioFlag] = useState(false) //このstateを変化させることで再生停止を切り替える
    const appendNewSection = (index: number) => {
        //indexの後ろにsection追加
        const sections = [...song.sections]
        const newSection = structuredClone(sectionInit) as UserSongSection
        //ある程度の情報は引き継ぐ
        newSection.section = ''
        newSection.bpm = sections[index].bpm
        newSection.key = sections[index].key
        newSection.scale = sections[index].scale
        newSection.sortOrder = sections[index].sortOrder + 1
        newSection.audioRanges[0].start = sections[index].audioRanges[0].end
        newSection.audioRanges[0].end = audioState.duration_sec
        newSection.progressions = sections[index].progressions
        newSection.instruments = sections[index].instruments

        sections.splice(index + 1, 0, newSection)
        onSongChange({
            ...song,
            sections: sections,
        })
    }
    const deleteSection = (index: number) => {
        if (song.sections.length <= 1) {
            setTabIndex(0)
            return
        }
        const sections = [...song.sections]
        sections.splice(index, 1)
        onSongChange({ ...song, sections })
        if (song.sections.length - 1 === tabIndex) setTabIndex(tabIndex - 1)
    }
    const isAudioLoaded = !!(droppedAudio || song.audio?.url.get !== '')
    const isHLS = !!song.audio?.url.get
    const [audioRange, setaudioRange] = useState({
        start: 0,
        end: 0,
    })
    const playAudioWithRange = (range: AudioRange) => {
        if (!isAudioLoaded) return
        const rangeArg = {
            start: range.start,
            end: range.end,
        }

        if (lo.isEqual(audioRange, rangeArg)) {
            //再生停止を切り替え
            setToggleAudioFlag(!toggleAudioFlag)
        } else {
            //rangeを変更して再生
            setaudioRange(rangeArg)
            setToggleAudioFlag(true)
        }
    }

    const [tabIndex, setTabIndex] = React.useState(0)
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue)
    }
    const a11yProps = (index: number) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        }
    }
    return (
        <div>
            <div className="flex flex-col gap-y-5 pt-4">
                <div className="flex items-end">
                    <span className="basis-28 text-2xl">title</span>
                    <Memo
                        singleLine
                        className="h-6 w-1/4 border-2 border-sky-400"
                        memo={song.title}
                        onChange={(str) => {
                            onSongChange({ ...song, title: str })
                        }}
                    />
                </div>
                <div className="flex items-end">
                    <span className="basis-28 text-2xl">artist</span>
                    <Memo
                        singleLine
                        className="h-6 w-1/4 border-2 border-sky-400"
                        memo={song.artist}
                        onChange={(str) => {
                            onSongChange({ ...song, artist: str })
                        }}
                    />
                </div>

                {user && showGenres ? (
                    <div>
                        <div className="flex">
                            <span className="basis-28 text-2xl">ジャンル</span>
                            <span className="">
                                <Button
                                    bgColor={TAILWIND.BTN_BG_COLOR_OTHER}
                                    onClick={showGenreModal}
                                >
                                    編集
                                </Button>
                            </span>
                        </div>
                        <div className="flex">
                            <div className="basis-28" />
                            <div className="mt-4 flex flex-row gap-x-4">
                                {song.genres.map((genre, index) => (
                                    <Button key={index}>{genre.name}</Button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}

                {user && showTags ? (
                    <div>
                        <div className="flex">
                            <span className="basis-28 text-2xl">タグ</span>
                            <span className="">
                                <Button
                                    bgColor={TAILWIND.BTN_BG_COLOR_OTHER}
                                    onClick={showTagModal}
                                >
                                    編集
                                </Button>
                            </span>
                        </div>
                        <div className="flex">
                            <div className="basis-28" />
                            <div className="flex flex-row gap-x-4">
                                {song.tags.map((tag, index) => (
                                    <Button key={index}>{tag.name}</Button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}

                {showAudio ? (
                    <div>
                        <div className="text-2xl">AudioPlayer</div>
                        <div>mp3, wav, m4aファイルをドロップできます。</div>
                        <div className="flex">
                            <div className="basis-28" />
                            <AudioPlayer
                                className=""
                                droppedFile={droppedAudio}
                                audioUrl={song.audio?.url.get || ''}
                                audioName={song.audio?.name || ''}
                                onDrop={onDropAudio}
                                isHLS={isHLS}
                                dropDisabled={false}
                                mini={false}
                                range={audioRange}
                                toggle={toggleAudioFlag}
                                onTimeUpdate={onAudioTimeUpdate}
                                onMetadataLoaded={onAudioMetadataLoaded}
                            />
                        </div>
                    </div>
                ) : null}

                <div className="flex items-start">
                    <span className="basis-28 text-2xl">Memo</span>
                    <Memo
                        className="h-32 grow border-2 border-sky-400"
                        memo={song.memo}
                        onChange={(str) => onSongChange({ ...song, memo: str })}
                    />
                </div>

                {song.sections.length > 0 ? (
                    <div>
                        <div className="text-2xl">Sections Overview</div>
                        <div className="flex">
                            <div className="basis-28" />
                            <SectionOverView
                                sections={song.sections}
                                instruments={song.instruments}
                                onClick={(newSections) => {
                                    const newSong = { ...song }
                                    newSong.sections = newSections
                                    onSongChange(newSong)
                                }}
                                onClickPlayButton={(range) =>
                                    playAudioWithRange(range)
                                }
                            />
                        </div>
                    </div>
                ) : null}
                {/*
                <div className="text-2xl">sections</div>
                 */}
                <div className={`border-t-2 ${TAILWIND.BORDER_COLOR_STRONG}`} />
                <div className="text-2xl">Sections</div>
                <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="basic tabs example"
                >
                    {song.sections.map((section, index) => {
                        return (
                            <Tab
                                key={index}
                                label={section.section || 'new'}
                                {...a11yProps(index)}
                            />
                        )
                    })}
                    <Tab
                        icon={<AddCircleOutlineIcon />}
                        onClick={() => {
                            appendNewSection(song.sections.length - 1)
                        }}
                    />
                    <Tab
                        //className="rounded bg-red-400 font-bold text-white"
                        className="bg-red-500"
                        icon={<CancelOutlinedIcon />}
                        onClick={() => deleteSection(tabIndex)}
                    />
                </Tabs>
                {song.sections.map((section, index) => {
                    return (
                        <TabPanel key={index} value={tabIndex} index={index}>
                            <div key={index}>
                                <Section
                                    sectionIndex={index}
                                    section={section}
                                    showMidi={showMidi}
                                    onDropMidi={onDropMidi || undefined}
                                    midiFile={null}
                                    onSectionChange={(
                                        newSection: UserSongSection
                                    ) => onSectionChange(index, newSection)}
                                    onClickPlayButton={(range) =>
                                        playAudioWithRange(range)
                                    }
                                    showAudioRange={isAudioLoaded}
                                    onRangeClick={(
                                        rangeIndex,
                                        action: string
                                    ) => {
                                        const newRanges = [
                                            ...song.sections[index].audioRanges,
                                        ]
                                        if (audioState) {
                                            if (action === 'set-start') {
                                                newRanges[rangeIndex].start =
                                                    audioState.currentTime_sec
                                            } else if (action === 'set-end') {
                                                newRanges[rangeIndex].end =
                                                    audioState.currentTime_sec
                                            }
                                            onSectionChange(index, {
                                                ...section,
                                                audioRanges: newRanges,
                                            })
                                        }
                                    }}
                                    allInstruments={song.instruments}
                                    previousInstruments={
                                        index === 0
                                            ? undefined
                                            : song.sections[index - 1]
                                                  .instruments
                                    }
                                    onInstrumentsMenuClick={(index) =>
                                        showInstrumentsModal(index)
                                    }
                                />
                            </div>
                        </TabPanel>
                    )
                })}

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
                    onSaveTags={(selected: Tag[], all: Tag[]) => {
                        if (onSaveTags) onSaveTags(selected, all)
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
                    onSaveGenres={(selected: Genre[], all: Genre[]) => {
                        if (onSaveGenres) onSaveGenres(selected, all)
                        closeGenreModal()
                    }}
                    closeModal={closeGenreModal}
                    songGenres={song.genres}
                    allGenres={genres || []}
                />
            </Modal>
            {/* instruments編集*/}
            <Modal
                isOpen={instrumentsModalIsOpen}
                //onAfterOpen={afterOpenModal}
                onRequestClose={closeInstrumentsModal}
                style={WideModalStyle}
                contentLabel="Example Modal"
            >
                <InstrumentsModal
                    onSave={(
                        selected: UserSongInstrument[],
                        list: UserSongInstrument[]
                    ) => {
                        const newSong = { ...song }
                        newSong.instruments = list
                        newSong.sections[sectionIndex].instruments = selected
                        onSongChange(newSong)
                        closeInstrumentsModal()
                    }}
                    closeModal={closeInstrumentsModal}
                    currentInstruments={song.sections[sectionIndex].instruments}
                    allInstruments={song.instruments}
                />
            </Modal>
        </div>
    )
}
interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}
const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {children}
        </div>
    )
}

export default Song
