import React, { useEffect, useState, useContext, useRef } from 'react'
import {
    Route,
    Routes,
    BrowserRouter,
    useParams,
    useLocation,
} from 'react-router-dom'
import Modal from 'react-modal'
import ScaleForm from 'Components/ScaleForm'
import ScaleDisplay from 'Components/ScaleDisplay'
import ChordDisplay from 'Components/ChordDisplay2'
import Intervals from 'Components/Intervals'
import Section from 'Components/Section'
import Modes from 'Components/Modes'
import DiatonicChords from 'Components/DiatonicChords'
import SequenceAnalyzer from 'Components/SequenceAnalyzer'
import MidiMonitorDescription from 'Components/MidiMonitorDescription'
import MidiMonitor from 'Components/MidiMonitor'
import AudioPlayer from 'Components/AudioPlayer'
import TagModal from 'Pages/Modals/Tag'
import ChordModal from 'Pages/Modals/Chord'
import Memo from 'Components/Memo'
import MediaRangeForm from 'Components/MediaRangeForm'
import { TERMS } from 'config/music'
import { Tag, ScaleFormType, AudioRange, UserSongSection } from 'types'
import { UserSong } from 'types'
import { getFromS3, getUserSong, saveUserSong, uploadToS3 } from 'API/request'
import * as Utils from 'utils/music'
import { isAxiosError } from 'axios'
import { UserContext } from 'App'
import lo from 'lodash'
import BasicPage from 'Components/BasicPage'
import { Button, Input } from 'Components/HTMLElementsWrapper'
import { NoteIntervals } from 'Classes/Chord'

const ModalStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
}

Modal.setAppElement('#root')
const OtherTools = () => {
    const [scaleForm, setScaleForm] = useState<ScaleFormType>({
        root: 0,
        scale: TERMS.MAJOR,
        transposeRoot: null,
    })
    const [scaleForm2, setScaleForm2] = useState<ScaleFormType>({
        root: 0,
        scale: TERMS.MAJOR,
        transposeRoot: null,
    })
    const onScaleFormChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.target.name
        let value = event.target.value
        let newScaleForm: ScaleFormType
        if (name === 'root') {
            newScaleForm = { ...scaleForm, root: parseInt(value) }
        } else {
            newScaleForm = { ...scaleForm, [name]: value }
        }
        setScaleForm(newScaleForm)
    }
    const onScaleFormChange2 = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const name = event.target.name
        let value = event.target.value
        let newScaleForm: ScaleFormType
        if (name === 'root') {
            newScaleForm = { ...scaleForm2, root: parseInt(value) }
        } else {
            newScaleForm = { ...scaleForm2, [name]: value }
        }
        setScaleForm2(newScaleForm)
    }

    return (
        <BasicPage>
            <div className="flex flex-col gap-y-5 pt-10">
                {/*}
                <div className="text-2xl">Intervals</div>
                <div className="ml-6"></div>
                <Intervals />
                {*/}
                <div className="text-2xl">コード構成音とテンション表</div>
                <div className="ml-6">
                    以下の内容を調べることができます。
                    <ul className="list-inside list-disc">
                        <li>各音をルートとした時の各音程に対応するノート</li>
                        <li>メジャー/マイナースケールの構成音</li>
                        <li>メジャー/マイナースケールと構成音が同じモード</li>
                        <li>
                            各ダイアトニックコードのコードトーン(構成音)、テンション、アボイドノート
                        </li>
                    </ul>
                </div>
                <ScaleForm
                    scaleForm={scaleForm}
                    onChange={onScaleFormChange}
                    showTranspose={false}
                />

                <Modes scaleForm={scaleForm} />
                <div className="text-2xl">ダイアトニックコード一覧</div>
                <div className="ml-6">
                    各ルートにおけるメジャー、マイナー、モードでのダイアトニックコード一覧です。
                    <br />
                    各コードをマウスオーバーすると構成音とテンションの一覧が表示されます。(未実装)
                </div>

                <ScaleForm
                    scaleForm={scaleForm2}
                    onChange={onScaleFormChange2}
                    showTranspose={false}
                />

                <DiatonicChords scaleForm={scaleForm2} />

                <div className="text-2xl">MIDI Monitor</div>

                <MidiMonitorDescription />
                <MidiMonitor />
                <div style={{ marginTop: '10em' }}></div>
            </div>
        </BasicPage>
    )
}

export default OtherTools
