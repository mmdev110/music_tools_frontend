import react, { memo, useState } from 'react'
//MUI
import Box from '@mui/material/Box'
import ChordProgression from 'Classes/ChordProgression'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import MoreIcon from '@mui/icons-material/MoreVert'

import { UserSong, AudioRange, ViewType } from 'types'
import { ALL_NOTES, ALL_DEGREES } from 'config/music'
import { Button } from 'Components/HTMLElementsWrapper'
import Chord from 'Classes/Chord'
import lo from 'lodash'

type Props = {
    song: UserSong
    onPlayButtonClick: (song: UserSong, range: AudioRange) => void
    onClickX: (song: UserSong) => void
    menuItems?: { name: string; onClick: (song: UserSong) => void }[]
    viewType: ViewType
}
const SongSummary = ({
    song,
    onPlayButtonClick,
    menuItems,
    viewType,
}: Props) => {
    //削除、複製ボタン
    //https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu

    const getDisplayName = (song: UserSong): string => {
        if (song.title && song.artist) {
            return `${song.title} - ${song.artist}`
        } else if (song.title) {
            return `${song.title}`
        } else if (song.audio?.name) {
            return song.audio?.name
        } else {
            return ''
        }
    }
    const renderByViewType = () => {
        if (viewType.name === 'overview') {
            return (
                <ViewOverview
                    song={song}
                    onClick={(range: AudioRange) =>
                        onPlayButtonClick(song, range)
                    }
                />
            )
        } else if (viewType.name === 'chords') {
            return (
                <ViewChords
                    song={song}
                    onClick={(range: AudioRange) =>
                        onPlayButtonClick(song, range)
                    }
                />
            )
        } else if (viewType.name === 'memo') {
            return (
                <ViewMemo
                    song={song}
                    onClick={(range: AudioRange) =>
                        onPlayButtonClick(song, range)
                    }
                />
            )
        }
    }

    return (
        <div className="flex w-full flex-col rounded-md border-2 border-black">
            <div className="flex justify-between">
                <div className="overflow-x-clip break-words">
                    {getDisplayName(song)}
                </div>
                {/*genre */}
                <div className="flex gap-x-2">
                    {song.genres.map((tag, index) => (
                        <Button key={index}>{tag.name}</Button>
                    ))}
                </div>
                {/*削除複製メニュー*/}
                <div className="w-12">
                    {menuItems ? (
                        <MenuButton menuItems={menuItems} song={song} />
                    ) : null}
                </div>
            </div>
            <div className="flex justify-start gap-x-2 border-t-2 border-black">
                {/*タグ */}
                {song.tags.length > 0
                    ? song.tags.map((tag, index) => (
                          <Button key={index}>{tag.name}</Button>
                      ))
                    : 'tag'}
            </div>

            <div className="flex justify-between border-t-2 border-black">
                {/**コード進行、ディグリー、メモ */}
                <div className="h-full grow border-black">
                    {renderByViewType()}
                </div>
            </div>
        </div>
    )
}

type ViewOverviewProps = {
    song: UserSong
    onClick: (range: AudioRange) => void
}
const ViewOverview = ({ song, onClick }: ViewOverviewProps) => {
    const getBasicInfoString = (index: number): string => {
        if (!song.sections) return ''
        const sections = song.sections
        const keyName = ALL_NOTES[sections[index].key].flat
        const scale = sections[index].scale
        const bpm = sections[index].bpm
        let returnStr = `${keyName}${scale} ${bpm}BPM`
        if (index > 0) {
            const prevKeyName = ALL_NOTES[sections[index - 1].key].flat
            const prevScale = sections[index - 1].scale
            const prevBPM = sections[index - 1].bpm
            if (
                keyName === prevKeyName &&
                scale === prevScale &&
                bpm === prevBPM
            )
                returnStr = ``
        }
        return returnStr
    }

    return (
        <div className="flex">
            <div className="basis-1/3">
                {song.sections.map((sec, index) => {
                    return (
                        <div
                            key={index}
                            className="flex border-b-2 border-black last:border-transparent"
                        >
                            <div className="basis-1/2 border-r-2 border-black">
                                {sec.section || '-'}
                            </div>
                            <div className="basis-1/2 border-r-2 border-black">{`${getBasicInfoString(
                                index
                            )}`}</div>
                        </div>
                    )
                })}
            </div>
            <div className="grow overflow-y-clip">{song.memo}</div>
        </div>
    )
}
const ViewChords = ({ song, onClick }: ViewOverviewProps) => {
    const formatProgressions = (index: number): string => {
        const progressions = song.sections[index].progressions
        if (progressions.length === 0) return ''
        let str = ''
        const chunkBy4 = lo.chunk(progressions, 4)
        chunkBy4.forEach((chord4) => {
            const containsChord = chord4.find((chord) => chord !== '')
            if (containsChord) {
                str += '['
                str += chord4.join(', ')
                str += ']\n'
            }
        })
        return str
    }
    const formatProgressionsDegree = (index: number): string => {
        const section = song.sections[index]
        if (section.progressions.length === 0) return ''
        const progression = ChordProgression.newFromChordNames(
            section.progressions,
            section.key,
            section.scale
        )
        let str = ''
        const degreeNames = progression.chords.map((chord) =>
            chord.getDegreeName()
        )
        console.log(degreeNames)
        const chunkBy4 = lo.chunk(degreeNames, 4)
        chunkBy4.forEach((chord4) => {
            const containsChord = chord4.find((chord) => chord !== '')
            if (containsChord) {
                str += '['
                str += chord4.join(', ')
                str += ']\n'
            }
        })
        return str
    }
    return (
        <div className="flex">
            <div className="grow">
                {song.sections.map((sec, index) => {
                    return (
                        <div
                            key={index}
                            className="flex border-b-2 border-black last:border-transparent"
                        >
                            <div className="basis-1/2 border-r-2 border-black">
                                {sec.section || '-'}
                            </div>
                            <div className="basis-1/2 border-r-2 border-black">{`${formatProgressionsDegree(
                                index
                            )}`}</div>
                            <div className="basis-1/2 border-r-2 border-black">{`${formatProgressions(
                                index
                            )}`}</div>
                            {/**オーディオ再生ボタン */}
                            <div className="h-hull w-12 self-center border-r-2 border-black">
                                {song.audio?.url.get ? (
                                    <Button
                                        className="h-10 w-full rounded bg-sky-500 px-4 font-bold text-white"
                                        onClick={() =>
                                            onClick(sec.audioPlaybackRange)
                                        }
                                    >
                                        ▷
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
const ViewMemo = ({ song, onClick }: ViewOverviewProps) => {
    return (
        <div className="flex">
            <div className="grow">
                {song.sections.map((sec, index) => {
                    return (
                        <div
                            key={index}
                            className="flex border-b-2 border-black last:border-transparent"
                        >
                            <div className="basis-1/2 border-r-2 border-black">
                                {sec.section || '-'}
                            </div>
                            <div className="basis-1/2 border-r-2 border-black">
                                {sec.memo || '-'}
                            </div>
                            {/**オーディオ再生ボタン */}
                            <div className="h-hull w-12 self-center border-r-2 border-black">
                                {song.audio?.url.get ? (
                                    <Button
                                        className="h-10 w-full rounded bg-sky-500 px-4 font-bold text-white"
                                        onClick={() =>
                                            onClick(sec.audioPlaybackRange)
                                        }
                                    >
                                        ▷
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

type MenuProps = {
    menuItems: { name: string; onClick: (song: UserSong) => void }[]
    song: UserSong
}
const MenuButton = ({ menuItems, song }: MenuProps) => {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget)
    }
    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
    }
    return (
        <Box sx={{ flexGrow: 0 }}>
            {/*メニューアイコン*/}
            <Tooltip title="Actions">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <MoreIcon />
                </IconButton>
            </Tooltip>
            {/*メニュー内容*/}
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                {menuItems.map((item, index) => (
                    <MenuItem key={index} onClick={() => item.onClick(song)}>
                        <Typography textAlign="center">{item.name}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}

export default SongSummary
