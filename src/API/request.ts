import axios, { AxiosResponse, AxiosInstance } from 'axios'
import { User, UserSong, Tag, UserSongSearchCondition, Genre } from 'types/'
import lo from 'lodash'
import { BACKEND_URL } from 'config/front'
import AccessToken from 'Classes/AccessToken'

//このグローバル変数を消したい
export const accessToken = new AccessToken('')

const backend = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
})

const configBackend = (instance: AxiosInstance) => {
    //request.params, request.dataをcamel->snakeに、
    //response.dataをsnake->camelにするための処理
    //programabl.com/ja/convert-snakecase-and-camelcase/
    const mapKeysDeep = (
        data: any,
        callback: (value: string, key: string) => {}
    ): object => {
        if (lo.isArray(data)) {
            return data.map((innerData: object) =>
                mapKeysDeep(innerData, callback)
            )
        } else if (lo.isObject(data)) {
            return lo.mapValues(lo.mapKeys(data, callback), (val: any) =>
                mapKeysDeep(val, callback)
            )
        } else {
            return data
        }
    }

    const mapKeysCamelCase = (data: object) => {
        return mapKeysDeep(data, (_: string, key: string) => lo.camelCase(key))
    }

    const mapKeysSnakeCase = (data: object) => {
        return mapKeysDeep(data, (_: string, key: string) => lo.snakeCase(key))
    }
    instance.interceptors.request.use((request: any) => {
        if (request.method == 'get') {
            const convertParams = mapKeysSnakeCase(request.params)
            return { ...request, params: convertParams }
        } else {
            const convertedData = mapKeysSnakeCase(request.data)
            return { ...request, data: convertedData }
        }
    })

    instance.interceptors.response.use(
        (response: any) => {
            const { data } = response
            const convertedData = mapKeysCamelCase(data)
            return { ...response, data: convertedData }
        },
        (error) => {
            //const message = 'error message'
            return Promise.reject(error)
        }
    )
}
configBackend(backend)

export const getUser = async (): Promise<User | null> => {
    const jwt = accessToken.get() || null
    if (!jwt) return null
    const response = await requestBackend<User>('user', 'GET', true)
    //console.log(response)
    return response.data
}
//email,passwordによるsignin
type SignInResponse = {
    user: User
    accessToken: string
}
export const signIn = async (
    email: string,
    password: string
): Promise<SignInResponse> => {
    const response = await requestBackend<SignInResponse>(
        'signin',
        'POST',
        false,
        {
            email,
            password,
        }
    )
    return response.data
}
export const authWithToken = async (token: string): Promise<User> => {
    accessToken.update(token)
    const response = await requestBackend<User>('auth_with_token', 'POST', true)
    const me = response.data
    return me
}
type SignOutResponse = { message: string }
export const signOut = async (): Promise<SignOutResponse> => {
    const response = await requestBackend<SignOutResponse>(
        'signout',
        'GET',
        true
    )
    return response.data
}
//email,passwordによるsignup
export const signUp = async (
    email: string,
    password: string
): Promise<User> => {
    const response = await requestBackend<User>('signup', 'POST', true, {
        email,
        password,
    })
    return response.data
}

export const saveUserSong = async (
    song: UserSong,
    userSongId: string
): Promise<UserSong> => {
    const b = toBackend(song)
    const response = await requestBackend<UserSong>(
        `song/${userSongId}`,
        'POST',
        true,
        b
    )

    return fromBackend(response.data)
}
type GeneralResponse = {
    Message: string
}

export const deleteUserSong = async (id: number): Promise<GeneralResponse> => {
    const response = await requestBackend<GeneralResponse>(
        'delete_song',
        'POST',
        true,
        { id: id }
    )
    return response.data
}

export const getUserSong = async (uuid: string): Promise<UserSong> => {
    const response = await requestBackend<UserSong>(`song/${uuid}`, 'GET', true)
    return fromBackend(response.data)
}
export const getUserSongs = async (
    condition: UserSongSearchCondition
): Promise<UserSong[]> => {
    const response = await requestBackend<UserSong[]>(
        'list',
        'POST',
        true,
        condition
    )
    const resp = response.data.map((song) => fromBackend(song))
    return resp
}
//疎通確認
export const healthCheck = async (): Promise<boolean> => {
    const response = await requestBackend<boolean>('_chk', 'GET', false)
    return response.data
}

const requestBackend = async <T>(
    endpoint: string,
    method: string,
    authRequired: boolean,
    data?: any
): Promise<AxiosResponse<T, any>> => {
    const url = endpoint
    const jwt = accessToken.get() || null

    const config = { headers: {} }
    config.headers = {
        'Content-Type': 'application/json',
    }
    if (authRequired && jwt)
        config.headers = { ...config.headers, Authorization: 'Bearer ' + jwt }
    let response: AxiosResponse<T>
    if (method === 'POST') {
        response = await backend.post(url, data, config)
    } else {
        response = await backend.get(url, config)
    }
    return response
}

export const uploadToS3 = async (presignedUrl: string, file: File) => {
    try {
        const config = {
            //params: { Key: file.name, ContentType: file.type },
            headers: {
                'Content-Type': file.type,
            },
        }
        const response = await axios.put(presignedUrl, file, config)
        return response
    } catch (err) {
        throw err
    }
}
export const getFromS3 = async (presignedUrl: string) => {
    //const response = await axios.get(presignedUrl)
    const response = await fetch(presignedUrl)
    return response
}
type ResetPasswordResponse = { message: string }
export const resetPasswordRequest = async (
    email: string
): Promise<ResetPasswordResponse> => {
    const response = await requestBackend<ResetPasswordResponse>(
        'reset_password?action=request',
        'POST',
        true,
        { email: email }
    )
    //console.log(response.data)
    return response.data
}
export const setNewPassword = async (
    newPassword: string,
    token: string
): Promise<User> => {
    const response = await requestBackend<User>(
        'reset_password?action=reset',
        'POST',
        false,
        { newPassword: newPassword, token: token }
    )
    return response.data
}
export const confirmEmail = async (token: string): Promise<User> => {
    const response = await requestBackend<User>(
        'email_confirm',
        'POST',
        false,
        {
            token: token,
        }
    )
    return response.data
}

//ユーザーのtag一覧の取得
export const getTags = async (): Promise<Tag[]> => {
    const response = await requestBackend<Tag[]>('tags', 'GET', true)
    return response.data
}
//ユーザーのtag更新
export const saveTags = async (data: Tag[]): Promise<Tag[]> => {
    const response = await requestBackend<Tag[]>('tags', 'POST', true, data)
    return response.data
}
//ユーザーのgenre一覧の取得
export const getGenres = async (): Promise<Genre[]> => {
    const response = await requestBackend<Genre[]>('genres', 'GET', true)
    return response.data
}
//ユーザーのgenre更新
export const saveGenres = async (data: Genre[]): Promise<Genre[]> => {
    const response = await requestBackend<Genre[]>('genres', 'POST', true, data)
    return response.data
}
type BackendManagerReq = {
    action: string
    force: boolean
}
type BackendManagerRes = {
    backendStatus: string
    dbStatus: string
}
export const backendManager = async (
    arg: BackendManagerReq
): Promise<BackendManagerRes> => {
    const endpoint = 'backend_manager'
    const response = await requestBackend<BackendManagerRes>(
        endpoint,
        'POST',
        false,
        arg
    )
    const res = response.data
    return res
}

//sectionのprogressions, midiのrootsをCsvに変換する
//上の値はバックエンドではCsv(文字列)として扱っているため
const toBackend = (song: UserSong) => {
    //progressionsの変換
    song.sections.forEach((section) => {
        const progressions = section.progressions
        section.progressionsCsv = AToC(progressions)
        if (section.midi) {
            section.midi.midiRootsCsv = AToC(section.midi.midiRoots)
        }
    })
    return song
}
//sectionのprogressions, midiのrootsをCsvから戻す
//toBackendの逆操作
const fromBackend = (song: UserSong) => {
    //progressionsの変換
    if (song.sections.length > 0) {
        for (let i = 0; i < song.sections.length; i++) {
            const sec = song.sections[i]
            const progressionsCsv = sec.progressionsCsv
            song.sections[i].progressions = CToA(progressionsCsv) as string[]
            if (sec.midi) {
                song.sections[i].midi!.midiRoots = CToA(
                    sec.midi.midiRootsCsv
                ) as number[]
            }
        }
    }
    return song
}
//array to csv
const AToC = (arr: any[]): string => {
    return arr.join(',')
}
//csv to array
const CToA = (csv: string): string[] | number[] => {
    const array = csv.split(',')
    if (!isNaN(parseInt(array[0], 10))) {
        return array.map((elem) => {
            return parseInt(elem, 10)
        })
    } else {
        return array
    }
}
