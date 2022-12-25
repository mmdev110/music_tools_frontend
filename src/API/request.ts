import axios, { AxiosResponse, AxiosError, isAxiosError } from 'axios'
import { User, UserLoopInput, Tag, UserLoopSearchCondition } from 'types/'
import lo from 'lodash'

const backend = axios.create({ baseURL: 'http://localhost:5000/' })

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
    const jwt = window.localStorage.getItem('jwt')
    if (!jwt) return null
    const response = await requestBackend<User>('user', 'GET')
    //console.log(response)
    return response.data
}
//email,passwordによるsignin
export const signIn = async (
    email: string,
    password: string
): Promise<User> => {
    const response = await requestBackend<User>('signin', 'POST', {
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
type S3Url = {
    mp3: string
    midi: string
}
type SaveUserLoopResponse = {
    userLoopInput: UserLoopInput
    s3Url: S3Url
}
export const saveUserLoop = async (
    input: UserLoopInput,
    userLoopId: string
): Promise<SaveUserLoopResponse> => {
    const response = await requestBackend<SaveUserLoopResponse>(
        `loop/${userLoopId}`,
        'POST',
        input
    )
    return response.data
}

type GetUserLoopResponse = {
    userLoopInput: UserLoopInput
    s3Url: S3Url
}
export const getUserLoop = async (
    userLoopId: number
): Promise<GetUserLoopResponse> => {
    const response = await requestBackend<GetUserLoopResponse>(
        `loop/${userLoopId}`,
        'GET'
    )
    return response.data
}
export const getUserLoops = async (
    condition: UserLoopSearchCondition
): Promise<UserLoopInput[]> => {
    const response = await requestBackend<UserLoopInput[]>(
        'list',
        'POST',
        condition
    )
    return response.data
}
//疎通確認
export const healthCheck = async (): Promise<boolean> => {
    const response = await requestBackend<boolean>('_chk', 'GET')
    console.log(response.data)
    return response.data
}
const requestBackend = async <T>(
    endpoint: string,
    method: string,
    data?: any
): Promise<AxiosResponse<T, any>> => {
    const url = endpoint
    const jwt = window.localStorage.getItem('jwt')
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: jwt ? 'Bearer ' + jwt : '',
        },
    }
    try {
        let response: AxiosResponse<T>
        if (method === 'POST') {
            response = await backend.post(url, data, config)
        } else {
            response = await backend.get(url, config)
        }
        return response
    } catch (err) {
        throw err
    }
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
