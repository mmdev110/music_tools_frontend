import React, { useState, useEffect, createContext } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { TOKEN_REFRESH_INTERVAL_SEC } from 'config/front'
import { User } from './types'
import Header from 'Pages/Header'
import Top from 'Pages/Top'
import Detail from 'Pages/Detail'
import List from 'Pages/List'
import ResetNew from 'Pages/ResetNew'
import ResetReq from 'Pages/ResetReq'
import ErrorPage from 'Pages/ErrorPage'
import Health from 'Pages/Health'
import OtherTools from 'Pages/OtherTools'
import EmailConfirm from 'Pages/EmailConfirm'
import Builder from 'Pages/Builder'
import AuthWithCognito from 'Pages/AuthWithCognito'
import SignOut from 'Pages/SignOut'
import {
    getUser,
    authWithToken,
    healthCheck,
    accessToken,
    signOut,
} from 'API/request'

import { I18n } from 'aws-amplify'
import { translations } from '@aws-amplify/ui-react'
import AWS from 'config/aws'
import { Amplify, Auth } from 'aws-amplify'
import AccessToken from 'Classes/AccessToken'
I18n.putVocabularies(translations)
I18n.setLanguage('ja')
export const UserContext = createContext<User | null>(null)
export const TokenContext = createContext<AccessToken | null>(null)

Amplify.configure({
    Auth: {
        region: AWS.REGION,
        userPoolId: AWS.USER_POOL_ID,
        userPoolWebClientId: AWS.USER_POOL_APP_CLIENT_ID,
        //authenticationFlowType: 'USER_PASSWORD_AUTH',
        oauth: {
            domain: AWS.COGNITO_DOMAIN,
            redirectSignIn: process.env.REACT_APP_FRONTEND_URL + '/auth',
            redirectSignOut: process.env.REACT_APP_FRONTEND_URL + '/auth',
            scope: ['email', 'openid'],
            cliendId: AWS.GOOGLE_CLIENT_ID,
            responseType: 'code',
        },
    },
})

const App = () => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<AccessToken | null>(null)
    const [authFinished, setAuthFinished] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    const chk = async () => {
        try {
            await healthCheck()
        } catch (e) {
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
            //tokenを探す
            const token = await AccessToken.init()
            await accessToken.updateToken() //userにtokenを内包したので、消したい
            setToken(token)
            //tokenでuser取得
            const userResult = await getUser()
            if (userResult) me = userResult
            if (me) {
                me.token = token
                setUser(me)
            } else {
                //できなかった場合の処理をどうするか
            }
        } catch (e) {
            if (isAxiosError(e)) {
                console.log(e)
            } else {
                //no current user
                console.log(e)
            }
        }
        setAuthFinished(true)
    }
    useEffect(() => {
        chk()
        auth()
    }, [])
    const router = createBrowserRouter([
        {
            path: '',
            element: <Header isOnline={isOnline} />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: '/',
                    element: <Top />,
                },
                //{
                //    path: 'signin',
                //    element: <SignInWithCognito />,
                //},
                {
                    path: 'auth',
                    element: <AuthWithCognito />,
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
                    path: 'health',
                    element: <Health />,
                },
                {
                    path: 'other_tools',
                    element: <OtherTools />,
                },
                {
                    path: 'build',
                    element: <Builder />,
                },
                {
                    path: 'signout',
                    element: <SignOut />,
                },
            ],
        },
    ])
    return (
        <UserContext.Provider value={user}>
            <TokenContext.Provider value={token}>
                {authFinished ? <RouterProvider router={router} /> : null}
            </TokenContext.Provider>
        </UserContext.Provider>
    )
}

export default App
