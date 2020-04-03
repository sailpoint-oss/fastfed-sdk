import { TestBed } from '@angular/core/testing';

import { AppService } from '../common/services/app.service';

describe('ApplicationsListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppService = TestBed.get(AppService);
    expect(service).toBeTruthy();
  });
});
