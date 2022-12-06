import axios, { AxiosResponse, AxiosError, isAxiosError } from 'axios'
import { User, UserLoopInput } from 'types'
import lo from 'lodash'

//requestをcamel->snakeに、
//response.dataをsnake->camelにするための処理
//programabl.com/ja/convert-snakecase-and-camelcase/
const mapKeysDeep = (
    data: any,
    callback: (value: string, key: string) => {}
): object => {
    if (lo.isArray(data)) {
        return data.map((innerData: object) => mapKeysDeep(innerData, callback))
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

const backend = axios.create({ baseURL: 'http://localhost:5000/' })

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
export const saveUserLoop = async (
    input: UserLoopInput,
    userLoopId: string
) => {
    const response = await requestBackend<UserLoopInput>(
        `loop/${userLoopId}`,
        'POST',
        input
    )
    return response.data
}
export const getUserLoop = async (userLoopId: number) => {
    const response = await requestBackend<UserLoopInput>(
        `loop/${userLoopId}`,
        'GET'
    )
    return response.data
}
export const getUserLoops = async (): Promise<UserLoopInput[]> => {
    const response = await requestBackend<UserLoopInput[]>('list', 'GET')
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
