import { configureStore } from "@reduxjs/toolkit";
import browserReducer from './slice/browserSlice.js'

const store = configureStore({
    reducer: {
        browser: browserReducer
    }
})

export default store