import React, { useState } from 'react'
import { Route, Routes, BrowserRouter, Link, Outlet } from 'react-router-dom'

import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
import 'App.css'
import { forEachChild } from 'typescript'
type props = {
    user: Types.User | null
}
const Header = ({ user }: props) => {
    return (
        <div className="App">
            <div>Header Page</div>
            {user ? (
                <div>{`Welcome! ${user.email}`}</div>
            ) : (
                'You are not logged in.'
            )}
            {user ? (
                <Link to="signout">SignOut</Link>
            ) : (
                <div>
                    <div>
                        <Link to="signin">SignIn</Link>
                    </div>
                    <div>
                        <Link to="signup">SignUp</Link>
                    </div>
                </div>
            )}
            <Link to="list">List</Link>
            <Link to="/">Top</Link>
            <Outlet />
        </div>
    )
}

export default Header
