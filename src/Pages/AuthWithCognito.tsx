import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { authWithToken } from 'API/request'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { Auth } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

//以前はsigninとsignupに分かれていたが、
//cognito側でsigninとsignupをまとめて処理してるので、
//コンポーネント側も処理をまとめる必要あり
const AuthResult = ({ signOut, user }: WithAuthenticatorProps) => {
    const navigate = useNavigate()
    const [resultMsg, setResultMsg] = useState('')
    const [errMsg, setErrMsg] = useState('')
    useEffect(() => {
        register().then(() => {
            setTimeout(() => {
                redirectToTop()
            }, 2000)
        })
    }, [])
    const register = async () => {
        try {
            //情報取り出し
            const token = await getIDToken()
            //バックエンドに投げる
            const user = await authWithToken(token)
            console.log(user)
        } catch (e) {
            if (isAxiosError(e)) setErrMsg(e.message)
        }
    }
    const redirectToTop = () => {
        navigate('/')
        window.location.reload()
    }
    const getIDToken = async (): Promise<string> => {
        if (!user) {
            return ''
        }
        const sess = await Auth.currentSession()
        const idToken = sess.getIdToken().getJwtToken()
        return idToken
    }
    return (
        <BasicPage>
            {errMsg ? (
                <div>{errMsg}</div>
            ) : (
                <div>ログインに成功しました。トップページに移動します。</div>
            )}
        </BasicPage>
    )
}

export default withAuthenticator(AuthResult, {
    initialState: 'signIn',
    loginMechanisms: ['email'],
    socialProviders: ['google'],
    variation: 'default',
})
