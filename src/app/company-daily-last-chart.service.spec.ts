import { TestBed } from '@angular/core/testing';

import { CompanyDailyLastChartService } from './company-daily-last-chart.service';

describe('CompanyDailyLastChartService', () => {
  let service: CompanyDailyLastChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyDailyLastChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
