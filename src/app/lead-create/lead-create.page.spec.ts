import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadCreatePage } from './lead-create.page';

describe('LeadCreatePage', () => {
  let component: LeadCreatePage;
  let fixture: ComponentFixture<LeadCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadCreatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
