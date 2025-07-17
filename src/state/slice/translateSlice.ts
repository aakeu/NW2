import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TranslateSliceType } from '../types/translate';

const initialState: TranslateSliceType = {
    query: '',
};

const TranslateSlice = createSlice({
    name: 'translate',
    initialState,
    reducers: {
        setTranslateQuery: (state, action: PayloadAction<string>) => {
            state.query = action.payload;
        },
    }
});

export const { setTranslateQuery } = TranslateSlice.actions;
export default TranslateSlice.reducer;