import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, environment } from '@hpc/core';


const { version } = require('package.json')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  name: string;
  ver: string;
  user;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router) {
    this.auth.tryLogin();
  }

  ngOnInit() {
    this.name = environment.title;
    this.ver = version;
    this.auth.user$.subscribe(user => {
      this.user = user;
    })
  }
}

// This lets us use "require" above in typescript to load package.json
declare function require(moduleName: string): any;
