import React, { useState, useEffect } from 'react'
import * as Constants from '../Constants'
import { TERMS } from '../Constants'
import * as Utils from '../utils'
import * as Types from '../types'
import { SequencerNote, SequencerSetting } from '../types'
import { Midi } from '@tonejs/midi'
import Dropzone from 'react-dropzone'
import MidiTypes from '@tonejs/midi/dist/Note'
import Sequencer from './Sequencer'
import RootForm from './RootForm'

type Props = {
    scaleForm: Types.ScaleForm
    onDrop: (acceptedFiles: File[]) => void
    midiFile: File | undefined
    rootIndexes: number[]
    onMidiNoteClick: (index: number[]) => void
}

type NumberOrNull = number | null
type Form = NumberOrNull[][]
const blankForm: NumberOrNull[] = [null, null, null, null] //1小節分
const initialSetting: SequencerSetting = {
    barLength: 4,
    minOctave: 3,
    maxOctave: 3,
}

const SequenceAnalyzer = ({
    scaleForm,
    onDrop,
    onMidiNoteClick,
    midiFile,
    rootIndexes,
}: Props) => {
    const [notes, setNotes] = useState<SequencerNote[]>([])
    const [setting, setSetting] = useState(initialSetting)
    const [fileName, setFileName] = useState('')

    const processFiles = async (acceptedFiles: File[]) => {
        setFileName(acceptedFiles[0].name)
        setNotes([])
        onDrop(acceptedFiles)
    }
    const processFile = (file: File): Promise<number> => {
        console.log(file.name)
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result as ArrayBuffer
                const midi = new Midi(binaryStr)
                console.log('@@@@onload')
                processMidi(midi)
                resolve(1)
            }
            reader.readAsArrayBuffer(file)
        })
    }

    const processMidi = (midi: Midi) => {
        console.log('@@@@processMidi')
        console.log(midi.name)
        //const track = midi.tracks[0]
        const ppq = midi.header.ppq //1/4小節あたりのticks

        let foundNotes: SequencerNote[] = []
        midi.tracks.forEach((track) => {
            track.notes.forEach((midiNote: MidiTypes.Note) => {
                const start = quantizeBar(midiNote.bars)
                const end = start + midiNote.durationTicks / (ppq * 4)
                const note: SequencerNote = {
                    style: 'Others',
                    start: start,
                    end: end,
                    octave: midiNote.octave,
                    pitch: Utils.findNote(midiNote.pitch).index!,
                    isRoot: false,
                    name: midiNote.name,
                }
                foundNotes.push(note)
            })
        })
        const analyzed = analyzeNotes(foundNotes, scaleForm)
        const newNotes = [...notes, ...analyzed]
        setNotes(newNotes)
        console.log('addedNotes = ', analyzed.length)
        console.log('newNotes = ', newNotes.length)
        const setting = analyzeSetting(newNotes)
        //console.log({ setting })
        setSetting(setting)
    }

    useEffect(() => {
        const newNotes = analyzeNotes(notes, scaleForm)
        setNotes(newNotes)
    }, [scaleForm])
    useEffect(() => {
        if (midiFile) processFile(midiFile)
    }, [midiFile])
    useEffect(() => {
        console.log(rootIndexes)
        //rootIndexesをnotesに適用
        //midifileが読み込まれるのをどうやって待つか・・・
        //if (midiFile) {
        //while (true) {
        //    console.log('ppp')
        //    if (notes.length > 0) {
        //        const newNotes = [...notes]
        //        rootIndexes.forEach((ind) => {
        //            newNotes[ind].isRoot = true
        //        })
        //        const analyzed = analyzeNotes(newNotes, scaleForm)
        //        setNotes(newNotes)
        //        break
        //    }
        //}
        //}
    }, [rootIndexes])

    const analyzeSetting = (notes: SequencerNote[]): SequencerSetting => {
        let setting: SequencerSetting = initialSetting

        if (notes.length !== 0) {
            let tmp: SequencerSetting = {
                barLength: 100,
                maxOctave: 0,
                minOctave: 100,
            }
            let maxBar = 0
            notes.forEach((note) => {
                maxBar = note.start > maxBar ? note.start : maxBar
                tmp.maxOctave =
                    tmp.maxOctave < note.octave ? note.octave : tmp.maxOctave
                tmp.minOctave =
                    tmp.minOctave > note.octave ? note.octave : tmp.minOctave
            })
            tmp.barLength = Math.floor(maxBar + 1) //maxbarを含むように切り上げ
            let flg = isTopNoteC(notes, tmp.maxOctave)
            //表の一番上をCにしたいので、そのための処理
            //説明が難しい
            if (flg) tmp.maxOctave -= 1
            setting = tmp
        }
        return setting
    }

    const onClick = (index: number) => {
        //console.log('hi: ', index)
        const newNotes = [...notes]
        newNotes[index].isRoot = !newNotes[index].isRoot
        const newNotesAnalyzed = analyzeNotes(newNotes, scaleForm)
        setNotes(newNotesAnalyzed)

        let indexes: number[] = []
        newNotesAnalyzed.forEach((note, index) => {
            if (note.isRoot) indexes.push(index)
        })
        onMidiNoteClick(indexes)
    }
    return (
        <div className="Sequencer-Analyzer">
            <div className="DropZone">
                <Dropzone noClick={true} onDrop={processFiles}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div
                                style={{ border: 'solid' }}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                <div
                                    style={{
                                        width: '90vw',
                                        overflowX: 'auto',
                                        border: 'solid',
                                    }}
                                >
                                    {fileName && <div>{fileName}</div>}
                                    {/*}
                <RootForm
                    form={rootForm}
                    scaleForm={scaleForm}
                    onChange={rootFormOnChange}
                    setting={setting}
                />
                    {*/}
                                    <Sequencer
                                        setting={setting}
                                        notes={notes}
                                        onClick={onClick}
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                </Dropzone>
            </div>
        </div>
    )
}
const analyzeNotes = (notes: SequencerNote[], scaleForm: Types.ScaleForm) => {
    console.log('@@@@@analyzeNotes')
    //console.log(rootForm)
    //console.log(scaleForm)
    const analyzed: SequencerNote[] = []

    //const rootRanges = convertForm(rootForm)
    let rootNotes = notes.filter((note) => note.isRoot === true)
    for (const note of notes) {
        //console.log('@@@')
        note.style = 'Others'
        note.interval = undefined
        let currentRoot = null
        if (rootNotes.length > 0) {
            currentRoot = rootNotes.reduce((prev, current) => {
                const prevDiff = note.start - prev.start
                const currentDiff = note.start - current.start
                //差が正で、かつ小さい方を現在のルートとする
                if (prevDiff < 0) return current
                if (currentDiff < 0) return prev
                return currentDiff < prevDiff ? current : prev
            })
        }

        const [degree, root] = findInterval(note, currentRoot)
        if (degree && root !== null) {
            //console.log({ degree, root })
            //インターバル追加
            note.interval = degree.interval
            //コードトーンかどうか等調べる
            const modeName = Utils.getModeName(
                root,
                scaleForm.root,
                scaleForm.scale
            )
            //console.log('note = ', note)
            //console.log('modeName = ', modeName)
            const mode =
                modeName in Constants.SCALES ? Constants.SCALES[modeName] : null
            if (mode) {
                const notesFromRoot = Utils.shiftArrayIndex(
                    Constants.ALL_NOTES,
                    root
                )
                //console.log({ notesFromRoot })
                const indexInMode = notesFromRoot.findIndex(
                    (elem, index) => elem.index === note.pitch
                )
                //console.log('pitch = ', note.pitch)
                //console.log({ indexInMode })
                if (mode.chordTones.includes(indexInMode))
                    note.style = 'Chord-Tone'
                if (mode.avoids.includes(indexInMode)) note.style = 'Avoid'
                if (mode.naturalTensions.includes(indexInMode))
                    note.style = 'Natural-Tension'
                if (mode.alteredTensions.includes(indexInMode))
                    note.style = 'Altered-Tension'
            }
        }

        analyzed.push(note)
    }
    return analyzed
}

const isTopNoteC = (notes: SequencerNote[], maxOctave: number): boolean => {
    let bool = true
    const topNotes = notes.filter((note) => {
        return note.octave === maxOctave
    })
    topNotes.forEach((note) => {
        //トップノート群の中でCじゃないのがあればfalse
        if (note.pitch !== 0) bool = false
    })
    return bool
}

/**
 * 2次元配列の最初のindexがルートのピッチ、２個目のindexが対象となるノートのピッチ
 * ex)[0][1]はルートCにおけるC#のdegreeを得る(b9th)
 * ex)[2][0]はルートDにおけるCのdegreeを得る(7th).
 */
const intervalsMap: Types.Degree[][] = Constants.ALL_DEGREES.map(
    (elem, index) => {
        const sliceIndex = 12 - index //各ルートにおけるCのdegreeを起点に並び替える
        const left = Constants.ALL_DEGREES.slice(0, sliceIndex)
        const right = Constants.ALL_DEGREES.slice(sliceIndex)

        const intervals = right.concat(left)
        return intervals
    }
)

type RootRange = {
    start: number
    end: number
    root: number
}

/**
 *rootFormの各rootの影響範囲をbar単位で記述。
 *1小節目はC、2~2.5小節はGの場合。
 *[{start:0,end:1,root:0},{start:1,end:1.5,root:7}]
 *
 * @param form
 * @returns
 */
const convertForm = (form: Form): RootRange[] => {
    let rootRanges: RootRange[] = []
    //console.log({ form })
    form.forEach((bar, index1) => {
        bar.forEach((quarter, index2) => {
            if (quarter === null) return
            const start = index1 + index2 / 4
            const end = 100 //この要素のendはこの時点では求まらないので仮置き
            //代わりに前要素のendが確定する
            if (rootRanges.length !== 0)
                rootRanges[rootRanges.length - 1].end = start
            const tmp: RootRange = {
                start: start,
                end: end,
                root: quarter,
            }
            rootRanges.push(tmp)
        })
    })
    //formは1要素1小節なので
    //2要素あった場合、最後のrootの終わりはend=2

    if (rootRanges.length !== 0)
        rootRanges[rootRanges.length - 1].end = form.length
    return rootRanges
}
const findInterval = (
    note: SequencerNote,
    rootNote: SequencerNote | null
): [Types.Degree, number] | [null, null] => {
    let degree: Types.Degree | null = null
    let root: number | null = null
    if (!rootNote) return [null, null]
    if (rootNote.start <= note.start) {
        root = rootNote.pitch
        degree = intervalsMap[rootNote.pitch][note.pitch]
    }
    return [degree!, root!]
}

type Bar = number
const quantizeBar = (bar: Bar) => {
    //console.log(bar)
    const resolution = Constants.Sequencer.pixelResolution * 2
    //小節頭で若干早いノート(barが0.98とか1.99とか)だけは分析しにくくなるので小節頭にクオンタイズさせる
    if (bar > Math.ceil(bar) - 1 / resolution) return Math.ceil(bar)
    return bar

    /*
    const magnified = bar * resolution
    //手前にクオンタイズするか後ろにクオンタイズするか、差分が小さい方に決める
    const nearest =
        magnified - Math.floor(magnified) > Math.ceil(magnified) - magnified
            ? Math.ceil(magnified)
            : Math.floor(magnified)
    return nearest / resolution
    */
}
export default SequenceAnalyzer
