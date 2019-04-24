import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import * as moment from 'moment';

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
  selector: 'app-chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE ]},
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class ChartContainerComponent implements OnInit {

  @Input() public metricName: string;

  dateFrom: FormControl = new FormControl(moment());
  dateTo: FormControl = new FormControl(moment());
  minDate: Date;
  maxDate: Date;

  chartData: Metric[] = [];
  selectedDataRange: Metric[] = [];

  dataRangeValid = true;

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
    this.dataRangeValid = this.dateFrom.value.isSameOrBefore(this.dateTo.value);
  }

  /* utils */
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

        const from = moment((this.chartData.length - 12 > 0) ?
            this.chartData[this.chartData.length - 12].date : this.chartData[0].date);
        const to = moment(this.chartData[this.chartData.length - 1].date);
        this.dateFrom = new FormControl(from);
        this.dateTo = new FormControl(to);
        this.selectedDataRange = this.filterChartDataByRange(from, to);
      }
      );
  }

}
