import React from 'react'

type Props = {
    memo: string
    onChange: (str: string) => void
    className: string
}
const Memo = ({ memo, onChange, className }: Props) => {
    return (
        <div>
            <textarea
                className={className}
                value={memo}
                onChange={(e) => {
                    onChange(e.target.value)
                }}
            />
        </div>
    )
}
export default Memo
