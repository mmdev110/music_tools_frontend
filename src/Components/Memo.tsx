import React from 'react'

type Props = {
    memo: string
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>
    className: string
}
const Memo = ({ memo, onChange, className }: Props) => {
    return (
        <div>
            <textarea className={className} value={memo} onChange={onChange} />
        </div>
    )
}
export default Memo
