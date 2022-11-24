import React, { useState } from 'react'
import logo from './logo.svg'
import ScaleForm from './Components/ScaleForm'
import ScaleDisplay from './Components/ScaleDisplay'
import ChordDisplay from './Components/ChordDisplay2'
import Intervals from './Components/Intervals'
import Modes from './Components/Modes'
import SequenceAnalyzer from './Components/SequenceAnalyzer'
import MidiMonitorDescription from './Components/MidiMonitorDescription'
import MidiMonitor from './Components/MidiMonitor'
import { TERMS } from './constants'
import * as Types from './types'
import * as Utils from './utils'
import './App.css'
import { forEachChild } from 'typescript'

const onClick = () => {
    console.log('@@@@onClick')
    const root = 9
    const scale_type = 'minor'
}
const App = () => {
    const [scaleForm, setScaleForm] = useState<Types.ScaleForm>({
        root: 0,
        scale: TERMS.MAJOR,
        transposeRoot: null,
    })

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.target.name
        let value = event.target.value
        const newScaleForm = { ...scaleForm, [name]: value }
        console.log('@@newScaleForm', newScaleForm)
        setScaleForm(newScaleForm)
    }

    return (
        <div className="App">
            Tools I Need
            <h2>Scales</h2>
            <ScaleForm onChange={handleChange} showTranspose={true} />
            <ScaleDisplay scaleForm={scaleForm} />
            <h2>Chord Display</h2>
            <ChordDisplay scaleForm={scaleForm} />
            <h2>Intervals</h2>
            <Intervals />
            <h2>Modes</h2>
            <Modes scaleForm={scaleForm} />
            <h2>MIDI Analyzer</h2>
            <SequenceAnalyzer />
            <h2>MIDI Monitor</h2>
            <MidiMonitorDescription />
            <MidiMonitor />
            <div style={{ marginTop: '10em' }}></div>
        </div>
    )
}

export default App
