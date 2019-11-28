import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  ngOnInit() {
  }

}


// isAuthenticated(route: ActivatedRouteSnapshot): Observable<boolean> {
//   const url = `${environment.authBaseUrl}account.json`;
//
//   this.api.processStart(url, {}, '');
//   const headers = authHeaders(this.oauth.getAccessToken());
//   return this.http.get(url, {headers})
//   .pipe(
//     map((res: HttpResponse<any>) => this.api.processSuccess(url, res)),
//     map(res => {
//       if (res.email) {
//         this.verifyUserProfile(res.email);
//         return true;
//       } else {
//         this.user = null;
//         return false;
//       }
//     }),
//     catchError(() => {
//       this.api.processSuccess(url, null);
//       this.user = null;
//       return of(false);
//     }));
// }
