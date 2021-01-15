import { TestBed } from '@angular/core/testing';

import { CompanyLatestPriceService } from './company-latest-price.service';

describe('CompanyLatestPriceService', () => {
  let service: CompanyLatestPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyLatestPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
