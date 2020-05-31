import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadsFilterPage } from './leads-filter.page';

describe('LeadsFilterPage', () => {
  let component: LeadsFilterPage;
  let fixture: ComponentFixture<LeadsFilterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadsFilterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
