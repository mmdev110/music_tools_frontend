import axios, { AxiosResponse, AxiosError, isAxiosError } from 'axios'
import { User, UserSong, Tag, UserSongSearchCondition } from 'types/'
import lo from 'lodash'
import { BACKEND_URL } from 'config/front'

const backend = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
})

const configBackend = () => {
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
    backend.interceptors.request.use((request: any) => {
        if (request.method == 'get') {
            const convertParams = mapKeysSnakeCase(request.params)
            return { ...request, params: convertParams }
        } else {
            const convertedData = mapKeysSnakeCase(request.data)
            return { ...request, data: convertedData }
        }
    })

    backend.interceptors.response.use(
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
configBackend()

//jwtによる認証
export const getUser = async (): Promise<User | null> => {
    const jwt = window.localStorage.getItem('access_token')
    if (!jwt) return null
    const response = await requestBackend<User>('user', 'GET')
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
    const response = await requestBackend<SignInResponse>('signin', 'POST', {
        email,
        password,
    })
    console.log(response)
    return response.data
}
//email,passwordによるsignup
export const signUp = async (
    email: string,
    password: string
): Promise<User> => {
    const response = await requestBackend<User>('signup', 'POST', {
        email,
        password,
    })
    console.log(response)
    return response.data
}

export const saveUserSong = async (
    song: UserSong,
    userSongId: string
): Promise<UserSong> => {
    const b = conversionToBackend(song)
    const response = await requestBackend<UserSong>(
        `song/${userSongId}`,
        'POST',
        b
    )

    return conversionFromBackend(response.data)
}
type GeneralResponse = {
    Message: string
}

export const deleteUserSong = async (id: number): Promise<GeneralResponse> => {
    const response = await requestBackend<GeneralResponse>(
        'delete_song',
        'POST',
        { id: id }
    )
    return response.data
}

export const getUserSong = async (userSongId: number): Promise<UserSong> => {
    const response = await requestBackend<UserSong>(`song/${userSongId}`, 'GET')
    return conversionFromBackend(response.data)
}
export const getUserSongs = async (
    condition: UserSongSearchCondition
): Promise<UserSong[]> => {
    const response = await requestBackend<UserSong[]>('list', 'POST', condition)
    const resp = response.data.map((song) => conversionFromBackend(song))
    return resp
}
//疎通確認
export const healthCheck = async (): Promise<boolean> => {
    const response = await requestBackend<boolean>('_chk', 'GET')
    console.log(response.data)
    return response.data
}

type ResRefresh = {
    accessToken: string
}
export const refreshToken = async (): Promise<ResRefresh> => {
    const response = await requestBackend<ResRefresh>('refresh', 'POST')
    return response.data
}
const requestBackend = async <T>(
    endpoint: string,
    method: string,
    data?: any
): Promise<AxiosResponse<T, any>> => {
    const url = endpoint
    const jwt = window.localStorage.getItem('access_token')
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: jwt ? 'Bearer ' + jwt : '',
        },
    }
    let response: AxiosResponse<T>
    console.log(method === 'POST')
    if (method === 'POST') {
        response = await backend.post(url, data, config)
    } else {
        response = await backend.get(url, config)
    }
    return response
}

export const uploadToS3 = async (presignedUrl: string, file: File) => {
    console.log('@@@uploadToS3')

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
    console.log('@@@getFromS3')
    console.log('@@@presignedUrl')
    console.log(presignedUrl)
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
        { newPassword: newPassword, token: token }
    )
    return response.data
}

//ユーザーのtag一覧の取得
export const getTags = async (): Promise<Tag[]> => {
    const response = await requestBackend<Tag[]>('tags', 'GET')
    return response.data
}
//ユーザーのtag更新
export const saveTags = async (data: Tag[]): Promise<Tag[]> => {
    const response = await requestBackend<Tag[]>('tags', 'POST', data)
    return response.data
}

//sectionのprogressions, midiのrootsをCSVに変換する
//上の値はバックエンドではCSV(文字列)として扱っているため
const conversionToBackend = (song: UserSong) => {
    //progressionsの変換
    if (song.sections.length > 0) {
        for (let i = 0; i < song.sections.length; i++) {
            const sec = song.sections[i]
            const progressions = sec.progressions
            song.sections[i].progressionsCSV = arrayToCSV(progressions)

            if (sec.midi) {
                song.sections[i].progressionsCSV = arrayToCSV(
                    sec.midi.midiRoots
                )
            }
        }
    }
    return song
}
//sectionのprogressions, midiのrootsをCSVから戻す
//conversionToBackendの逆操作
const conversionFromBackend = (song: UserSong) => {
    //progressionsの変換
    if (song.sections.length > 0) {
        for (let i = 0; i < song.sections.length; i++) {
            const sec = song.sections[i]
            const progressionsCSV = sec.progressionsCSV
            song.sections[i].progressions = CSVToArray(
                progressionsCSV
            ) as string[]

            if (sec.midi) {
                song.sections[i].midi!.midiRoots = CSVToArray(
                    sec.midi.midiRootsCSV
                ) as number[]
            }
        }
    }
    return song
}

const arrayToCSV = (arr: any[]): string => {
    return arr.join(',')
}
const CSVToArray = (csv: string): string[] | number[] => {
    const array = csv.split(',')
    if (typeof parseInt(array[0], 10) === 'number') {
        return array.map((elem) => {
            return parseInt(elem, 10)
        })
    } else {
        return array
    }
}
