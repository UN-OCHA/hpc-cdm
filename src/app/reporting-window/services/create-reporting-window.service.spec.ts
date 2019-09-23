import { TestBed } from '@angular/core/testing';

import { CreateReportingWindowService } from './create-reporting-window.service';

describe('CreateReportingWindowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateReportingWindowService = TestBed.get(CreateReportingWindowService);
    expect(service).toBeTruthy();
  });
});
