export const ACCESS_TOKEN_DURATION_SEC = 60
//アクセストークンが切れる少し前にリフレッシュさせる
export const TOKEN_REFRESH_INTERVAL_SEC = ACCESS_TOKEN_DURATION_SEC - 5
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
console.log({ BACKEND_URL })
