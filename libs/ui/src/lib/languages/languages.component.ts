import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {
  app = {language: 'en'};

  ngOnInit() {}

  setLanguage(language:any) {
    // this.app.language = language;
  }
}
