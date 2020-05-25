import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable()
export class Settings {
  private SETTINGS_KEY: string = '_settings';

  settings: any;

  _defaults: any;
  _readyPromise: Promise<any>;

  constructor(public storage: NativeStorage, defaults: any) {
    this._defaults = defaults;
    this.load();
  }

  load() {
    return this.storage.getItem(this.SETTINGS_KEY).then((value) => {
      if (value) {
        this.settings = value;
        return this._mergeDefaults(this._defaults);
      } else {
        return this.setAll(this._defaults).then((val) => {
          this.settings = val;
        })
      }
    });
  }

  _mergeDefaults(defaults: any) {
    for (let k in defaults) {
      if (!(k in this.settings)) {
        this.settings[k] = defaults[k];
      }
    }
    return this.setAll(this.settings);
  }

  merge(settings: any) {
    for (let k in settings) {
      this.settings[k] = settings[k];
    }
    return this.save();
  }

  setValue(key: string, value: any) {
    this.settings[key] = value;
    return this.storage.setItem(this.SETTINGS_KEY, this.settings);
  }

  setAll(value: any) {
    return this.storage.setItem(this.SETTINGS_KEY, value);
  }

  getValue(key: string) {
    return this.storage.getItem(this.SETTINGS_KEY)
      .then(settings => {
        return settings[key];
      });
  }

  save() {
    return this.setAll(this.settings);
  }

  get allSettings(): Promise<any> {
    if (this.settings){
      return Promise.resolve(this.settings);
    }
    else {
      return this.load().then(()=>{
        return this.settings;
      });
    }
  }
}
