import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  metricName = 'Rainfall';
  selectedRegion = { name: 'England'};

  regions = [
    { name: 'UK'},
    { name: 'England'},
    { name: 'Scotland'},
    { name: 'Wales'}
  ];
}
