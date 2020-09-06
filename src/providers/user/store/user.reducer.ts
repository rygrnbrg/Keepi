import { UserData, UserSettings } from '../models'
import * as UserActions from './user.actions'

export interface UserState {
    Data: UserData,
    Settings: UserSettings,
    ServerSettingsReady: boolean
}

const initialState: UserState = {
    Data: null,
    Settings: null,
    ServerSettingsReady: false
}

export function userReducer(state: UserState = initialState, action: UserActions.UserActions): UserState {
    switch (action.type) {
        case UserActions.USER_LOGOUT:
            return {
                ...initialState
            }
        case UserActions.UPDATE_USER_DATA:
            return {
                ...state,
                Data: action.payload
            }
        case UserActions.UPDATE_USER_SETTINGS:
            return {
                ...state,
                Settings: action.payload
            }
        case UserActions.USER_DEFAULT_SERVER_SETTINGS_READY:
            return {
                ...state,
                ServerSettingsReady: true
            }
    }
}

