import { TestBed } from '@angular/core/testing';

import { FastfedService } from './fastfed.service';

describe('FastfedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FastfedService = TestBed.get(FastfedService);
    expect(service).toBeTruthy();
  });
});
