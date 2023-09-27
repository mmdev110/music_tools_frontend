import TEXT from 'config/text'
import BasicPage from 'Components/BasicPage'
import HowToUse from 'Components/Descriptions/HowToUse'
import { Button } from 'Components/HTMLElementsWrapper'
import { healthCheck } from 'API/request'
import { Auth } from 'aws-amplify'
type props = {}
const Top = () => {
    const onClick = async () => {
        //await healthCheck()
        const sess = await Auth.currentSession()
        const accessToken = await sess.getAccessToken()
        const idToken = await sess.getIdToken()
        const jwt = idToken.getJwtToken()
        console.log(accessToken.payload)
        console.log(idToken.payload)
        console.log(jwt)
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-2 pt-10">
                <div>
                    {TEXT.SERVICE_NAME}
                    は楽曲分析を自身の音楽制作に活かしていくためのサービスです。
                </div>
                <HowToUse />
                {process.env.REACT_APP_ENV === 'local' ? (
                    <Button onClick={onClick}>テスト</Button>
                ) : null}
            </div>
        </BasicPage>
    )
}

export default Top
