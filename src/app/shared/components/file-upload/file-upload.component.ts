import { Optional, Host, SkipSelf, Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlContainer, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor, OnInit {
  @Input() id?: string;
  @Input() label: string;
  @Input() required?: boolean;
  @Input() formControlName: string;

  uid: string;
  disabled: boolean;
  value: any;

  onTouched: any = () => {};
  onChange: any = () => {};

  control: AbstractControl;

  constructor(
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer
  ){}

  ngOnInit() {
    this.required = typeof this.required !== 'undefined';
    if(this.id) {
      this.uid = `file${this.id}`;
    } else {
      this.uid = `file${new Date().valueOf()}`;
    }
    // console.log(this.id)
    // console.log(this.uid)
    // console.log(this.formControlName)
    this.control = this.controlContainer.control.get(this.formControlName);
  }

  writeValue(value: any): void {
    // console.log(value)
    this.value = value ? value : {};
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  chooseFile(): void {
    (document.getElementById(this.uid) as HTMLElement).click();
  }

  handleFileInput(files: FileList) {
    const fileToUpload = files.item(0);
    // console.log(fileToUpload)
    if(fileToUpload) {
      this.onChange(fileToUpload);
      this.value = fileToUpload;
      // console.log(this.value)
    } else {
      // this.valid = this.required ? false : true;
    }
  }

  removeFile() {
    this.value = {};
  }
}
