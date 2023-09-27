import { Auth } from 'aws-amplify'

export default class AccessToken {
    constructor(private _token: string) {}
    update = (newToken: string) => {
        this._token = newToken
    }
    get = () => {
        return this._token
    }
    signOut = async () => {
        await Auth.signOut()
        this.update('')
    }
    isLogin = () => {
        return this._token !== ''
    }
    updateToken = async () => {
        const newIdToken = await AccessToken.findCurrentToken()
        this._token = newIdToken
    }
    static init = async (): Promise<AccessToken> => {
        const idToken = await AccessToken.findCurrentToken()
        const token = new AccessToken(idToken)
        return token
    }
    private static findCurrentToken = async (): Promise<string> => {
        const sess = await Auth.currentSession()
        const idToken = sess.getIdToken().getJwtToken()
        return idToken
    }
}
