import * as AuthActions  from './auth.actions';
import { UserData } from 'src/providers/user/models';

export interface AuthState {
    Data: UserData
}

const initialState: AuthState = {
    Data: null,
}


export function authReducer(state: AuthState = initialState, action: AuthActions.AuthActions): AuthState {
switch (action.type) {
    case AuthActions.AUTH_STATE_CHANGED:
        return {
            ...state,
            Data: action.payload
        }
        break;
    default:
        return state;
}
}

