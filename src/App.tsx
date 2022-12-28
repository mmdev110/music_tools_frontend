import React, { useState, useEffect } from 'react'
import {
    Route,
    Routes,
    RouterProvider,
    createBrowserRouter,
} from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TERMS } from 'config/music'
import { TOKEN_REFRESH_INTERVAL_SEC } from 'config/front'
import { User } from './types'
import * as Utils from './utils/music'
import Header from 'Pages/Header'
import Top from 'Pages/Top'
import SignIn from 'Pages/SignIn'
import SignUp from 'Pages/SignUp'
import Detail from 'Pages/Detail'
import List from 'Pages/List'
import ResetNew from 'Pages/ResetNew'
import ResetReq from 'Pages/ResetReq'
import ErrorPage from 'Pages/ErrorPage'
import { getUser, refreshToken } from 'API/request'

const App = () => {
    const [user, setUser] = useState<User | null>(null)
    const auth = async () => {
        const token = localStorage.getItem('access_token')
        if (token) {
            let me: User | null = null
            try {
                const userResult = await getUser()
                if (userResult) me = userResult
            } catch (err) {
                if (isAxiosError(err)) console.log(err)
            }

            if (me) {
                setUser(me)
                //アクセストークン更新用のタイマー開始
                const timer = startRefreshTimer()
                return () => {
                    clearInterval(timer)
                }
            } else {
                //userが取得できなかった場合
                try {
                    //リフレッシュする
                    await refresh()
                    //新しいトークンでもう1回叩く
                    await auth()
                } catch (e) {
                    //accessTokenもrefreshTokenもexpireしているので、ログアウト状態とする
                    if (isAxiosError(e)) console.log(e)
                    return
                }
            }
        }
    }
    useEffect(() => {
        auth()
    }, [])
    const startRefreshTimer = (): NodeJS.Timer => {
        return setInterval(async () => {
            refresh()
        }, TOKEN_REFRESH_INTERVAL_SEC * 1000)
    }
    const refresh = async () => {
        const { accessToken } = await refreshToken()
        localStorage.setItem('access_token', accessToken)
    }
    const onVisit = () => {
        //TOPのonVisit要らなくなったら消す
        console.log('top')
    }
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Header user={user} />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: '',
                    element: <Top onVisit={onVisit} />,
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
