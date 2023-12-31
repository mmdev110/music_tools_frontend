import React, { useEffect, useState } from 'react'
import { INSTRUMENT_CATEGORIES } from 'config/front'
import lo from 'lodash'
import { Button } from 'Components/HTMLElementsWrapper'
import OneTag from 'Components/OneTag2'
type Selector<T> = T & {
    isSelected: boolean
}
interface TagModel {
    id?: number
    name: string
    memo: string
    category: string
    sortOrder: number
}
type Props<T> = {
    onCancelButtonClick: () => void
    onSaveButtonClick: (selected: T[], tagList: T[]) => void
    allTags: T[]
    selectedTags: T[]
}

const InstrumentsView = <T extends TagModel>({
    onSaveButtonClick,
    onCancelButtonClick,
    allTags,
    selectedTags,
}: Props<T>) => {
    //設定されているタグ
    const [selectors, setSelectors] = useState<Selector<T>[]>([])
    const [oldSelectors, setOldSelectors] = useState<Selector<T>[]>([])
    const [editingIndex, setEditingIndex] = useState<number>()
    useEffect(() => {
        const selectors = allTags.map((tag): Selector<T> => {
            const isSelected = !!selectedTags.find((elem) => {
                if (elem.id && tag.id) return elem.id === tag.id
                return elem.name === tag.name
            })
            return { ...tag, isSelected }
        })
        setSelectors(selectors)
        setOldSelectors(structuredClone(selectors))
    }, [])

    //入力フォーム
    const [nameInput, setNameInput] = useState('')
    const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value)
    }
    const [memoInput, setMemoInput] = useState('')
    const handleMemoInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMemoInput(e.target.value)
    }

    const append = (categ: string) => {
        if (nameInput === '') return
        //同じ名前のタグは登録不可
        if (selectors.find((tag) => tag.name === nameInput)) return
        const newSelector = {
            name: nameInput,
            sortOrder: selectors.length + 1,
            memo: memoInput,
            isSelected: true,
            category: categ,
        } as Selector<T>
        setSelectors([...selectors, newSelector])
        setNameInput('')
        setMemoInput('')
    }
    const select = (index: number) => {
        const newSelectors = [...selectors]
        newSelectors[index].isSelected = !newSelectors[index].isSelected
        setSelectors(newSelectors)
    }

    const remove = (index: number) => {
        const newSelectors = [...selectors]
        newSelectors.splice(index, 1)
        setSelectors(newSelectors)
    }

    const isChanged = (): boolean => {
        return !lo.isEqual(oldSelectors, selectors)
    }
    const handleRightClick = (selector: Selector<T>, index: number) => {
        if ((nameInput !== '' || memoInput !== '') && editingIndex === index) {
            //値が入っていてindexが一致するなら、inputの値をselectorに反映させる
            const newSelectors = [...selectors]
            newSelectors[index].name = nameInput
            newSelectors[index].memo = memoInput
            setSelectors(newSelectors)
            setNameInput('')
            setMemoInput('')
            setEditingIndex(undefined)
        } else {
            //空か、editingIndexが違う場合は、selectorの内容をinputに反映させる
            setNameInput(selector.name)
            setMemoInput(selector.memo)
            setEditingIndex(index)
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div>
                <input
                    className="mb-5 border-2 border-black"
                    type="text"
                    placeholder="instrument名"
                    onChange={handleNameInput}
                    value={nameInput}
                />{' '}
                <span className="font-bold text-red-500">
                    {typeof editingIndex !== 'undefined' ? '編集中' : null}
                </span>
            </div>

            <textarea
                className="mb-5 h-20 w-1/2 border-2 border-black"
                placeholder="フレーズの特徴など"
                onChange={handleMemoInput}
                value={memoInput}
            />
            <div className="my-6">
                保存済みのinstrumentを右クリックし、編集してから再度右クリックすることで内容を更新することができます。
            </div>
            <div className="flex w-full justify-around">
                {INSTRUMENT_CATEGORIES.map((categName, index) => {
                    const filtered = selectors.filter((sel) => {
                        return sel.category === categName
                    })
                    return (
                        <div key={index} className="mb-5 flex flex-col gap-y-5">
                            <div>
                                <Button onClick={() => append(categName)}>
                                    +
                                </Button>
                            </div>
                            <div>{categName}</div>
                            {filtered.map((selector, index) => {
                                const totalIndex = selectors.findIndex(
                                    (sel) => sel.name === selector.name
                                ) //selectors全体で見た時のindex
                                const bgColor = selector.isSelected
                                    ? 'bg-sky-500'
                                    : 'bg-sky-300'
                                return (
                                    <div
                                        className="flex justify-between"
                                        key={index}
                                    >
                                        <OneTag
                                            color={bgColor}
                                            onClick={() => {
                                                select(totalIndex)
                                            }}
                                            onRightClick={() =>
                                                handleRightClick(
                                                    selector,
                                                    totalIndex
                                                )
                                            }
                                            name={selector.name}
                                            tooltipText={selector.memo}
                                        />
                                        <Button
                                            bgColor="bg-red-400"
                                            onClick={() => remove(totalIndex)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
            <Button
                disabled={!isChanged()}
                onClick={() => {
                    const selected = selectors.filter((elem) => elem.isSelected)
                    const allT = selectors.map((elem): T => {
                        const { isSelected, ...t } = elem
                        return t as unknown as T
                    })
                    const selectedT = selected.map((elem): T => {
                        const { isSelected, ...t } = elem
                        return t as unknown as T
                    })
                    onSaveButtonClick(selectedT, allT)
                }}
            >
                保存
            </Button>
            <Button onClick={onCancelButtonClick}>cancel</Button>
        </div>
    )
}

export default InstrumentsView
