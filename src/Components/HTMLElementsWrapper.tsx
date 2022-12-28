import React, {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    PropsWithoutRef,
    useState,
} from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    bgColor?: string
}
export const Button = ({ bgColor, ...props }: ButtonProps) => {
    let bg = bgColor || 'bg-sky-500'
    if (props.disabled) bg = 'bg-sky-300'
    const px = 'px-4'
    const font = 'font-bold'
    const text = 'text-white'
    const rounded = 'rounded'
    const className = [bg, px, font, text, rounded].join(' ')
    const [disabled, setDisabled] = useState(false)
    const onClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        //連打防止
        setDisabled(true)
        if (props.onClick) await props.onClick(e)
        setDisabled(false)
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
