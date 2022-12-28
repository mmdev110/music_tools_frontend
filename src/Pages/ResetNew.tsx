import React, { useState } from 'react'
import { Route, Routes, BrowserRouter, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'config/music'
import Detail from 'Pages/Detail'
import * as Types from 'types/music'
import * as Utils from 'utils/music'
//import './App.css'
import { setNewPassword } from 'API/request'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { validatePassword } from 'utils/front'
const ResetNew = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [password, setPassword] = useState({ password: '', error: '' })
    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        const err = validatePassword(input)
        const newP = { ...password, password: input }
        //エラーが無くなったら消してあげる
        if (password.error !== '' && err === '') newP.error = err
        setPassword(newP)
    }
    const [resultText, setResultText] = useState('')
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!token) setResultText('トークンが存在しません')
            const err = validate()
            if (err) return
            const result = await setNewPassword(password.password, token!)
            setResultText(`reset success !!`)
        } catch (err) {
            if (isAxiosError(err)) setResultText(err.response?.data.message)
        }
    }
    const validate = (): boolean => {
        const errText2 = validatePassword(password.password)
        if (errText2) setPassword({ ...password, error: errText2 })
        return errText2 !== ''
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>RESET PASSWORD</div>
                <div>新しいパスワードを入力してください。</div>
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-y-5">
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
                            <Button type="submit">SET NEW PASSWORD</Button>
                        </div>
                    </div>
                </form>
                {resultText ? <div>{resultText}</div> : null}
            </div>
        </BasicPage>
    )
}

export default ResetNew
