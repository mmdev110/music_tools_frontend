import { UserSongInstrument } from 'types'
import OneTag from 'Components/OneTag2'

type Props = {
    instrumentsList: UserSongInstrument[]
    selectedInstruments: UserSongInstrument[]
    onListUpdate: (newList: UserSongInstrument[]) => void
    onSelectedUpdate: (newList: UserSongInstrument[]) => void
    previousInstruments?: UserSongInstrument[]
    categories: string[]
}
const InstrumentsList = ({
    instrumentsList,
    selectedInstruments,
    onListUpdate,
    onSelectedUpdate,
    previousInstruments,
    categories,
}: Props) => {
    const isInList = (
        inst: UserSongInstrument,
        targetList: UserSongInstrument[]
    ): boolean => {
        return !!targetList.find((elem) => {
            if (elem.id && inst.id) return elem.id === inst.id
            return elem.name === inst.name
        })
    }
    const getColor = (inst: UserSongInstrument): string => {
        //instrumentの使用状況に応じてボタン色を変える
        const colors = {
            used: 'bg-sky-500',
            addedRecently: 'bg-red-500',
            removedRecently: 'bg-red-200',
            unused: 'bg-sky-200',
        }
        if (isInList(inst, selectedInstruments)) {
            //selected = usedまたはaddedRecently
            if (previousInstruments && !isInList(inst, previousInstruments)) {
                return colors.addedRecently
            } else {
                return colors.used
            }
        } else {
            if (previousInstruments && isInList(inst, previousInstruments)) {
                return colors.removedRecently
            } else {
                return colors.unused
            }
        }
        return ''
    }
    return (
        <div className="flex w-full justify-around">
            {categories.map((categName, index) => {
                const filtered = instrumentsList.filter(
                    (inst) => inst.category === categName
                )
                return (
                    <div key={index}>
                        <div>{categName}</div>
                        {filtered.map((inst, index2) => (
                            <div key={index2}>
                                <OneTag
                                    name={inst.name}
                                    color={getColor(inst)}
                                    tooltipText={inst.memo}
                                />
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
    /*
                                {categories.map(categName=>{
                
                return
                <div>aa</div>
                                        {instrumentsList.map((inst, index) => 
                        <div key={index}>
                            <Button bgColor={getColor(inst)}>{inst.name}</Button>
                        </div>
                    )}
                    */
}

export default InstrumentsList
