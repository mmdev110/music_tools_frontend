import React, {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    PropsWithoutRef,
} from 'react'

type ClassName = {
    className?: string
}
type ButtonProps = ClassName & ButtonHTMLAttributes<HTMLButtonElement>
export const Button = ({ className, ...props }: ButtonProps) => {
    return (
        <button
            className={
                className || 'rounded bg-sky-500 px-4 font-bold text-white'
            }
            {...props}
        />
    )
}

type InputProps = ClassName & InputHTMLAttributes<HTMLInputElement>
export const Input = ({ className, ...props }: InputProps) => {
    return (
        <input className={className || 'border-2 border-sky-400'} {...props} />
    )
}
