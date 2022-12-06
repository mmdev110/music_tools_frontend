import React, { useState, useEffect } from 'react'
import {
    Route,
    Routes,
    RouterProvider,
    createBrowserRouter,
} from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'Constants'
import * as Types from './types'
import * as Utils from './utils'
import { forEachChild } from 'typescript'
import Header from 'Routes/Header'
import Top from 'Routes/Top'
import SignIn from 'Routes/SignIn'
import SignUp from 'Routes/SignUp'
import SignOut from 'Routes/SignOut'
import Detail from 'Routes/Detail'
import List from 'Routes/List'
import ErrorPage from 'Routes/ErrorPage'
import { getUser } from 'API/request'

const App = () => {
    const [user, setUser] = useState<Types.User | null>(null)
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
                    path: 'signout',
                    element: <SignOut />,
                },
                {
                    path: 'list',
                    element: <List />,
                },
                {
                    path: 'edit/:userLoopId',
                    element: <Detail />,
                },
            ],
        },
    ])
    return <RouterProvider router={router} />
}

export default App
