import React, { useState } from 'react'
import { isAxiosError } from 'axios'
import { resetPasswordRequest } from 'API/request'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { validateEmail } from 'utils/front'
const ResetReq = () => {
    const [email, setEmail] = useState({ email: '', error: '' })
    const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        const err = validateEmail(input)
        const newEmail = { ...email, email: input }
        //エラーが無くなったら消してあげる
        if (email.error && err === '') newEmail.error = err
        setEmail(newEmail)
    }

    const [resultText, setResultText] = useState('')
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const err = validate()
            if (err) return
            const result = await resetPasswordRequest(email.email)
            setResultText(`mail sent to:${email.email}`)
        } catch (err) {
            console.log(err)
            if (isAxiosError(err)) setResultText(err.response?.data.message)
        }
    }
    const validate = (): boolean => {
        const errText = validateEmail(email.email)
        if (errText) setEmail({ ...email, error: errText })
        return errText !== ''
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>RESET PASSWORD</div>
                <div>
                    パスワードを忘れてしまった場合、サービスに登録されたメールアドレスをご入力ください。
                    <br />
                    パスワードリセット用のリンクをお送りいたします。
                </div>
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-y-5">
                        <div className="flex flex-row">
                            <div className="inline-block w-48 text-left">
                                E-MAIL ADDRESS
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    name="email"
                                    onChange={onEmailChange}
                                />
                                {email.error && (
                                    <div className="text-red-500">
                                        {email.error}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Button type="submit">RESET PASSWORD</Button>
                        </div>
                    </div>
                </form>
                {resultText ? <div>{resultText}</div> : null}
            </div>
        </BasicPage>
    )
}

export default ResetReq
