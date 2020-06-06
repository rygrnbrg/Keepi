import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadsViewPage } from './leads-view.page';

describe('LeadsViewPage', () => {
  let component: LeadsViewPage;
  let fixture: ComponentFixture<LeadsViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadsViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
