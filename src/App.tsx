import React, { useState, useEffect } from 'react'
import {
    Route,
    Routes,
    RouterProvider,
    createBrowserRouter,
} from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'Constants'
import { User } from './types'
import * as Utils from './utils/music'
import { forEachChild } from 'typescript'
import Header from 'Pages/Header'
import Top from 'Pages/Top'
import SignIn from 'Pages/SignIn'
import SignUp from 'Pages/SignUp'
import Detail from 'Pages/Detail'
import List from 'Pages/List'
import ResetNew from 'Pages/ResetNew'
import ResetReq from 'Pages/ResetReq'
import ErrorPage from 'Pages/ErrorPage'
import { getUser } from 'API/request'

const App = () => {
    const [user, setUser] = useState<User | null>(null)
    const auth = async () => {
        try {
            const me = await getUser()
            setUser(me) //me=nullの場合あり(logout時)
        } catch (err) {
            if (isAxiosError(err)) console.log(err)
        }
    }
    useEffect(() => {
        auth()
    }, [])
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Header user={user} />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: '',
                    element: <Top onVisit={auth} />,
                },
                {
                    path: 'signin',
                    element: <SignIn />,
                },
                {
                    path: 'signup',
                    element: <SignUp />,
                },
                {
                    path: 'list',
                    element: <List />,
                },
                {
                    path: 'edit/:userLoopId',
                    element: <Detail />,
                },
                {
                    path: 'reset_password/request',
                    element: <ResetReq />,
                },
                {
                    path: 'reset_password/new',
                    element: <ResetNew />,
                },
            ],
        },
    ])
    return <RouterProvider router={router} />
}

export default App
