export interface UserData {
  id: string;
  email: string;
}

export interface UserSettings {
  settings: { [leadProp: string]: UserSetting[]; };
}

export interface UserSetting {
  name: string;
}

export interface Area extends UserSetting {

}