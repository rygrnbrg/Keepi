import { UserData } from '../user'
import { Action } from '@ngrx/store'
import * as UserActions from './user.actions'

export interface State {
    Data: UserData
}

const initialState: State = {
    Data: null
}

export function userReducer(state: State = initialState, action: UserActions.UserActions): State {
    switch (action.type) {
        case UserActions.UPDATE_USER_DATA:
            return {
                ...state,
                Data: action.payload
            }
    }
}

