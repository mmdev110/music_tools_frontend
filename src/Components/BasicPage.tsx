import React from 'react'
const BasicPage = (props: React.PropsWithChildren) => {
    return (
        <div className="h-screen text-stone-800">
            <div className="px-20">{props.children}</div>
        </div>
    )
}
export default BasicPage
