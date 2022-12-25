import React, {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    PropsWithoutRef,
} from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    bgColor?: string
}
export const Button = ({ bgColor, ...props }: ButtonProps) => {
    const bg = bgColor || 'bg-sky-500'
    const px = 'px-4'
    const font = 'font-bold'
    const text = 'text-white'
    const rounded = 'rounded'
    const className = [bg, px, font, text, rounded].join(' ')
    return <button className={className} {...props} />
}

type ClassName = {
    className?: string
}
type InputProps = ClassName & InputHTMLAttributes<HTMLInputElement>
export const Input = ({ className, ...props }: InputProps) => {
    return (
        <input className={className || 'border-2 border-sky-400'} {...props} />
    )
}
