import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '..'

type CardLIstType = 'isCard' | 'isList'

interface CardListState {
    activeCardList: CardLIstType
}
  
const initialState: CardListState = {
    activeCardList: 'isCard',
}

const saveCardListToStorage = (cardList: CardLIstType) => {
    if (chrome && chrome.storage) {
        chrome.storage.local.set({ activeCardList: cardList }, () => {})
    }
}

const loadCardListFromStorage = (): Promise<CardLIstType> => {
    return new Promise((resolve) => {
        if (chrome && chrome.storage) {
            chrome.storage.local.get(['activeCardList'], (result) => {
                resolve((result.activeCardList as CardLIstType) || 'isCard')
            })
        } else {
            resolve('isCard')
        }
    })
}

const cardListSlice = createSlice({
  name: 'cardList',
  initialState,
  reducers: {
    setActiveCardList: (state, action: PayloadAction<CardLIstType>) => {
      state.activeCardList = action.payload
      saveCardListToStorage(action.payload)
    },
  },
})

export const { setActiveCardList } = cardListSlice.actions

export const initializeCardList = () => async (dispatch: AppDispatch) => {
  const savedSection = await loadCardListFromStorage()
  dispatch(setActiveCardList(savedSection))
}

export default cardListSlice.reducer