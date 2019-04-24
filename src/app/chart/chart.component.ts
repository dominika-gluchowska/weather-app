import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { formatDate } from '@angular/common';
import {FormControl} from '@angular/forms';
import * as _ from 'lodash';
import { Chart } from 'chart.js';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { Moment } from 'moment';
import * as moment from 'moment';
import {MatDatepicker} from '@angular/material/datepicker';

import { WeatherService } from '../weather.service';
import { Metric } from '../metric';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE ]},
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class ChartComponent implements OnInit, OnChanges {

  @Input() public label: string;
  @Input() public selectedDataRange: Metric[] = [];
  barChart: Chart = {};

  constructor() { }

  ngOnInit() {
    this.initChart();
  }

  ngOnChanges() {
    if (this.barChart.data) {
      this.updateChart();
    }
  }

  initChart = () => {
      this.barChart = new Chart('chart', {
        type: 'bar',
        data: {
          labels: this.selectedDataRange.map((e) => this.dateFormatter(e)),
          datasets: [{
            label: this.label,
            data: this.selectedDataRange.map(e => e.value),
            fill: false,
            lineTension: 0.2,
            borderColor: 'dimgrey',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
  }

  updateChart = () => {
    this.barChart.data.labels = this.selectedDataRange.map((e) => this.dateFormatter(e));
    this.barChart.data.datasets[0].data = this.selectedDataRange.map(e => e.value);
    this.barChart.update();
  }

  /* utils */
  dateFormatter = (element: Metric): string => {
    return formatDate(element.date, 'MMM y', 'en-GB');
  }

}
