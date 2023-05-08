import React, {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    PropsWithoutRef,
    useState,
} from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    bgColor?: string
    width?: string
}
export const Button = ({ bgColor, width, ...props }: ButtonProps) => {
    let bg = bgColor || 'bg-sky-500'
    if (props.disabled) bg = 'bg-sky-300'
    const px = 'px-4'
    const font = 'font-bold'
    const text = 'text-white'
    const rounded = 'rounded'
    const w = width || 'w-auto'
    const className = [bg, px, font, text, rounded, w].join(' ')
    const [disabled, setDisabled] = useState(false)
    const onClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        //e.preventDefault()
        //連打防止
        setDisabled(true)
        try {
            if (props.onClick) await props.onClick(e)
        } catch (e) {
            throw e
        } finally {
            setDisabled(false)
        }
    }
    return (
        <button
            className={className}
            disabled={disabled}
            {...props}
            onClick={onClick}
        />
    )
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
