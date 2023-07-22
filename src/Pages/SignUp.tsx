import React, { useState } from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'config/music'
import Detail from 'Pages/Detail'
import * as Types from 'types/music'
import * as Utils from 'utils/music'
//import './App.css'
import { signUp } from 'API/request'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
const SignUp = () => {
    const [email, setEmail] = useState({ email: '', error: '' })
    const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        const err = validateEmail(input)
        const newEmail = { ...email, email: input }
        //エラーが無くなったら消してあげる
        if (email.error && err === '') newEmail.error = err
        setEmail(newEmail)
    }
    const validateEmail = (input: string): string => {
        const re =
            /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/

        return re.test(input) ? '' : '無効なアドレスです'
    }
    const [password, setPassword] = useState({ password: '', error: '' })
    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        const err = validatePassword(input)
        const newP = { ...password, password: input }
        //エラーが無くなったら消してあげる
        if (password.error !== '' && err === '') newP.error = err
        setPassword(newP)
    }
    const validatePassword = (input: string): string => {
        if (input.length < 8) return 'パスワードは8文字以上入力してください'
        return ''
    }
    const [resultText, setResultText] = useState('')
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const err = validate()
            if (err) return
            const result = await signUp(email.email, password.password)
            setResultText(`registered: ${result.email}`)
        } catch (err) {
            if (isAxiosError(err)) {
                const { code, message } = err.response?.data
                let msg = ''
                if (code === 2) {
                    msg = '登録済みのアドレスです'
                } else {
                    msg = message
                }
                setResultText(msg)
            }
        }
    }
    const validate = (): boolean => {
        const errText = validateEmail(email.email)
        if (errText) setEmail({ ...email, error: errText })
        const errText2 = validatePassword(password.password)
        if (errText2) setPassword({ ...password, error: errText2 })
        return errText !== '' || errText2 !== ''
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>CREATE ACCOUNT</div>
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-y-5">
                        <div className="flex flex-row">
                            <div className="inline-block w-48 text-left">
                                E-MAIL ADDRESS
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    name="email"
                                    onChange={onEmailChange}
                                />
                                {email.error && (
                                    <div className="text-red-500">
                                        {email.error}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <label className="inline-block w-48 text-left">
                                PASSWORD
                            </label>
                            <div>
                                <Input
                                    type="password"
                                    name="password"
                                    onChange={onPasswordChange}
                                />
                                {password.error && (
                                    <div className="text-red-500">
                                        {password.error}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Button type="submit">CREATE ACCOUNT</Button>
                        </div>
                    </div>
                </form>
                {resultText ? <div>{resultText}</div> : null}
            </div>
        </BasicPage>
    )
}

export default SignUp
