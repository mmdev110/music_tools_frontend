import React, { useState } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    Outlet,
    useNavigate,
} from 'react-router-dom'

import { TERMS } from 'Constants'
import Detail from 'Pages/Detail'
import { User } from 'types/'
import { forEachChild } from 'typescript'
type props = {
    user: User | null
}
const Header = ({ user }: props) => {
    const navigate = useNavigate()
    const signOut = async () => {
        window.localStorage.removeItem('jwt')
        navigate('/')
        window.location.reload()
    }
    return (
        <div className="font-mono">
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
