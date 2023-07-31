import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { TERMS } from 'config/music'
import * as Types from 'types/music'
import * as Utils from 'utils/music'
import TEXT from 'config/text'
import BasicPage from 'Components/BasicPage'
import HowToUse from 'Components/Descriptions/HowToUse'
import { Button } from 'Components/HTMLElementsWrapper'
import { healthCheck } from 'API/request'
type props = {
    onVisit: () => void
}
const Top = ({ onVisit }: props) => {
    const onClick = async () => {
        await healthCheck()
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-2 pt-10">
                <div>
                    {TEXT.SERVICE_NAME}
                    は楽曲分析を自身の音楽制作に活かしていくためのサービスです。
                </div>
                <HowToUse />
                {process.env.REACT_APP_ENV === 'local' ? (
                    <Button onClick={onClick}>テスト</Button>
                ) : null}
            </div>
        </BasicPage>
    )
}

export default Top
