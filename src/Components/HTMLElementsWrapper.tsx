import React, {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    PropsWithoutRef,
} from 'react'

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            className="rounded bg-sky-500 px-4 font-bold text-white"
            {...props}
        />
    )
}

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
    return <input className="border-2 border-sky-400" {...props} />
}
