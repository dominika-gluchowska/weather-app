import { Component, OnInit, Input } from '@angular/core';
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
export class ChartComponent implements OnInit {

  @Input() public metricName: string;

  dateFrom = new FormControl(moment());
  dateTo = new FormControl(moment());

  chartData: Metric[] = [];
  selectedDataRange: Metric[] = [];
  minDate: Date;
  maxDate: Date;
  dataRangeValid = true;

  barChart: Chart = {};

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.getChartData();
  }

  /* data selector handldlers */
  startChosenYearHandler(normalizedYear: Moment) {
    this.chosenYearHandler(normalizedYear, this.dateFrom);
  }

  startChosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.chosenMonthHandler(normalizedMonth, datepicker, this.dateFrom);
    this.onDateChange();
  }

  toChosenYearHandler(normalizedYear: Moment) {
    this.chosenYearHandler(normalizedYear, this.dateTo);
  }

  toChosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.chosenMonthHandler(normalizedMonth, datepicker, this.dateTo);
    this.onDateChange();
  }

  chosenYearHandler(normalizedYear: Moment, objToUpdate: FormControl) {
    const ctrlValue = objToUpdate.value;
    ctrlValue.year(normalizedYear.year());
    objToUpdate.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>, objToUpdate: FormControl) {
    const ctrlValue = objToUpdate.value;
    ctrlValue.month(normalizedMonth.month());
    objToUpdate.setValue(ctrlValue);
    datepicker.close();
  }

  onDateChange() {
    this.selectedDataRange = this.filterChartDataByRange(this.dateFrom.value, this.dateTo.value);
    this.updateChart();
    this.dataRangeValid = this.dateFrom.value.isSameOrBefore(this.dateTo.value);
  }

  /* chart handlers */
  initChart = () => {
      this.barChart = new Chart('barChart', {
        type: 'bar',
        data: {
          labels: this.selectedDataRange.map((e) => this.dateFormatter(e)),
          datasets: [{
            label: this.metricName,
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
    return formatDate(new Date(element.year, element.month), 'MMM y', 'en-GB');
  }

  filterChartDataByRange(start: Moment, to: Moment) {
    return _.filter(this.chartData,
      (o: Metric) => (moment(o.date).isSameOrAfter(start) && moment(o.date).isSameOrBefore(to)));
  }

  getChartData(): void {
    this.weatherService.getData(this.metricName)
      .subscribe(data => {
        this.chartData = data;

        this.minDate = this.chartData[0].date;
        this.maxDate = this.chartData[this.chartData.length - 1].date;

        const from = moment((this.chartData.length - 13 > 0) ?
            this.chartData[this.chartData.length - 13].date : this.chartData[0].date);
        const to = moment(this.chartData[this.chartData.length - 1].date);
        this.dateFrom = new FormControl(from);
        this.dateTo = new FormControl(to);
        this.selectedDataRange = this.filterChartDataByRange(from, to);
        this.initChart();
      }
      );
  }

}
