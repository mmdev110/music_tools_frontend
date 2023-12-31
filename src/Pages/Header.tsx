import React, { useContext } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { UserContext } from 'App'
import { accessToken } from 'API/request'
import TEXT from 'config/text'
type props = {
    isOnline: boolean
}
const Header = ({ isOnline }: props) => {
    const navigate = useNavigate()
    const user = useContext(UserContext)

    //edit中にedit/newに<Link>で遷移すると入力データがリセットされないので更新させる
    const toNewSong = async () => {
        navigate('/edit/new')
        window.location.reload()
    }
    return (
        <div className="font-mono">
            {!isOnline && (
                <div className="bg-red-700 text-center font-bold text-slate-100">
                    オフライン動作中
                    <Link
                        to="health"
                        className="ml-8 font-bold text-blue-300 underline"
                    >
                        詳細
                    </Link>
                </div>
            )}
            <div className="flex justify-between bg-stone-600 px-20  text-slate-100">
                <Link to="/">{TEXT.SERVICE_NAME}</Link>
                <div className="flex gap-x-1">
                    {user ? (
                        <div>{`Welcome! ${user.email} |`}</div>
                    ) : (
                        'Not Logged In. |'
                    )}
                    <div>
                        <div
                            className="hover:cursor-pointer"
                            onClick={toNewSong}
                        >
                            NEW
                        </div>
                    </div>
                    <div>|</div>
                    <div>
                        <Link to="list">LIST</Link>
                    </div>
                    <div>|</div>
                    <div>
                        <Link to="build">BUILD</Link>
                    </div>
                    <div>|</div>
                    <div>
                        <Link to="other_tools">TOOLS</Link>
                    </div>
                    <div>|</div>
                    {user?.token.isLogin() ? (
                        <Link to="signout">SIGN OUT</Link>
                    ) : (
                        <div className="flex gap-x-2">
                            <div>
                                <Link to="auth">SIGN IN</Link>
                            </div>
                        </div>
                    )}
                    <div>|</div>
                    <Link to="/">TOP</Link>
                </div>
            </div>
            <Outlet />
        </div>
    )
}

export default Header
