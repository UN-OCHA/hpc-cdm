import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { environment } from 'environments/environment';

const { version: appVersion } = require('../../../../../../package.json')

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  public appVersion;
  public title: string;
  public selectedLanguage: string;

  constructor (
    private translate: TranslateService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    console.log(appVersion);
    if (environment.title) {
      this.title = environment.title;
    }
    this.selectedLanguage = this.translate.currentLang.toUpperCase();
  }

  public setLanguage (language:any) {
    this.translate.use(language);
    this.selectedLanguage = language.toUpperCase();
  }
}

// This lets us use "require" above in typescript to load package.json
declare function require(moduleName: string): any;
