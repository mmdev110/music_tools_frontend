import * as Constants from '../Constants'
import { TERMS } from '../Constants'
import * as Types from '../types'

//音楽理論関連のutil

//スケールの構成音を返す
export const generateScaleNotes = (
    root: number,
    scaleType: string
): Types.NOTE[] => {
    //console.log('@@@@generateScaleNotes', scaleType)
    let scale: number[]
    scale = Constants.SCALES[scaleType].notes
    if (!scale) throw new Error(`scale not found for: ${scaleType}`)
    let notes: Types.NOTE[] = []
    const sortedAllNotes = shiftArrayIndex(Constants.ALL_NOTES, root)
    //console.log(sortedAllNotes)
    scale.forEach((elem) => {
        notes.push(sortedAllNotes[elem])
    })
    //console.log(notes)
    return notes
}
//配列をnewIndexを[0]とする配列に並び替える
export const shiftArrayIndex = <T>(array: T[], newIndex: number): T[] => {
    const left = array.slice(0, newIndex)
    const right = array.slice(newIndex)

    return right.concat(left)
}
///スケールのルートからb系調号か#系調号かを返す
//ノート名の表示に使用
export const getSignatureType = (
    root: number,
    scale_type: string
): keyof Types.NOTE => {
    let flatOrSharp: keyof Types.NOTE = 'sharp'
    if (
        scale_type === TERMS.MAJOR &&
        Constants.FLAT_SCALE_ROOTS_MAJOR.includes(root)
    ) {
        flatOrSharp = 'flat'
    } else if (
        [
            TERMS.NATURAL_MINOR,
            TERMS.HARMONIC_MINOR,
            TERMS.MELODIC_MINOR,
        ].includes(scale_type) &&
        Constants.FLAT_SCALE_ROOTS_MINOR.includes(root)
    ) {
        flatOrSharp = 'flat'
    } else if (Constants.FLAT_SCALE_ROOTS_MAJOR.includes(root)) {
        flatOrSharp = 'flat'
    }
    return flatOrSharp
}

//コード文字列("Am7"など)からルート音を返す
export const parseChordInput = (
    chord: string
): [Types.NOTE, string, Types.NOTE | null] => {
    const matchRoot = chord.match(Constants.CHORD_RE.ROOT)
    const matchOnChord = chord.match(Constants.CHORD_RE.ON_CHORD)
    //console.log('@@@@matchOnChord')
    //console.log(matchOnChord)
    if (matchRoot === null) throw new Error('invalid chord root.')
    const rootChar = matchRoot[0]
    const rootNote = findNote(matchRoot[0])
    if (!rootNote) throw new Error('invalid chord root.')
    let chordQuality = chord.slice(rootChar.length)

    let denomNote = null //分母のNote
    //オンコードの場合
    if (matchOnChord) {
        denomNote = findNote(matchOnChord[2])
        chordQuality = chord.slice(rootChar.length, matchOnChord.index)
    }
    return [rootNote, chordQuality, denomNote]
}
//音名からNOTEを返す
export const findNote = (noteName: string): Types.NOTE => {
    let index = Constants.ALL_NOTES.findIndex((note) => {
        return note.flat === noteName || note.sharp === noteName
    })
    if (index === -1) throw new Error(`note not found. noteName = ${noteName}`)
    return Constants.ALL_NOTES[index]
}

//inputからdegreeとkeyChangedを求める
export const calculateChordBox = (
    root: number,
    scale: string,
    chordInput: string,
    transposeRoot: number | null
) => {
    if (!chordInput) return Constants.InitChordBox
    const sortedAllNotes = shiftArrayIndex(Constants.ALL_NOTES, root)

    //入力のパース
    let chordRoot
    let chordQuality
    let denom //onコードの分母
    try {
        ;[chordRoot, chordQuality, denom] = parseChordInput(chordInput)
    } catch (e) {
        //コード分析できない入力の場合
        const chordBox: Types.ChordBox = {
            input: chordInput,
            degree: '',
            keyChanged: '',
        }
        return chordBox
    }
    //ディグリーを調べる
    const degreeIndex = sortedAllNotes.indexOf(chordRoot)
    //console.log('degree = ', Constants.ALL_DEGREES[degreeIndex])
    let degreeDisplay = Constants.ALL_DEGREES[degreeIndex].degree + chordQuality
    if (denom !== null) {
        const denomNum = sortedAllNotes.indexOf(denom)
        degreeDisplay = degreeDisplay.concat(
            '/',
            Constants.ALL_DEGREES[denomNum].degree
        )
    }
    let transposed = ''

    //移調後のコードの表示
    if (transposeRoot !== null) {
        const transposedAllNotes = shiftArrayIndex(
            Constants.ALL_NOTES,
            transposeRoot
        )
        const transposedRoot = transposedAllNotes[degreeIndex]
        const flatOrSharp =
            (getSignatureType(degreeIndex, scale) as 'flat') || 'sharp'
        const noteName = transposedRoot[flatOrSharp]
        transposed = noteName + chordQuality
        if (denom !== null) {
            const denomDegreeIndex = sortedAllNotes.indexOf(denom)
            const transposedDenomNote =
                transposedAllNotes[denomDegreeIndex][flatOrSharp]
            transposed = transposed.concat('/', transposedDenomNote)
        }
    }
    const chordBox: Types.ChordBox = {
        input: chordInput,
        degree: degreeDisplay,
        keyChanged: transposed,
    }
    return chordBox
}

//noteがスケール上で何というモード名か
export const getModeName = (note: number, key: number, scale_name: string) => {
    //console.log('@@@@getModeName')
    let scale

    scale = Constants.SCALES[scale_name]
    if (!scale) throw new Error(`scale not found for: ${scale_name}`)
    let notes = generateScaleNotes(key, scale_name)
    //notes = Util.shiftArrayIndex(notes, note)
    const index = notes.findIndex((elem) => elem.index === note)
    if (index === -1) return ''
    return scale.modeNames![index]
}
