import React, { useEffect, useState } from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'

import { TERMS } from 'Constants'
import * as Types from 'types'
import * as Utils from 'utils'
import { forEachChild, isPropertySignature } from 'typescript'

type props = {
    onVisit: Function
}
const Top = ({ onVisit }: props) => {
    useEffect(() => {
        console.log('auth')
        onVisit()
    }, [])
    return <div className="App">Top Page</div>
}

export default Top
