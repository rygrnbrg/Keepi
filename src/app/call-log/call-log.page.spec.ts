import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CallLogPage } from './call-log.page';

describe('CallLogPage', () => {
  let component: CallLogPage;
  let fixture: ComponentFixture<CallLogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallLogPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CallLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
