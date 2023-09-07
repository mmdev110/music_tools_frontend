import React, { useEffect, useState, useContext } from 'react'
import { backendManager } from 'API/request'
import { isAxiosError } from 'axios'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'

type Status = {
    backendStatus: string
    dbStatus: string
}

const Health = () => {
    const [status, setStatus] = useState<Status>({
        backendStatus: '',
        dbStatus: '',
    })
    const [errorText, setErrorText] = useState('')
    const [resultText, setResultText] = useState('')
    useEffect(() => {
        getStatus()
    }, [])
    const getStatus = async () => {
        const req = {
            action: 'status',
            force: false,
        }
        try {
            const res = await backendManager(req)
            const status: Status = {
                backendStatus: res.backendStatus,
                dbStatus: res.dbStatus,
            }
            setStatus({ ...status })
            setErrorText('')
            setResultText('更新しました。')
        } catch (e) {
            if (isAxiosError(e)) {
                setErrorText('getStatus failed: ' + e.message)
            }
        }
    }

    const apply = async () => {
        try {
            const req = {
                action: 'apply',
                force: false,
            }
            const res = await backendManager(req)
            setResultText('再開リクエストを送信しました。')
            setErrorText('')
        } catch (e) {
            if (isAxiosError(e)) {
                setErrorText('apply failed: ' + e.message)
            }
        }
    }
    return (
        <BasicPage>
            <div className="mt-8 flex flex-col gap-y-4">
                <div>
                    維持費削減のため、利用のない時間帯はサービスを停止しています。
                    <br />
                    こちらのページではサービスの停止状況の確認と、停止されたサービスの再開を行うことができます。
                    <br />
                    ※サービス再開リクエストから利用可能になるまで、約10分ほどかかります。
                </div>
                <Status
                    status={status}
                    updateStatus={getStatus}
                    execApply={apply}
                />
                {errorText !== '' ? (
                    <div className="bold text-red-500">{errorText}</div>
                ) : null}
                {resultText !== '' ? (
                    <div className="bold">{resultText}</div>
                ) : null}
            </div>
        </BasicPage>
    )
}

type StatusProps = {
    status: Status
    updateStatus: () => void
    execApply: () => void
}
const Status = ({ status, updateStatus, execApply }: StatusProps) => {
    const { backendStatus, dbStatus } = status
    const isOperating = () =>
        backendStatus === 'running' && dbStatus === 'available'
    const isApplying = () =>
        backendStatus === 'stopped' && dbStatus === 'starting'

    const isStopping = () =>
        backendStatus === 'stopped' && dbStatus === 'stopping'
    const canApply = () => backendStatus === 'stopped' && dbStatus == 'stopped'
    return (
        <div>
            <div>backendStatus: {status.backendStatus}</div>
            <div>dbStatus: {status.dbStatus}</div>

            {isOperating() ? (
                <div>現在サービスは稼働しています</div>
            ) : isStopping() ? (
                <div>現在サービスを停止中です</div>
            ) : isApplying() ? (
                <div>現在サービスを起動中です</div>
            ) : (
                <div>現在サービスは稼働していません</div>
            )}
            <div className="flex gap-x-4">
                <Button onClick={updateStatus}>更新</Button>
                {canApply() ? (
                    <Button onClick={execApply}>起動する</Button>
                ) : null}
            </div>
        </div>
    )
}

export default Health
