import { it, describe, expect } from 'vitest'
import * as Utils from '../utils/music'
import { TERMS, ALL_DEGREES, ALL_NOTES } from '../config/music'
import Chord from './Chord'
describe('new()', () => {
    it('debugs newFromChordName()', () => {
        const C = Utils.findNote('C')
        const chord = Chord.newFromChordName('Cm')
        //console.log(chord)
        expect(chord.name).toBe('Cm')
        expect(chord.detail.root).toBe(0)
        expect(chord.detail.third).toBe('m')
    })
    it('should create empty chord', () => {
        const empty = Chord.newFromChordName('')
        expect(empty.degree.root).toBe(-1)
    })
})

describe('analyzeCharacteristics()', () => {
    it('can analyze Am7913 as diatonic and tonic in C major', () => {
        const chordName = 'Am7913'
        const C = Utils.findNote('C')
        const A = Utils.findNote('A')
        const chord = Chord.newFromChordName(chordName)
        chord.analyzeChacteristics([], C.index, TERMS.MAJOR)

        expect(chord.name).toBe(chordName)
        expect(chord.detail.root).toBe(A.index)
        expect(chord.detail.third).toBe('m')
        expect(chord.detail.fifth).toBe('')
        expect(chord.detail.seventh).toBe('7')
        expect(chord.detail.tensions).toStrictEqual(['9', '13'])
        expect(chord.degree.root).toBe(9)
        expect(chord.degree.on).toBe(-1)
        expect(chord.characteristics.itself).toContain(TERMS.Diatonic)
        expect(chord.characteristics.itself).toContain(TERMS.Tonic)
        expect(chord.characteristics.relation).toStrictEqual([])
    })
    it('can analyze Ebm7b5 in F natural minor', () => {
        const chordName = 'Ebm7b5'
        const key = Utils.findNote('F')
        const root = Utils.findNote('Eb')
        const chord = Chord.newFromChordName(chordName)
        chord.analyzeChacteristics([], key.index, TERMS.NATURAL_MINOR)

        expect(chord.name).toBe(chordName)
        expect(chord.detail.root).toBe(root.index)
        expect(chord.detail.third).toBe('m')
        expect(chord.detail.fifth).toBe('b5')
        expect(chord.detail.seventh).toBe('7')
        expect(chord.detail.tensions).toStrictEqual([])
        expect(chord.degree.root).toBe(10)
        expect(chord.degree.on).toBe(-1)
        expect(chord.characteristics.itself).toStrictEqual([
            TERMS.SubDominantMinor,
        ])
        expect(chord.characteristics.relation).toStrictEqual([])
    })
    it('should analyze Dm/G notes', () => {
        const chordName = 'Dm/G'
        const key = Utils.findNote('C').index
        const root = Utils.findNote('D').index
        const on = Utils.findNote('G').index
        const chord = Chord.newFromChordName(chordName)
        chord.analyzeChacteristics([], key, TERMS.MAJOR)

        expect(chord.name).toBe(chordName)
        expect(chord.detail.root).toBe(root)
        expect(chord.detail.third).toBe('m')
        expect(chord.detail.fifth).toBe('')
        expect(chord.detail.seventh).toBe('')
        expect(chord.detail.tensions).toStrictEqual([])
        expect(chord.degree.root).toBe(2)
        expect(chord.degree.on).toBe(7)
        //expect(chord.characteristics.itself).toStrictEqual([])
        //expect(chord.characteristics.relation).toStrictEqual([])
        expect(chord.notes).toStrictEqual([2, 5, 7, 9])
    })
    it('should analyze C/D as SubstituteSus4', () => {
        const chordName = 'C/D'
        const key = Utils.findNote('C').index
        const chord = Chord.newFromChordName(chordName)
        chord.analyzeChacteristics([], key, TERMS.MAJOR)

        expect(chord.characteristics.itself).toContain(TERMS.SubstituteSus4)
        expect(chord.notes).toStrictEqual([0, 2, 4, 7])
    })
    describe('getTransposedRoot()', () => {
        it('should transposed Am7 in CMajor to Bm7 in DMajor', () => {
            const Am7 = Chord.newFromChordName('Am7')
            const transposed = Am7.getTransposedRoot(0, 2, TERMS.MAJOR)
            expect(transposed[0]).toBe('B')
        })
    })
    describe('getNoteIntervals()', () => {
        it('Dm7/G, D F A C / G', () => {
            const chord = Chord.newFromChordName('Dm7/G')
            const got = chord.getNoteIntervals()
            const want = [
                {
                    noteName: ALL_NOTES[2].flat, //D
                    interval: ALL_DEGREES[7].interval, ///5th
                },
                {
                    noteName: ALL_NOTES[5].flat, //F
                    interval: ALL_DEGREES[10].interval, ///7th
                },
                {
                    noteName: ALL_NOTES[9].flat, //A
                    interval: ALL_DEGREES[2].interval, ///9th
                },
                {
                    noteName: ALL_NOTES[0].flat, //C
                    interval: ALL_DEGREES[5].interval, ///11th
                },
                {
                    noteName: ALL_NOTES[7].flat, //G
                    interval: ALL_DEGREES[0].interval, ///root
                },
            ]
            expect(got).toContainEqual(want[0])
            expect(got).toContainEqual(want[1])
            expect(got).toContainEqual(want[2])
            expect(got).toContainEqual(want[3])
            expect(got).toContainEqual(want[4])
        })
    })
})
