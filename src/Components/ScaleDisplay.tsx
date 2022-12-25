import React, { useState, useEffect } from 'react'
import * as Constants from '../Constants'
import * as Types from '../types/music'
import * as Util from '../utils/music'

const ScaleDisplay = ({ scaleForm }: Types.ScaleDisplayProps) => {
    const notes = Util.generateScaleNotes(scaleForm.root, scaleForm.scale)
    const flatOrSharp = Util.getSignatureType(scaleForm.root, scaleForm.scale)
    return (
        <div className="flex gap-x-6 text-2xl">
            {notes.map((note, index) => (
                <div key={index}>{note[flatOrSharp]}</div>
            ))}
        </div>
    )
}

export default ScaleDisplay
