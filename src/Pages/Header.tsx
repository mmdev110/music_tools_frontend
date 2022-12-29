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
    return (
        <div className="font-mono">
            {!isOnline && (
                <div className="bg-red-700 text-center font-bold text-slate-100">
                    オフライン動作中
                </div>
            )}
            <div className="flex justify-between bg-stone-600 px-20  text-slate-100">
                <Link to="/">LOOP ANALYZER</Link>
                <div className="flex">
                    {user ? (
                        <div>{`Welcome! ${user.email} |`}</div>
                    ) : (
                        'You are not logged in. |'
                    )}
                    {user ? (
                        <div className="flex">
                            <div>
                                <Link to="list">List |</Link>
                            </div>
                            <div
                                className="hover:cursor-pointer"
                                onClick={signOut}
                            >
                                SignOut |
                            </div>
                        </div>
                    ) : (
                        <div className="flex">
                            <div>
                                <Link to="signin">SignIn |</Link>
                            </div>
                            <div>
                                <Link to="signup">SignUp |</Link>
                            </div>
                        </div>
                    )}
                    <Link to="/">Top</Link>
                </div>
            </div>
            <Outlet />
        </div>
    )
}

export default Header
