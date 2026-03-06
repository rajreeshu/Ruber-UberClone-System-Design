import { TestBed } from '@angular/core/testing';

import { MarkerFactory} from './marker-factory';

describe('MarkerFactoryService', () => {
  let service: MarkerFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkerFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
