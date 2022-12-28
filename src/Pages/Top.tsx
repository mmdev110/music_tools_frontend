import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { TERMS } from 'config/music'
import * as Types from 'types/music'
import * as Utils from 'utils/music'
import BasicPage from 'Components/BasicPage'
import HowToUse from 'Components/Descriptions/HowToUse'
import { Button } from 'Components/HTMLElementsWrapper'
import { getUser } from 'API/request'
type props = {
    onVisit: () => void
}
const Top = ({ onVisit }: props) => {
    const onClick = async () => {
        console.log('start')
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('finished')
                resolve(1)
            }, 2000)
        })
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-2 pt-10">
                <div>
                    LOOP
                    ANALYZERはループ素材を分析して、繰り返し聴くことで音楽理論を定着させるサービスです。
                </div>
                <div>
                    <Link className="text-red-500" to="/edit/new">
                        こちら
                    </Link>
                    <span>から試してみましょう！</span>
                </div>
                <HowToUse />
                <Button onClick={onClick}>テスト</Button>
            </div>
        </BasicPage>
    )
}

export default Top
