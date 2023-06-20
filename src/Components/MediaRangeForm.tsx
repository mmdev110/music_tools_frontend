import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import { AudioRange } from 'types/front'
import { Button } from 'Components/HTMLElementsWrapper'

type Props = {
    range: AudioRange
    onChange: (newrange: AudioRange) => void
    onRangeClick: (command: string) => void
    onDeleteClick: () => void
}
const MediaRangeForm = ({
    range,
    onChange,
    onRangeClick,
    onDeleteClick,
}: Props) => {
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        onChange({ ...range, name: value })
    }
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
                <label>name: </label>
                <input
                    type="text"
                    name="name"
                    onChange={onNameChange}
                    value={range.name}
                    className="w-16"
                />
                <label>start: </label>
                <input
                    type="text"
                    name="start"
                    onChange={onStartChange}
                    value={range.start}
                    className="w-16"
                />
                <Button
                    onClick={(e: React.FormEvent) => {
                        e.preventDefault()
                        onRangeClick('set-start')
                    }}
                >
                    set
                </Button>
                <label>end: </label>
                <input
                    type="text"
                    name="end"
                    onChange={onEndChange}
                    value={range.end}
                    className="w-16"
                />
                <Button
                    onClick={(e: React.FormEvent) => {
                        e.preventDefault()
                        onRangeClick('set-end')
                    }}
                >
                    set
                </Button>
                <Button bgColor="bg-red-500" onClick={onDeleteClick}>
                    ×
                </Button>
            </form>
        </div>
    )
}
export default MediaRangeForm
