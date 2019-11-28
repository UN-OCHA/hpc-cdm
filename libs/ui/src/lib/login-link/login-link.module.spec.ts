import { async, TestBed } from '@angular/core/testing';
import { LoginLinkModule } from './login-link.module';

describe('LoginLinkModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LoginLinkModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(LoginLinkModule).toBeDefined();
  });
});
