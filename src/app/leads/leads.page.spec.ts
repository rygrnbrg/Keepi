import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadsPage } from './leads.page';

describe('LeadsPage', () => {
  let component: LeadsPage;
  let fixture: ComponentFixture<LeadsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
