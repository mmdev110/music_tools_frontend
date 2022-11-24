import Chord from './Chord'
export default class ChordProgression {
    constructor(
        private _chords: Chord[],
        private _key: number,
        private _scale: string
    ) {}

    static newFromChordNames(chordNames: string[], key: number, scale: string) {
        const chords = chordNames.map((chordName) =>
            Chord.newFromChordName(chordName)
        )
        const prog = new ChordProgression(chords, key, scale)
        prog.analyzeChordProgression()
        return prog
    }
    analyzeChordProgression() {
        const chords = this._chords.filter((chord) => chord.name !== '')
        //for (let i = 0; i < chords.length; i++) {
        //    chords[i].calcDegree(this._key)
        //}
        for (let i = 0; i < chords.length; i++) {
            let nextChords = chords.slice(i + 1)
            //最後のコードだった場合、先頭のコードに進むと仮定して分析する
            if (nextChords.length === 0) nextChords = [chords[0]]
            chords[i].analyzeChacteristics(nextChords, this._key, this._scale)
        }
    }
    //getters
    get chords() {
        return this._chords
    }
    get key() {
        return this._key
    }
    get scale() {
        return this._scale
    }
}
