import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    ReactNode,
} from 'react'
import { Route, Routes, BrowserRouter, useParams } from 'react-router-dom'
import { TERMS } from 'config/music'
import { INSTRUMENT_CATEGORIES } from 'config/front'
import * as Types from 'types/music'
import { Tag } from 'types/'
import { getTags, saveTags } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'
import Tooltip from '@mui/material/Tooltip'

type Props = {
    name: string
    color: string
    onClick?: () => void
    onRightClick?: () => void
    tooltipText?: string
}

const OneTag = ({ name, color, onClick, onRightClick, tooltipText }: Props) => {
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button == 2) {
            //右クリック
            onRightClick && onRightClick()
        }
    }

    return (
        <Tooltip
            title={
                tooltipText ? (
                    <span style={{ whiteSpace: 'pre-line' }}>
                        {tooltipText}
                    </span>
                ) : (
                    ''
                )
            }
            placement="right-end"
            arrow
        >
            <div>
                <Button
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => handleMouseDown(e)}
                    bgColor={color}
                    onClick={onClick}
                >
                    {name}
                </Button>
            </div>
        </Tooltip>
    )
}

export default OneTag
