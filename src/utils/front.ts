//front関連のutil

export const validateEmail = (input: string): string => {
    const re =
        /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/

    return re.test(input) ? '' : '無効なアドレスです'
}
export const validatePassword = (input: string): string => {
    if (input.length < 8) return 'パスワードは8文字以上入力してください'
    return ''
}
