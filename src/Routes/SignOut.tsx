import React, { useState } from 'react'
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom'

import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
//import './App.css'
import { healthCheck } from 'API/request'
const SignOut = () => {
    const navigate = useNavigate()
    const onClick = async () => {
        window.localStorage.removeItem('jwt')
        navigate('/')
    }
    return (
        <div className="App">
            <div>SignOut Page</div>
            <button onClick={onClick}>サインアウトする</button>
        </div>
    )
}

export default SignOut
