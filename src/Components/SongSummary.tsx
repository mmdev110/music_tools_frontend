import react, { memo, useState } from 'react'
//MUI
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import MoreIcon from '@mui/icons-material/MoreVert'

import { UserSong } from 'types'
import { ALL_NOTES, ALL_DEGREES } from 'config/music'
import { Button } from 'Components/HTMLElementsWrapper'
import Chord from 'Classes/Chord'
import lo from 'lodash'
import { getDisplayName } from 'utils/front'

type Props = {
    song: UserSong
    onPlayButtonClick: (song: UserSong) => void
    onInfoClick: (song: UserSong) => void
    onClickX: (song: UserSong) => void
    menuItems: { name: string; onClick: (song: UserSong) => void }[]
}
const SongSummary = ({
    song,
    onPlayButtonClick,
    onInfoClick,
    menuItems,
}: Props) => {
    const onButtonClick = () => {
        onPlayButtonClick(song)
    }
    const onClick = () => {
        onInfoClick(song)
    }

    const formatProgressions = (progressions: string[]): string => {
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
    //削除、複製ボタン
    //https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget)
    }
    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
    }
    return (
        <div className="flex w-full flex-col rounded-md border-2 border-black">
            <div className="flex justify-between">
                <div className="overflow-x-clip break-words">
                    {getDisplayName(song)}
                </div>
                {/*削除複製メニュー*/}
                <div className="border-blacks w-12 justify-between border-l-2">
                    <Box sx={{ flexGrow: 0 }}>
                        {/*メニューアイコン*/}
                        <Tooltip title="Actions">
                            <IconButton
                                onClick={handleOpenUserMenu}
                                sx={{ p: 0 }}
                            >
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
                                <MenuItem
                                    key={index}
                                    onClick={() => item.onClick(song)}
                                >
                                    <Typography textAlign="center">
                                        {item.name}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </div>
            </div>

            <div className="flex justify-between border-t-2 border-black">
                {/**コード進行、ディグリー、メモ */}
                <div
                    className="flex h-full w-full justify-between"
                    onClick={onClick}
                >
                    <div className="w-1/12 border-r-2 border-black"></div>
                    <div className="w-1/5 whitespace-pre-wrap border-r-2 border-black"></div>
                    <div className="w-1/5 whitespace-pre-wrap border-r-2 border-black"></div>
                    <div className="w-1/3 overflow-y-clip whitespace-pre-wrap break-words border-r-2 border-black">
                        {'仮置き'}
                    </div>
                </div>
                {/**オーディオ再生ボタン */}
                <div className="min-h-full w-12">
                    {!song.audio ? (
                        <Button className="h-full w-full rounded bg-red-400 font-bold text-white">
                            ×
                        </Button>
                    ) : (
                        <Button
                            className="h-full w-full rounded bg-sky-500 px-4 font-bold text-white"
                            onClick={onButtonClick}
                        >
                            ▷
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SongSummary
