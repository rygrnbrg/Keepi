import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadSaveContactPage } from './lead-save-contact.page';

describe('LeadSaveContactPage', () => {
  let component: LeadSaveContactPage;
  let fixture: ComponentFixture<LeadSaveContactPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadSaveContactPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadSaveContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
