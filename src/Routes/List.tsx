import React, { useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter, Link } from 'react-router-dom'
import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
//import './App.css'
import { getUserLoops } from 'API/request'
import { isAxiosError } from 'axios'

const List = () => {
    const [userLoops, setUserLoops] = useState<Types.UserLoopInput[]>([])
    const load = async () => {
        try {
            const data = await getUserLoops()
            console.log(data)
            if (data) setUserLoops(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        load()
    }, [])
    return (
        <div className="App">
            <div> List Page</div>
            <Link to="/edit/new">New</Link>
            {userLoops.map((userLoop) => {
                return (
                    <Link
                        key={userLoop.id}
                        to={`/edit/${userLoop.id}`}
                    >{`${userLoop.id}`}</Link>
                )
            })}
        </div>
    )
}

export default List
