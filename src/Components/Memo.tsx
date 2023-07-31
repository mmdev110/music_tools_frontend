import React from 'react'

type Props = {
    memo: string | number
    onChange: (str: string) => void
    className: string
    placeholder?: string
    singleLine?: boolean
}
const Memo = ({
    memo,
    onChange,
    className,
    placeholder,
    singleLine,
}: Props) => {
    return singleLine ? (
        <input
            type="text"
            className={className}
            value={memo}
            placeholder={placeholder}
            onChange={(e) => {
                onChange(e.target.value)
            }}
        />
    ) : (
        <textarea
            className={className}
            value={memo}
            placeholder={placeholder}
            onChange={(e) => {
                onChange(e.target.value)
            }}
        />
    )
}
export default Memo
