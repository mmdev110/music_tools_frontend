import React, { useState, useEffect, useRef, createContext } from 'react'
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
import OtherTools from 'Pages/OtherTools'
import EmailConfirm from 'Pages/EmailConfirm'
import Builder from 'Pages/Builder'
import {
    getUser,
    refreshToken,
    healthCheck,
    accessToken,
    signOut,
} from 'API/request'

export const UserContext = createContext<User | null>(null)
const App = () => {
    const [user, setUser] = useState<User | null>(null)
    const [authFinished, setAuthFinished] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    const chk = async () => {
        try {
            await healthCheck()
        } catch (e) {
            console.log(e)
            if (isAxiosError(e)) {
                if (e.code == 'ERR_NETWORK') setIsOnline(false)
                return
            }
            throw e
        }
    }
    const auth = async () => {
        let me: User | null = null
        try {
            //cookieのrefresh_tokenからaccess_token生成
            await refresh()
            const userResult = await getUser()
            if (userResult) me = userResult
            if (me) {
                setUser(me)
                //アクセストークン更新用のタイマー開始
                const timer = startRefreshTimer()
            }
        } catch (e) {
            if (isAxiosError(e)) console.log(e)
        }
        setAuthFinished(true)
    }
    useEffect(() => {
        chk()
        auth()
    }, [])
    const startRefreshTimer = (): NodeJS.Timer => {
        console.log('@@@@REFRESH TIMER START')
        return setInterval(async () => {
            refresh()
        }, TOKEN_REFRESH_INTERVAL_SEC * 1000)
    }
    const refresh = async () => {
        const res = await refreshToken()
        accessToken.update(res.accessToken)
    }
    const onVisit = () => {
        //TOPのonVisit要らなくなったら消す
        console.log('top')
    }
    const onSignOut = async () => {
        try {
            //refresh_tokenの削除リクエスト
            const res = await signOut()
            accessToken.update('')
        } catch (e) {
            if (isAxiosError(e)) console.log(e)
        }
    }
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Header isOnline={isOnline} onSignOut={onSignOut} />,
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
                    path: 'edit/:uuid',
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
                {
                    path: 'email_confirm',
                    element: <EmailConfirm />,
                },
                {
                    path: 'other_tools',
                    element: <OtherTools />,
                },
                {
                    path: 'build',
                    element: <Builder />,
                },
            ],
        },
    ])
    return (
        <UserContext.Provider value={user}>
            {authFinished ? <RouterProvider router={router} /> : null}
        </UserContext.Provider>
    )
}

export default App
