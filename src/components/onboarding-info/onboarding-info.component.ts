import { Component, OnInit, Input } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-onboarding-info',
  templateUrl: './onboarding-info.component.html',
  styleUrls: ['./onboarding-info.component.scss'],
})
export class OnboardingInfoComponent implements OnInit {
  @Input()
  message: string;
  @Input()
  key: string;

  public isRelevant = false;
  constructor(private nativeStorage: NativeStorage, private platform: Platform) {

  }

  public markNotrelevant() {
    console.log(`Saving item to native storage: ${this.key}, value: ${true}}`);
    this.nativeStorage.setItem(this.key, true).then(value => {
      console.log(`Saved item to native storage: ${this.key}, value: ${true}, ${value}}`);
    });
    this.isRelevant = false;
  }

  ngOnInit() {
    if (this.platform.is("android")) {
      console.log(`Getting item from native storage: ${this.key}}`);
      this.nativeStorage.getItem(this.key).then((value) => {
        console.log(`Got item from native storage: ${this.key}, value: ${value}}`);
        if (value) {
          this.isRelevant = false;
        }
        else {
          this.isRelevant = true;
        }
      }, reason => {
        console.log(`Failed getting item from native storage: ${this.key}, reason: ${reason}}`);
        this.isRelevant = true;
      });
    }
    else {
      this.isRelevant = true;
    }
  }
}
