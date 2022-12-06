import React from 'react'

type Props = {
    memo: string
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}
const Memo = ({ memo, onChange }: Props) => {
    return (
        <div>
            <textarea value={memo} onChange={onChange} />
        </div>
    )
}
export default Memo
