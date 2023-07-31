import React, { useState, useContext } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    Outlet,
    useNavigate,
} from 'react-router-dom'
import { UserContext } from 'App'
import TEXT from 'config/text'
import { TERMS } from 'config/music'
import Detail from 'Pages/Detail'
import { User } from 'types/'
import { forEachChild } from 'typescript'
type props = {
    isOnline: boolean
}
const Header = ({ isOnline }: props) => {
    const navigate = useNavigate()
    const user = useContext(UserContext)
    const signOut = async () => {
        window.localStorage.removeItem('access_token')
        navigate('/')
        //jwt消してリロードすることでApp.tsxのタイマーが消える
        window.location.reload()
    }

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
                    {user ? (
                        <div className="hover:cursor-pointer" onClick={signOut}>
                            SIGN OUT
                        </div>
                    ) : (
                        <div className="flex gap-x-2">
                            <div>
                                <Link to="signin">SIGN IN</Link>
                            </div>
                            <div>|</div>
                            <div>
                                <Link to="signup">SIGN UP</Link>
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
