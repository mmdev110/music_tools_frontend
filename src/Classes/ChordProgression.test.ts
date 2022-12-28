import { it, describe, expect } from 'vitest'
import ChordProgression from './ChordProgression'
import * as Constants from '../config/music'
import { TERMS } from '../config/music'
import * as Utils from '../utils/music'

describe('newFromChordNames()', () => {
    it('should analyze 1625 in D Major properly', () => {
        const names = [
            'DM7', //1
            '',
            '',
            '',
            'Bm79', //6
            '',
            '',
            '',
            'Em7', //2
            '',
            '',
            '',
            'A7', //2/5
        ]
        const key = Utils.findNote('D').index
        const scale = TERMS.MAJOR
        const progression = ChordProgression.newFromChordNames(
            names,
            key,
            scale
        )
        //DM7
        expect(progression.chords[0].detail.root).toBe(2)
        expect(progression.chords[0].degree.root).toBe(0)
        expect(progression.chords[0].degree.on).toBe(-1)
        expect(progression.chords[0].characteristics.itself).toContain(
            TERMS.Diatonic
        )
        expect(progression.chords[0].characteristics.itself).toContain(
            TERMS.Tonic
        )
        //Bm79
        expect(progression.chords[4].detail.root).toBe(11)
        expect(progression.chords[4].degree.root).toBe(9)
        expect(progression.chords[4].degree.on).toBe(-1)
        expect(progression.chords[4].characteristics.itself).toContain(
            TERMS.Diatonic
        )
        expect(progression.chords[4].characteristics.itself).toContain(
            TERMS.Tonic
        )
        expect(progression.chords[4].characteristics.relation).toContain(
            TERMS.PFourthMove
        )

        expect(progression.chords[12].detail.root).toBe(9)
        expect(progression.chords[12].degree.root).toBe(7)
        expect(progression.chords[12].degree.on).toBe(-1)
        expect(progression.chords[12].characteristics.itself).toContain(
            TERMS.Diatonic
        )
        expect(progression.chords[12].characteristics.itself).toContain(
            TERMS.Dominant
        )
        expect(progression.chords[12].characteristics.relation).toContain(
            TERMS.PFourthMove
        )
        expect(progression.chords[12].characteristics.relation).toContain(
            TERMS.DominantMotion
        )
    })
    it('should detect perfect 4th movement in Am7->D7', () => {
        const chordNames = ['Am7', 'D7']
        const key = Utils.findNote('G')
        const scale = TERMS.NATURAL_MINOR
        const prog = ChordProgression.newFromChordNames(
            chordNames,
            key.index,
            scale
        )
        expect(prog.chords[0].characteristics.relation).toContain(
            TERMS.PFourthMove
        )
    })
    it('should NOT detect perfect 4th movement in Dm7->A7', () => {
        const chordNames = ['D7', 'Am7']
        const key = Utils.findNote('G')
        const scale = TERMS.NATURAL_MINOR
        const prog = ChordProgression.newFromChordNames(
            chordNames,
            key.index,
            scale
        )
        const result = prog.chords[0].characteristics.relation.includes(
            TERMS.PFourthMove
        )
        expect(result).toBeFalsy()
    })
    it('should detect secondary dominant in A7->D7', () => {
        const chordNames = ['A7', 'D7']
        const key = Utils.findNote('C')
        const scale = TERMS.NATURAL_MINOR
        const prog = ChordProgression.newFromChordNames(
            chordNames,
            key.index,
            scale
        )
        expect(prog.chords[0].characteristics.relation).toContain(
            TERMS.SecondaryDominant
        )
    })
    it('should detect diatonic chords in Ab Harmonic Minor', () => {
        const chordNames = [
            'AbmM7',
            'Bbm7b5',
            'BM7#5',
            'Dbm7',
            'Eb7',
            'EM7',
            'Gdim',
        ]
        const key = Utils.findNote('Ab')
        const scale = TERMS.HARMONIC_MINOR
        const prog = ChordProgression.newFromChordNames(
            chordNames,
            key.index,
            scale
        )
        expect(prog.chords[0].degree.root).toBe(0)
        expect(prog.chords[0].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[1].degree.root).toBe(2)
        expect(prog.chords[1].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[2].degree.root).toBe(3)
        expect(prog.chords[2].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[3].degree.root).toBe(5)
        expect(prog.chords[3].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[4].degree.root).toBe(7)
        expect(prog.chords[4].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[5].degree.root).toBe(8)
        expect(prog.chords[5].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[6].degree.root).toBe(11)
        expect(prog.chords[6].characteristics.itself).toContain(TERMS.Diatonic)
    })
    it('should detect diatonic chords in Gb Melodic Minor', () => {
        const chordNames = [
            'F#mM7',
            'G#m7',
            'AM7#5',
            'B7',
            'C#7',
            'D#m7b5',
            'Fm7b5',
        ]
        const key = Utils.findNote('Gb').index
        const scale = TERMS.MELODIC_MINOR
        const prog = ChordProgression.newFromChordNames(chordNames, key, scale)
        expect(prog.chords[0].degree.root).toBe(0)
        expect(prog.chords[0].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[1].degree.root).toBe(2)
        expect(prog.chords[1].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[2].degree.root).toBe(3)
        expect(prog.chords[2].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[3].degree.root).toBe(5)
        expect(prog.chords[3].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[4].degree.root).toBe(7)
        expect(prog.chords[4].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[5].degree.root).toBe(9)
        expect(prog.chords[5].characteristics.itself).toContain(TERMS.Diatonic)
        expect(prog.chords[6].degree.root).toBe(11)
        expect(prog.chords[6].characteristics.itself).toContain(TERMS.Diatonic)
    })
})
it('should detect Melodic Minor Chords in Gb Major', () => {
    const chordNames = [
        'F#mM7',
        'G#m7',
        'AM7#5',
        'B7',
        'C#7',
        'D#m7b5',
        'Fm7b5',
    ]
    const key = Utils.findNote('Gb').index
    const scale = TERMS.MAJOR
    const prog = ChordProgression.newFromChordNames(chordNames, key, scale)
    expect(prog.chords[0].characteristics.itself).toContain(TERMS.MELODIC_MINOR)
    expect(prog.chords[2].characteristics.itself).toContain(TERMS.MELODIC_MINOR)
    expect(prog.chords[3].characteristics.itself).toContain(TERMS.MELODIC_MINOR)
    expect(prog.chords[5].characteristics.itself).toContain(TERMS.MELODIC_MINOR)
})

describe('findMidi()', () => {
    it('debugs findMidi()', () => {
        const directory = '/Users/user/Desktop/tmp'
        //always pass
        expect(1).toBe(1)
    })
})
