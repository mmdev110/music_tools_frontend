import React from 'react'

type Props = {
    memo: string | number
    onChange: (str: string) => void
    className: string
    placeholder?: string
}
const Memo = ({ memo, onChange, className, placeholder }: Props) => {
    return (
        <div>
            <textarea
                className={className}
                value={memo}
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e.target.value)
                }}
            />
        </div>
    )
}
export default Memo
