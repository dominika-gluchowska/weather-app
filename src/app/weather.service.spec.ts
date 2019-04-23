import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule,
  ]}
));

  it('should be created', () => {
    const service: WeatherService = TestBed.get(WeatherService);
    expect(service).toBeTruthy();
  });
});
