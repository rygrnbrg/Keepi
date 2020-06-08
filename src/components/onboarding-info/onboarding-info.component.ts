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
    if (this.platform.is("cordova")) {
      nativeStorage.getItem(this.key).then((value) => {
        if (value) {
          this.isRelevant = false;
        }
        else {
          this.isRelevant = true;
        }
      });
    }
    else{
      this.isRelevant = true;
    }
  }

  public markNotrelevant() {
    this.nativeStorage.setItem(this.key, true);
    this.isRelevant = false;
  }
  ngOnInit() { }

}
