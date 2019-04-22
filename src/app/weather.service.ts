import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Metric } from './metric';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiUrl = '/interview-question-data/metoffice/';

  constructor(private http: HttpClient) { }

  getData(metricName: string = 'Rainfall', region: string = 'England'): Observable<Metric[]> {
    return this.http.get<Metric[]>(this.apiUrl + metricName + '-' + region + '.json')
    .pipe(
      map( response =>
        response.map(singleMetric => {
          return {
              value: singleMetric.value,
              year: singleMetric.year,
              month: singleMetric.month,
              date: new Date(singleMetric.year, singleMetric.month)
            };
      })),
      catchError( error => {
          return throwError(error);
      })
   );
  }
}
