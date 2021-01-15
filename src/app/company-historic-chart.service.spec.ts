import { TestBed } from '@angular/core/testing';

import { CompanyHistoricChartService } from './company-historic-chart.service';

describe('CompanyHistoricChartService', () => {
  let service: CompanyHistoricChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyHistoricChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
