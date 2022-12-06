import React, { useState } from 'react'
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
//import './App.css'
import { signIn } from 'API/request'

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
        <div className="App">
            <div>SignIn Page</div>
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    name="email"
                    placeholder="email"
                    onChange={onChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    onChange={onChange}
                />
                <input type="submit" value="signin" />
            </form>
            {resultText ? <div>{resultText}</div> : null}
        </div>
    )
}

export default SignIn
