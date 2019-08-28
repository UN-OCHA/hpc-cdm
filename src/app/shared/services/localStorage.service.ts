import { Injectable } from '@angular/core';


@Injectable()
export class LocalStorageService {

  constructor() {}

  public isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  public getListOfKeysInLocalStorage(): Array<any> {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const keyString = localStorage.key(i);
      const key = this.isJsonString(keyString) ? JSON.parse(keyString) : keyString;
      result.push(key);
    }
    return result;
  }

  public getFilteredListOfKeysInLocalStorage(desc): Array<any> {
    return this.getListOfKeysInLocalStorage()
      .filter(key => key.description === desc)
      .map(key => key.name);
  }

  public getItemInLocalStorage(name: string, description = ''): any {
    const keyObj = {
      name: name,
      description: description
    };
    const key = JSON.stringify(keyObj);
    const value = localStorage.getItem(key);
    return JSON.parse(value);
  }

  public getItem(name: string, description = ''): any {
    return this.getItemInLocalStorage(name, description);
  }

  public setItemInLocalStorage(name: string, data: any, description = ''): void {
    const keyObj = {
      name: name,
      description: description
    };
    const key = JSON.stringify(keyObj);
    const value = JSON.stringify(data);
    localStorage.setItem(key, value);
  }

  public setItem(name: string, data: any, description = ''): void {
    return this.setItemInLocalStorage(name, data, description);
  }

  public removeItemInLocalStorage(name: string, description = ''): void {
    const keyObj = {
      name: name,
      description: description
    };
    const key = JSON.stringify(keyObj);
    localStorage.removeItem(key);
  }

  public removeItem(name: string, description = ''): void {
    return this.removeItem(name, description);
  }

}
