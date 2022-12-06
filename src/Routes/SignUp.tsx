import React, { useState } from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
//import './App.css'
import { signUp } from 'API/request'
const SignUp = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [resultText, setResultText] = useState('')
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await signUp(form.email, form.password)
            setResultText(`registered: ${result.email}`)
        } catch (err) {
            if (isAxiosError(err)) setResultText(err.response?.data.message)
        }
    }
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newForm = { ...form, [event.target.name]: event.target.value }
        setForm(newForm)
    }
    return (
        <div className="App">
            <div>SignUp Page</div>
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
                <input type="submit" value="register" />
            </form>
            {resultText ? <div>{resultText}</div> : null}
        </div>
    )
}

export default SignUp
