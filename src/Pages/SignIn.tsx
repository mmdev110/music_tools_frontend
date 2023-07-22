import React, { useState } from 'react'
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'config/music'
import Detail from 'Pages/Detail'
import * as Types from 'types/music'
import * as Utils from 'utils/music'
//import './App.css'
import { signIn } from 'API/request'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'

const SignIn = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [resultText, setResultText] = useState('')
    const navigate = useNavigate()
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { user, accessToken } = await signIn(
                form.email,
                form.password
            )
            window.localStorage.setItem('access_token', accessToken)
            navigate('/')
            //jwt追加してリロードすることでApp.tsxのタイマーが作動する
            window.location.reload()
            //setResultText(`sign in: ${user.email}`)
        } catch (err) {
            console.log(err)
            if (isAxiosError(err)) {
                setResultText(err.response!.data.message)
            }
        }
    }
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newForm = { ...form, [event.target.name]: event.target.value }
        setForm(newForm)
    }
    const navigateToResetPassword = () => {
        navigate('/reset_password/request')
    }
    const navigateToSignUp = () => {
        navigate('/signup')
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>SIGNIN</div>
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-y-5">
                        <div>
                            <label className="inline-block w-48 text-left">
                                E-MAIL ADDRESS
                            </label>
                            <Input
                                type="text"
                                name="email"
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="inline-block w-48 text-left">
                                PASSWORD
                            </label>
                            <Input
                                type="password"
                                name="password"
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <Button type="submit">SIGNIN</Button>
                        </div>
                    </div>
                </form>
                {resultText ? <div>{resultText}</div> : null}
                <div
                    className="text-sm text-sky-800 hover:cursor-pointer"
                    onClick={navigateToResetPassword}
                >
                    forgot your password?
                </div>
                <div
                    className="text-sm text-sky-800 hover:cursor-pointer"
                    onClick={navigateToSignUp}
                >
                    create a new account
                </div>
            </div>
        </BasicPage>
    )
}

export default SignIn
