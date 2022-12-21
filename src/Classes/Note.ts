import { findNote, shiftArrayIndex } from '../utils/music'
import { ALL_NOTES, ALL_DEGREES } from '../Constants'
import { NOTE } from '../types'

export default class Note {
    name: string
    pitch: number
    octave: number
    degree: number
    constructor(note: NOTE, octave: number) {
        this.name = note.flat
        this.pitch = note.index
        this.octave = octave
        this.degree = -1
    }
    static new(pitch: string | number, octave?: number): Note {
        let note: NOTE
        let oct = octave || 2
        if (typeof pitch === 'string') {
            note = findNote(pitch)
        } else {
            note = ALL_NOTES[pitch]
        }
        return new Note(note, oct)
    }
    calcDegree(root: number) {
        const _calcNoteDegree = (note: number, key_: number): number => {
            const sortedAllNotesByKey = shiftArrayIndex(ALL_NOTES, key_)
            const indexInKey = sortedAllNotesByKey.findIndex(
                (elem) => elem.index === note
            )
            const degree = ALL_DEGREES[indexInKey]
            return degree.index
        }
        this.degree = _calcNoteDegree(this.pitch, root)
    }
}
