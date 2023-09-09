import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { confirmEmail } from 'API/request'
import BasicPage from 'Components/BasicPage'
const EmailConfirm = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    useEffect(() => {
        console.log(token)
        if (token) {
            confirm(token)
        }
    }, [])
    const confirm = async (token: string) => {
        try {
            await confirmEmail(token)
        } catch (e) {
            console.log(e)
            if (isAxiosError(e)) {
                let msg = ''
                const { code, message } = e.response!.data
                switch (code) {
                    case 1:
                        msg = '対象のユーザーが見つかりませんでした'
                        break
                    case 3:
                        msg = 'メールアドレスは既に確認済みです'
                        break
                    case 102:
                        msg = '不正なトークン、または期限切れのトークンです'
                        break
                    default:
                        msg = message
                }
                setMessage(msg)
            }
        }
        navigate('/signin')
    }
    const [message, setMessage] = useState('')
    return (
        <BasicPage>
            <div>hi</div>
            <div>{message}</div>
        </BasicPage>
    )
}

export default EmailConfirm
