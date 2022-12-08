import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { TERMS } from 'Constants'
import * as Types from 'types'
import * as Utils from 'utils'
import BasicPage from 'Components/BasicPage'
import HowToUse from 'Components/Descriptions/HowToUse'
type props = {
    onVisit: Function
}
const Top = ({ onVisit }: props) => {
    useEffect(() => {
        console.log('auth')
        onVisit()
    }, [])
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
            </div>
        </BasicPage>
    )
}

export default Top
