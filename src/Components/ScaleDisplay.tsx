import React, { useState, useEffect } from 'react'
import * as Constants from '../constants'
import * as Types from '../types'
import * as Util from '../utils'

const ScaleDisplay = ({ scaleForm }: Types.ScaleDisplayProps) => {
    console.log('@@@@ScaleDisplay')
    console.log(scaleForm)
    const notes = Util.generateScaleNotes(scaleForm.root, scaleForm.scale)
    const flatOrSharp = Util.getSignatureType(scaleForm.root, scaleForm.scale)
    console.log(notes)
    return (
        <div className="Scale-Display">
            {notes.map((note, index) => (
                <div key={index}>{note[flatOrSharp]}</div>
            ))}
        </div>
    )
}

export default ScaleDisplay
