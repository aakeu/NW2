import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '..'

type LoginType =
  | 'signInModal'
  | 'signUpModal'
  | 'forgotPasswordModal'
  | 'resetPasswordModal'
  | 'changePasswordModal'
  | 'googleAuthentication'
  | ''

interface LoginState {
  activeLoginType: LoginType
}

const initialState: LoginState = {
  activeLoginType: '',
}

const loginTypeSlice = createSlice({
  name: 'loginType',
  initialState,
  reducers: {
    setActiveLoginType: (state, action: PayloadAction<LoginType>) => {
      state.activeLoginType = action.payload
    },
  },
})

export const { setActiveLoginType } = loginTypeSlice.actions

export default loginTypeSlice.reducer
