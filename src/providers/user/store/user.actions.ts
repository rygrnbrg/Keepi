import { Action } from '@ngrx/store';
import { UserData, UserSettings } from 'src/providers/user/models';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';
export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';
export const UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS';
export const USER_DEFAULT_SERVER_SETTINGS_READY = 'USER_DEFAULT_SERVER_SETTINGS_READY';



export class Login implements Action {
    readonly type = USER_LOGIN;

    constructor(public payload: firebase.User) { }
}

export class Logout implements Action {
    readonly type = USER_LOGOUT;

    constructor() { }
}

export class UpdateUserData implements Action {
    readonly type = UPDATE_USER_DATA;

    constructor(public payload: UserData) { }
}
export class UpdateUserSettings implements Action {
    readonly type = UPDATE_USER_SETTINGS;

    constructor(public payload: UserSettings) { }
}

export class UserDefaultServerSettingsReady implements Action {
    readonly type = USER_DEFAULT_SERVER_SETTINGS_READY;

    constructor() { }
}

export type UserActions = UpdateUserData | UpdateUserSettings | UserDefaultServerSettingsReady | Login | Logout
