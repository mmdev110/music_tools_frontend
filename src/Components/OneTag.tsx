import React, { useEffect, useState } from 'react'
import { Button } from 'Components/HTMLElementsWrapper'

type Props = {
    name: string
    color: string
    onClick: () => void
    onRename: (newName: string) => void
}

const OneTag = ({ name, color, onClick, onRename }: Props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [input, setInput] = useState('')
    useEffect(() => {
        setInput(name)
    }, [])
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (e.button == 2) {
            //右クリック
            setIsEditing(true)
        }
    }

    return (
        <div
            onContextMenu={(e) => e.preventDefault()}
            className="flex flex-col items-center"
        >
            {isEditing ? (
                <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e)}
                    onBlur={() => {
                        setIsEditing(false)
                        onRename(input)
                    }}
                    onFocus={(e) => e.target.select()}
                    autoFocus
                />
            ) : (
                <Button
                    onMouseDown={(e) => handleMouseDown(e)}
                    bgColor={color}
                    onClick={onClick}
                >
                    {name}
                </Button>
            )}
        </div>
    )
}

export default OneTag
