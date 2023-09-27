import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import BasicPage from 'Components/BasicPage'
import { TokenContext } from 'App'
//以前はsigninとsignupに分かれていたが、
//cognito側でsigninとsignupをまとめて処理してるので、
//コンポーネント側も処理をまとめる必要あり
const SignOut = () => {
    const navigate = useNavigate()
    const token = useContext(TokenContext)
    console.log(token)
    const [resultMsg, setResultMsg] = useState('')
    const [errMsg, setErrMsg] = useState('')
    useEffect(() => {
        signOut()
    }, [])

    const signOut = async () => {
        try {
            if (token) {
                await token.signOut()
            }
            setTimeout(() => {
                redirectToTop()
            }, 2000)
        } catch (e) {
            const err = e as unknown as Error
            setErrMsg(err.message)
        }
    }
    const redirectToTop = () => {
        navigate('/')
        window.location.reload()
    }

    return (
        <BasicPage>
            {errMsg ? (
                <div>{errMsg}</div>
            ) : (
                <div>ログアウトしました。トップページに移動します。</div>
            )}
        </BasicPage>
    )
}

export default SignOut
