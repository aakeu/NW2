import {  createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GPTHistoryType, GPTResponse, GPTSliceType } from '../../types/gpt'
import { fetchHistory, getLatestGptResult } from './gptApi'


const initialState: GPTSliceType = {
  history: { today: [], p7days: [], pmonth: [], old: [] },
  activeChat: { id: -1, title: '' },
  section: 'MainChat',
  ranQuery: 0,
  loading:true,
  error:false,
  chatLoading:true,
  chatError:false
}

const GPTSlice = createSlice({
  name: 'gpt',
  initialState,
  reducers: {
    setHistoryState: (state, action) => {
      state.history = action.payload
    },
    setActiveChatState: (state, action) => {
      state.activeChat = action.payload
    },
    setRanQueryState: (state, action) => {
      state.ranQuery = action.payload
    },
    setSectionState: (state, action) => {
      state.section = action.payload
    },
    setLatestPending: (state) => {
        state.chatLoading = true;
        state.chatError = false;
    },
    setLatestFulfilled: (state) => {
        state.chatLoading = false;
        state.chatError = false;
    },
    setLatestFailed: (state) => {
          state.chatLoading = false;
        state.chatError = true;
    }
  },   
   extraReducers: (builder) => {
        builder
            .addCase(fetchHistory.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(fetchHistory.fulfilled, (state, action: PayloadAction<GPTHistoryType>) => {
                state.loading = false;
                state.history = action.payload;
                state.error = false;
            })
            .addCase(fetchHistory.rejected, (state) => {
                state.loading = false;
                state.error = true
            })
    },
})

export const { 
  setHistoryState, 
  setActiveChatState, 
  setRanQueryState,
  setSectionState,
  setLatestFailed,
  setLatestFulfilled,
  setLatestPending
} =
  GPTSlice.actions

export default GPTSlice.reducer
