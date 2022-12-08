import React, { useEffect, useState } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    Link,
    useNavigate,
} from 'react-router-dom'
import { TERMS } from 'Constants'
import Detail from 'Routes/Detail'
import * as Types from 'types'
import * as Utils from 'utils'
//import './App.css'
import { getUserLoops } from 'API/request'
import { isAxiosError } from 'axios'
import BasicPage from 'Components/BasicPage'
import { Button } from 'Components/HTMLElementsWrapper'

const List = () => {
    const navigate = useNavigate()
    const [userLoops, setUserLoops] = useState<Types.UserLoopInput[]>([])
    const load = async () => {
        try {
            const data = await getUserLoops()
            if (data) setUserLoops(data)
        } catch (err) {
            if (isAxiosError(err)) console.log(err.response)
        }
    }
    useEffect(() => {
        load()
    }, [])
    const navigateNew = () => {
        navigate('/edit/new')
    }
    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                <div>YOUR LOOPS</div>
                <div>
                    <Button onClick={navigateNew}>New</Button>
                </div>
                <div className="flex flex-col gap-y-5">
                    {userLoops.length ? (
                        userLoops.map((userLoop) => {
                            return (
                                <Link
                                    key={`userLoop${userLoop.id!.toString()}`}
                                    to={`/edit/${userLoop.id}`}
                                >{`${userLoop.id}`}</Link>
                            )
                        })
                    ) : (
                        <div>NO LOOPS. LET'S CREATE ONE!!</div>
                    )}
                </div>
            </div>
        </BasicPage>
    )
}

export default List
