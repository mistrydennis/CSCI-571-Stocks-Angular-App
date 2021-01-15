import { TestBed } from '@angular/core/testing';

import { NewsDetailsService } from './news-details.service';

describe('NewsDetailsService', () => {
  let service: NewsDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
