import { Directive, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

import * as moment from 'moment';

@Directive({
  selector: '[appDateInputFormatter]'
})
export class DateInputFormatterDirective {
  private value;
  private displayValue;

  private dateRegex =  /{\d}2\/{\d}2\/{\d}4/;

  @Input('dateModel') public set maskValue(value: string) {
    if (value !== this.value) {
      const {valid, date} = this.regexDateTranslater(value);
      this.setDate(valid, date, value);
    }
  };
  @Output() changeEmitter = new EventEmitter();

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  public onInput(event: { target: { value?: string }}): void {
    console.log('on input change', event.target.value);
    const target = event.target;
    const value = target.value;
    if (value !== this.value) {
      const {valid, date} = this.regexDateTranslater(value);
      this.setDate(valid, date, value);
    }
  }

  private setDate(valid: boolean, momentDate: any, value: string) {
    console.log('valid', valid, momentDate ? momentDate.format() : '', value);
    if (valid) {
      this.displayValue = momentDate.format('DD/MM/YYYY');
      this.ngControl.control.setValue(this.displayValue);
      this.value = momentDate.toDate();
      this.changeEmitter.emit(momentDate.toDate());
    } else {
      this.displayValue = value;
      this.ngControl.control.setValue(this.displayValue);
      console.log('this.ngControl', this.ngControl.control.value)
    }
  }

  private regexDateTranslater (value: string): {valid: boolean, date: moment.Moment} {
    if (this.dateRegex.test(value)) {
      return {valid: true, date: moment(value, 'DD/MM/YYYY')};
    } else if (moment(value, 'YYYY-MM-DD', true).isValid()) {
      console.log('moment parses this like a dumb dumb', value)
      return {valid: true, date: moment(value)};
    } else {
      console.log('fake news')
      return {valid: false, date: null}
    }
  }
}
