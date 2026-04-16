import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsEdit } from './clients-edit';

describe('ClientsEdit', () => {
  let component: ClientsEdit;
  let fixture: ComponentFixture<ClientsEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
