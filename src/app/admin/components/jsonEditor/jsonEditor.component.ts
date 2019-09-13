import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as JSONEditor from 'jsoneditor';

@Component({
  selector: 'json-editor',
  templateUrl: './jsonEditor.component.html',
  styleUrls: ['./jsonEditor.component.scss']
})
export class JsonEditorComponent implements OnInit {
  options: any;
  jsonEditorCode: any;
  jsonEditorTree: any;
  darkMode: boolean;
  autoConvert: boolean;
  jsonCode: any;
  @Input() json: any;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {
    this.options = {
      code : {
        mode: 'code',
        onChange: () => {
          const json = this.jsonEditorCode.get();
          if (json) {
            this.jsonCode = json;
            this.validateJSON('Tree');
            this.change.emit(this.jsonCode);
          }
        }
      },
      tree : {
        mode: 'tree',
        onChange: () => {
          const json = this.jsonEditorTree.get();
          if (json) {
            this.jsonCode = json;
            this.validateJSON('Code');
            this.change.emit(this.jsonCode);
          }
        }
      }
    };
    this.jsonEditorCode = new JSONEditor(document.getElementById('jsonEditorCode'), this.options.code);
    this.jsonEditorTree = new JSONEditor(document.getElementById('jsonEditorTree'), this.options.tree);
    this.setDefaultOptions();
  }

  ngOnChanges() {
    if(this.json && this.jsonEditorCode && this.jsonEditorTree) {
      this.jsonEditorCode.set(this.json)
      this.jsonEditorTree.set(this.json)
    }
  }

  validateJSON = (type) => {
    if (type === 'Tree') {
        this.jsonEditorTree.set(this.jsonCode);
    } else if (type === 'Code') {
        this.jsonEditorCode.set(this.jsonCode);
    }
  }

  setDefaultOptions = () => {
    this.darkMode = false;
    this.autoConvert = true;
    this.jsonCode = {};
    this.validateJSON('Code');
    if (this.autoConvert) {
      this.validateJSON('Tree');
    }
  }
}
