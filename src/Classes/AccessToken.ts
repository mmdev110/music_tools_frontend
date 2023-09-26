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
    static findCurrentToken = async (): Promise<string> => {
        const sess = await Auth.currentSession()
        const idToken = sess.getIdToken().getJwtToken()
        return idToken
    }
}
