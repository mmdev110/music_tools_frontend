import react, { memo, useState } from 'react'
import { Link } from 'react-router-dom'
//MUI
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import ButtonMUI from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import AdbIcon from '@mui/icons-material/Adb'
import MoreIcon from '@mui/icons-material/MoreVert'

import { UserLoopInput } from 'types'
import { ALL_NOTES, ALL_DEGREES } from 'config/music'
import { Button } from 'Components/HTMLElementsWrapper'
import ChordProgression from 'Classes/ChordProgression'
import Chord from 'Classes/Chord'
import lo from 'lodash'
import { getDisplayName } from 'utils/front'

type Props = {
    input: UserLoopInput
    onPlayButtonClick: (input: UserLoopInput) => void
    onInfoClick: (input: UserLoopInput) => void
    onClickX: (input: UserLoopInput) => void
    menuItems: { name: string; onClick: (input: UserLoopInput) => void }[]
}
const LoopSummary = ({
    input,
    onPlayButtonClick,
    onInfoClick,
    menuItems,
}: Props) => {
    const note = ALL_NOTES[input.key]
    const onButtonClick = () => {
        onPlayButtonClick(input)
    }
    const onClick = () => {
        onInfoClick(input)
    }
    const degrees = input.progressions.map((name) => {
        if (name === '') return name
        const chord = Chord.newFromChordName(name)
        chord._calcDegree(input.key)
        return chord.getDegreeName()
    })
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
                    {getDisplayName(input)}
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
                                    onClick={() => item.onClick(input)}
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
                    <div className="w-1/12 border-r-2 border-black">
                        <div>{note.flat}</div>
                        <div>{input.scale}</div>
                    </div>
                    <div className="w-1/5 whitespace-pre-wrap border-r-2 border-black">
                        <div>{formatProgressions(input.progressions)}</div>
                    </div>
                    <div className="w-1/5 whitespace-pre-wrap border-r-2 border-black">
                        <div>{formatProgressions(degrees)}</div>
                    </div>
                    <div className="w-1/3 overflow-y-clip whitespace-pre-wrap break-words border-r-2 border-black">
                        {input.memo || ''}
                    </div>
                </div>
                {/**オーディオ再生ボタン */}
                <div className="min-h-full w-12">
                    {input.userLoopAudio.url.get === '' ? (
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

export default LoopSummary
