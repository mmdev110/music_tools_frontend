import Note from './Note'
import * as Constants from '../config/music'
import {
    TERMS,
    CHORD_RE,
    SCALES,
    ALL_DEGREES,
    ALL_NOTES,
} from '../config/music'
import { findNote, shiftArrayIndex, getSignatureType } from '../utils/music'
import lo from 'lodash'
import { NOTE } from '../types/music'

//type Third = '' | 'm' | 'sus4' | 'sus2' | 'aug' | 'dim'
type Third = string
type Fifth = string
//type Seventh = '' | 'M7' | '7' | '6'
type Seventh = string
//type Tension = '9' | 'b9' | '11' | '#11' | '13' | 'b13'
type Tension = string
type ChordDetail = {
    root: number
    on: number
    quality: string
    third: Third
    fifth: Fifth
    seventh: Seventh
    tensions: Tension[]
}
export type NoteIntervals = { noteName: string; interval: string }[]
//Init値はlodashでコピーして使う
//NG: const tmp = detailInit
//スプレッド演算子もダメ(要素が配列またはオブジェクトだった場合はそこが参照渡しになってしまう)
//NG: const tmp = {...detailInit}
//ライブラリに頼る
//OK: const tmp = lo.cloneDeep(detailInit)
const detailInit: ChordDetail = {
    root: -1,
    on: -1,
    quality: '',
    third: '',
    fifth: '',
    seventh: '',
    tensions: [],
}
type Degree = {
    root: number
    on: number
}
const degreeInit: Degree = {
    root: -1,
    on: -1,
}
type Characteristics = {
    itself: string[] //コード自体の機能
    relation: string[] //次のコードとの関係性
}
const CharacteristicsInit: Characteristics = {
    itself: [],
    relation: [],
}
export default class Chord {
    constructor(
        private _name: string,
        private _detail: ChordDetail,
        private _degree: Degree,
        private _characteristics: Characteristics,
        private _notes: number[]
    ) {}

    static newFromChordName(chordName: string) {
        const chord = new Chord(
            chordName,
            lo.cloneDeep(detailInit),
            lo.cloneDeep(degreeInit),
            lo.cloneDeep(CharacteristicsInit),
            []
        )
        if (chordName !== '') {
            chord.analyzeDetail()
            chord._analyzeNotes()
        }
        return chord
    }
    getTransposedRoot = (
        fromKey: number,
        toKey: number,
        scale: string
    ): [string, string] => {
        ////console.log('@@@@getTransposedRoot')
        if (this._name === '') return ['', '']
        this._calcDegree(fromKey)
        const { root, on } = this._degree
        const sortedNotes = shiftArrayIndex(Constants.ALL_NOTES, toKey)
        const flatOrSharp = getSignatureType(toKey, scale)
        const newRoot = sortedNotes[root][flatOrSharp] as string
        let newOn = ''
        if (on !== -1) newOn = sortedNotes[on][flatOrSharp] as string
        return [newRoot, newOn]
    }
    analyzeDetail = () => {
        if (this._name === '') return
        ////console.log(`analyzeChordDetail for ${this._name}`)
        //正規表現を駆使してコード表記から各値を切り出す
        const matchRoot = this._name.match(CHORD_RE.ROOT)
        const matchOnChord = this._name.match(CHORD_RE.ON_CHORD)
        if (matchRoot === null)
            throw new Error(`invalid chord root. name = ${this._name}`)
        const rootChar = matchRoot[0]
        const rootNote = findNote(rootChar)
        if (!rootNote) throw new Error(`invalid chord root: ${this._name}`)

        let chordQuality: string
        if (matchOnChord) {
            const onNote = findNote(matchOnChord[2])
            if (!onNote) throw new Error(`invalid on root: ${this._name}`)
            this._detail.on = onNote!.index
            chordQuality = this._name.slice(rootChar.length, matchOnChord.index)
        } else {
            chordQuality = this._name.slice(rootChar.length)
        }
        this._detail.quality = chordQuality

        const matchThird = chordQuality.match(CHORD_RE.THIRD)
        if (matchThird) this._detail.third = matchThird[0]
        const matchFifth = chordQuality.match(CHORD_RE.FIFTH)
        if (matchFifth) this._detail.fifth = matchFifth[0]
        const matchSeventh = chordQuality.match(CHORD_RE.SEVENTH)
        if (matchSeventh) this._detail.seventh = matchSeventh[0]

        const matchTension = chordQuality.match(CHORD_RE.TENSIONS)
        //console.log({ matchTension })
        if (matchTension) this._detail.tensions = matchTension
        //テンションがadd系じゃない かつ seventhが無ければseventhを追加してあげる
        //C9, C13に対して7追加
        //Cadd9, Cadd13の場合は7追加しない
        const matchAdd = chordQuality.match(CHORD_RE.ADD)
        if (!matchAdd && !matchSeventh) this._detail.seventh = '7'

        this._detail.root = rootNote.index
    }
    private _analyzeNotes() {
        if (this._degree === degreeInit) return
        if (this._detail === detailInit) return
        //Cで考えてからthis._detail.rootにtransposeする
        const { root, on, third, fifth, seventh, tensions } = this._detail
        let C = [0]
        let interval = ['root']
        switch (third) {
            case 'sus2':
                C.push(2)
                break
            case 'm':
                C.push(3)
                break
            case '':
                C.push(4)
                break
            case 'sus4':
                C.push(6)
                break

            default:
                break
        }
        switch (fifth) {
            case '':
                C.push(7)
                break
            case 'b5':
                C.push(6)
                break
            case '#5':
                C.push(8)
                break
            case 'aug':
                C.push(8)
                break
            default:
                break
        }
        switch (seventh) {
            case '6':
                C.push(9)
                break
            case '7':
                C.push(10)
                break
            case 'M7':
                C.push(11)
                break
            default:
                break
        }
        //特殊コードの処理
        if (third === 'dim') C = [0, 3, 6, 9]
        //テンション
        tensions.forEach((tension) => {
            switch (tension) {
                case 'b9':
                    C.push(1)
                    break
                case '9':
                    C.push(2)
                    break
                case '11':
                    C.push(5)
                    break
                case '#11':
                    C.push(6)
                    break
                case 'b13':
                    C.push(8)
                    break
                case '13':
                    C.push(9)
                    break
                default:
                    break
            }
        })
        //C基準から元のルートにトランスポーズ
        const transposed = C.map((note) => {
            return transposeNote(note, root)
        })
        if (on !== -1) transposed.push(on)
        //昇順ソート
        this._notes = lo.uniq(transposed).sort((a, b) => a - b)
    }
    getNoteIntervals(): NoteIntervals {
        const root =
            this._detail.on === -1 ? this._detail.root : this._detail.on
        const notes = this._notes
        //sortはview側でやることにした
        //const rootIndex = notes.findIndex((note) => note === root)
        //const left = notes.slice(0, rootIndex)
        //const right = notes.slice(rootIndex)
        const sorted = notes

        //console.log('sorted', sorted)
        const notesInC = sorted.map((note) => transposeNote(note, -root))
        //console.log(notesInC)
        const intervals = notesInC.map((note, index) => {
            const noteName = ALL_NOTES[sorted[index]].flat
            const interval = ALL_DEGREES[note].interval
            return { noteName: noteName, interval: interval }
        })

        return intervals
    }
    _calcDegree(key: number) {
        const calcNoteDegree = (note: number, key_: number): number => {
            const sortedAllNotesByKey = shiftArrayIndex(
                Constants.ALL_NOTES,
                key_
            )
            const indexInKey = sortedAllNotesByKey.findIndex(
                (elem) => elem.index === note
            )
            const degree = Constants.ALL_DEGREES[indexInKey]
            return degree.index
        }

        this._degree.root = calcNoteDegree(this._detail.root, key)
        if (this._detail.on > -1)
            this._degree.on = calcNoteDegree(this._detail.on, key)
    }
    analyzeChacteristics(nextChords: Chord[], key: number, scale: string) {
        if (this._name === '') return
        //degreeを計算する
        if (this._degree.on === -1 && this._degree.root === -1)
            this._calcDegree(key)
        for (const next of nextChords) {
            if (next._name === '') continue
            if (next._degree.on === -1 && next._degree.root === -1)
                next._calcDegree(key)
        }
        //console.log(`analyzeCharacteristic for: ${this._name}`)

        //色々計算して、itselfとrelationにpushしていく
        let itself: string[] = []
        let relation: string[] = []
        ////console.log(this._degree)
        ////console.log(this._detail)

        //ダイアトニック
        const [isDiatonic, role] = this._isDiatonic(key, scale)
        if (isDiatonic) {
            itself.push(TERMS.Diatonic)
            itself.push(role)
        }
        const [isHarmonicMinor] = this._isDiatonic(key, TERMS.HARMONIC_MINOR)
        if (
            //ハーモニックマイナー以外のスケールで非ダイアトニックコードがハーモニックマイナーのコードだったとき
            scale !== TERMS.HARMONIC_MINOR &&
            !isDiatonic &&
            isHarmonicMinor
        ) {
            itself.push(TERMS.HARMONIC_MINOR)
        }
        const [isMelodicMinor] = this._isDiatonic(key, TERMS.MELODIC_MINOR)
        if (scale !== TERMS.MELODIC_MINOR && !isDiatonic && isMelodicMinor) {
            itself.push(TERMS.MELODIC_MINOR)
        }
        //if (this._isDominant()) itself.push(TERMS.Dominant)
        if (this._isSubDominantMinor(key)) itself.push(TERMS.SubDominantMinor)
        if (this._isInversion()) itself.push(TERMS.OnChordInversion)
        if (this._isOnChordOther()) itself.push(TERMS.OnChordOther)
        if (this._isSubstituteDominant()) {
            itself.push(TERMS.SubstituteDominant)
            const ind = itself.findIndex(
                (role) => role === TERMS.SubDominant || role === TERMS.Tonic
            )
            if (ind !== -1) {
                itself[ind] = TERMS.Dominant
            } else {
                itself.push(TERMS.Dominant)
            }
        }
        if (this._isSubstituteSus4()) itself.push(TERMS.SubstituteSus4)
        this._otherSpecialChord()
        //relation周り
        if (nextChords.length > 0) {
            //強進行(4度上)
            if (this._isPFourthMove(nextChords[0]))
                relation.push(TERMS.PFourthMove)
            //ツーファイブ
            if (this._isTwoFive(nextChords[0])) relation.push(TERMS.TwoFive)
            //セカンダリードミナント
            if (this._isSecondaryDominant(nextChords[0]))
                relation.push(TERMS.SecondaryDominant)
            //ドミナントモーション
            if (this._isDominantMotion(nextChords[0]))
                relation.push(TERMS.DominantMotion)
            //裏コード
            if (this._isUraChord(nextChords[0])) relation.push(TERMS.UraChord)
            //パッシングディミニッシュ
            if (this._isPassingDiminish(nextChords[0]))
                relation.push(TERMS.PassingDiminish)
            this._otherSpecialRelations()
        }

        //console.log('itself = ', itself)
        //console.log('relation = ', relation)
        itself = lo.uniq(itself)
        relation = lo.uniq(relation)
        this._characteristics = { itself, relation }
    }
    private _isDiatonic(key: number, scale: string): [boolean, string] {
        //console.log(`@@@@_isDiatonic:`)
        const { root, on } = this._degree
        const { quality, third, seventh, fifth, tensions } = this._detail
        let scaleConf = SCALES[scale].diatonics!
        if (!scaleConf) throw new Error(`conf not found for: ${scale}`)
        const info = scaleConf.find((info) => {
            return (
                info.root === root &&
                info.third === third &&
                info.fifth === fifth &&
                (seventh ? info.seventh === seventh : true)
            )
        })
        if (info) return [true, info.role]
        //ダイアトニックコードじゃない場合
        return [false, '']
    }
    //完全四度上への進行
    //G->C, C->Fなど
    private _isPFourthMove(next: Chord): boolean {
        //console.log('@@@isPFourthMove')
        const root = this._getBottomNote().degree
        const nextRoot = next._getBottomNote().degree
        const diff = intervalUp(root, nextRoot)
        return diff === 5 //四度上(または五度下)
    }
    private _isDominant() {
        return this._isDominantTriad() || this._isDominantTetrad()
    }
    //3和音ドミナント
    private _isDominantTriad() {
        const { root, on } = this._degree
        const { quality, third, seventh, fifth, tensions } = this._detail
        //トライアド
        return this._isTriad() && root === 7 && third === ''
    }
    //4和音ドミナント
    private _isDominantTetrad() {
        const { root, on } = this._degree
        const { quality, third, seventh, fifth, tensions } = this._detail
        return this._isTetrad() && third === '' && seventh == '7'
    }
    //3和音
    private _isTriad() {
        return this._detail.seventh === ''
    }
    //4和音
    private _isTetrad() {
        return this._detail.seventh !== ''
    }
    //ドミナントの代理コード
    private _isSubstituteDominant(): boolean {
        const { root, on } = this._degree
        const { quality, third, seventh, fifth, tensions } = this._detail
        //G/F
        if (this._isTriad() && root === 7 && on === 5) return true
        if (this._isTriad() && root === 10 && on === 8) return true
        //F/G
        if (this._isTriad() && root === 5 && on === 7) return true
        if (this._isTriad() && root === 8 && on === 10) return true
        //Dm7/G
        if (
            this._isTetrad() &&
            third === 'm' &&
            seventh === '7' &&
            root === 2 &&
            on === 7
        )
            return true
        if (
            this._isTetrad() &&
            third === 'm' &&
            seventh === '7' &&
            root === 5 &&
            on === 10
        )
            return true

        return false
    }
    private _notesIncludes(root: number, semitonesFromRoot: number) {
        ////console.log(
        //    `@@@@notesIncludes: root ${root}, semi:${semitonesFromRoot}`
        //)
        const target = transposeNote(root, semitonesFromRoot)
        return this._notes.includes(target)
    }
    private _isSubstituteSus4() {
        if (this._degree.on === -1) return false
        const root = this._getBottomNote().root
        //分数コードが分母に対してsus4音を持っていればsus4系代理コード
        return this._notesIncludes(root, 5)
    }
    private _isSubstituteSus2() {
        if (this._degree.on === -1) return false
        const root =
            this._degree.on !== -1 ? this._degree.on : this._degree.root
        //分数コードが分母に対してsus4音を持っていればsus4系代理コード
        return this._notesIncludes(root, 2)
    }
    private _isSubDominantMinor(key: number) {
        //const notesInC = this._notes.map((note) => transposeNote(note, -key))
        //キーから半音8個上の音を持っていればサブドミナントマイナー
        return this._notesIncludes(key, 8)
    }
    private _isTwoFive(next: Chord) {
        //マイナーコードから完全四度上のドミナントに行く
        //Dm->G
        return (
            this._isMinor() && this._isPFourthMove(next) && next._isDominant()
        )
    }
    private _isMinor(): boolean {
        const { third } = this._detail
        return third === 'm'
    }
    //セカンダリードミナント
    //A7->E7, A7->Em7など
    private _isSecondaryDominant(next: Chord): boolean {
        //console.log('@@@@isSecondaryDominant')
        return (
            this._isDominantTetrad() &&
            this._isPFourthMove(next) &&
            next._degree.root !== 0
        )
    }
    //ドミナントモーション
    //C majorでのG7->C, G->Cなど
    private _isDominantMotion(next: Chord): boolean {
        ////console.log('@@@@isDominantMotion')
        return (
            this._isDominant() &&
            this._isPFourthMove(next) &&
            next._degree.root === 0
        )
    }
    //裏コード
    //Db7->Cなど
    private _isUraChord(next: Chord): boolean {
        const { root } = this._degree
        const nextRoot = next.degree.root
        return this._isDominantTetrad() && root - nextRoot === 1
    }
    //パッシングディミニッシュ
    //Dbdim->Cなど
    private _isPassingDiminish(next: Chord): boolean {
        const { root } = this._degree
        const nextRoot = next.degree.root
        return this._isDiminish() && Math.abs(root - nextRoot) === 1
    }
    private _isDiminish() {
        const { quality, third, seventh, fifth, tensions } = this._detail
        return third === 'dim'
    }
    //オンコードが転回形かどうか
    private _isInversion() {
        const { root, on } = this._degree
        if (on === -1) return false
        if (on === root) return false
        const { quality, third, seventh, fifth, tensions } = this._detail
        const interval = intervalUp(root, on)
        switch (interval) {
            case 2:
                return third === 'sus2'
            case 3:
                return third === 'm'
            case 4:
                return third === ''
            case 5:
                return third === 'sus4'
            case 6:
                return fifth === 'b5'
            case 7:
                return fifth === ''
            case 8:
                return fifth === 'aug'
            case 9:
                return seventh === '6'
            case 10:
                return seventh === '7'
            case 11:
                return seventh === 'M7'
        }
        return false
    }
    //オンコードのルートが構成音外かどうか
    private _isOnChordOther() {
        const { root, on } = this._degree
        if (on === root) return false
        const { quality, third, seventh, fifth, tensions } = this._detail
        return on !== -1 && !this._isInversion()
    }
    private _otherSpecialChord() {}
    private _otherSpecialRelations() {}
    private _getBottomNote(): { degree: number; root: number } {
        if (this._degree.on === -1)
            return { degree: this._degree.root, root: this._detail.root }
        return { degree: this._degree.on, root: this._detail.on }
    }
    getDegreeName(): string {
        if (this._name === '') return ''
        let degreeName =
            ALL_DEGREES[this._degree.root].degree + this._detail.quality
        if (this._degree.on !== -1)
            degreeName = degreeName + '/' + ALL_DEGREES[this._degree.on].degree
        return degreeName
    }

    //getter, setter
    get name() {
        return this._name
    }
    get detail() {
        return this._detail
    }
    get degree() {
        return this._degree
    }
    get characteristics() {
        return this._characteristics
    }
    get notes() {
        return this._notes
    }
    set characteristics(chara: Characteristics) {
        this._characteristics = chara
    }
}

//toがfromに対して何半音上か
//DからBは-3ではなく+9
const intervalUp = (from: number, to: number): number => {
    let diff = to - from
    return diff > 0 ? diff : diff + 12
}
//semitones分の半音だけ上げる
//note=2, semitones=2なら
//D(=2)の2半音上なのでEを返す
const transposeNote = (note: number, semitones: number): number => {
    const sum = note + semitones
    if (sum > 11) return sum - 12
    if (sum < 0) return sum + 12
    return sum
}
