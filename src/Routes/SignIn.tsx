import React, { useState } from 'react'
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
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
            const user = await signIn(form.email, form.password)
            window.localStorage.setItem('jwt', user.token)
            navigate('/')
            //setResultText(`sign in: ${user.email}`)
        } catch (err) {
            if (isAxiosError(err)) {
                setResultText(err.response?.data.message)
            } else {
                console.log(err)
            }
        }
    }
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newForm = { ...form, [event.target.name]: event.target.value }
        setForm(newForm)
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
            </div>
        </BasicPage>
    )
}

export default SignIn
