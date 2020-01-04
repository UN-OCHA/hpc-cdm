private dataToEndpoint(httpCommand: string, endpoint: string, options?: any): Observable<any> {
  const tryUrl = this.buildUrl(endpoint);

  const data = (options && options.data) || {};

  let params = this.setParams();
  const headers = this.setHeaders();

  if (options && options.scope) {
    params = params.set('scope', options.scope);
  }

  this.processStart(tryUrl, data, '');

  return this.http[httpCommand](tryUrl, data, {params, headers})
    .pipe(map((res: HttpResponse<any>) => this.processSuccess(tryUrl, res)))
    .pipe(map((res: any) => res.data || res))
    .pipe(catchError((error: any) => this.processError(error)));
}

private postToEndpoint(endpoint: string, options?: any): Observable<any> {
  return this.dataToEndpoint('post', endpoint, options);
}

private putToEndpoint(endpoint: string, options?: any): Observable<any> {
  return this.dataToEndpoint('put', endpoint, options);
}
