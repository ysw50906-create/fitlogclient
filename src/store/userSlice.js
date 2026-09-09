// userSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { Cookies } from 'react-cookie'
const cookies = new Cookies();

const initialState = {
    num: '',
    id: '',
    pass: '',
    name: '',
    phone: '',
    email: '',
    profileImg: '',
    provider: '',
    role_names: [],
    accessToken: '',
    refreshToken: '',
}

const getLoginUser = () => {
    const memberInfo = cookies.get('user')
    if (memberInfo && memberInfo.num) {
        memberInfo.num = decodeURIComponent(memberInfo.num)
        memberInfo.id = decodeURIComponent(memberInfo.id)
        memberInfo.pass = decodeURIComponent(memberInfo.pass)
        memberInfo.name = decodeURIComponent(memberInfo.name)
        memberInfo.birth = decodeURIComponent(memberInfo.birth)
        memberInfo.phone = decodeURIComponent(memberInfo.phone)
        memberInfo.email = decodeURIComponent(memberInfo.email)
        memberInfo.profileImg = decodeURIComponent(memberInfo.profileImg)
        memberInfo.provider = decodeURIComponent(memberInfo.provider)
        memberInfo.role_names = decodeURIComponent(memberInfo.role_names)
        memberInfo.accessToken = decodeURIComponent(memberInfo.accessToken)
        memberInfo.refreshToken = decodeURIComponent(memberInfo.refreshToken)
    }
    return memberInfo
}

const userSlice = createSlice(
    {
        name: 'user',
        initialState: getLoginUser() || initialState,
        reducers: {
            loginAction: (state, action) => {
                state.num = action.payload.num
                state.id = action.payload.id
                state.pass = action.payload.pass
                state.name = action.payload.name
                state.phone = action.payload.phone
                state.email = action.payload.email
                state.profileImg = action.payload.profileImg
                state.provider = action.payload.provider
                state.role_names = action.payload.role_names
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
            },
            logoutAction: (state) => {
                state.num = ''
                state.id = ''
                state.pass = ''
                state.name = ''
                state.phone = ''
                state.email = ''
                state.profileImg = ''
                state.provider = ''
                state.role_names = []
                state.accessToken = ''
                state.refreshToken = ''
            }
        }
    }
)
export const { loginAction, logoutAction, } = userSlice.actions
export default userSlice.reducer