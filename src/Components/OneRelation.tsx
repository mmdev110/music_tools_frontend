import React, { useState, useEffect, useRef } from 'react'
import * as Constants from '../config/music'
import * as Types from '../types/music'
import * as Utils from '../utils/music'

type Props = {
    chara_relation: string[]
}

const OneRelation = (props: Props) => {
    const renderRelations = () => {
        const relation = props.chara_relation
        if (relation.length === 0) return <div></div>
        return (
            <div className="flex flex-col items-center text-sm">
                {relation.map((chara, index) => {
                    return <div key={index}>{chara}</div>
                })}
            </div>
        )
    }
    return (
        <div className="basis-1/2">
            <div className="flex flex-col items-center">
                <div>→</div>
                {renderRelations()}
            </div>
        </div>
    )
}
export default OneRelation
