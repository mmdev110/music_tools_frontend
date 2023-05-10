import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import { AudioRange } from 'types/front'

type Props = {
    range: AudioRange
    onChange: (newrange: AudioRange) => void
}
const MediaRangeForm = ({ range, onChange }: Props) => {
    const onStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (!isNaN(value)) onChange({ ...range, start: value })
    }
    const onEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (!isNaN(value)) onChange({ ...range, end: value })
    }
    return (
        <div>
            <form>
                <label>start: </label>
                <input
                    type="text"
                    name="start"
                    onChange={onStartChange}
                    value={range.start}
                    className="w-16"
                />
                <label>end: </label>
                <input
                    type="text"
                    name="end"
                    onChange={onEndChange}
                    value={range.end}
                    className="w-16"
                />
            </form>
        </div>
    )
}
export default MediaRangeForm
