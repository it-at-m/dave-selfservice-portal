export default class BaseUrlProvider {

  static getBaseUrl(): string {
    let location = window.location;
    if (location.host === 'localhost:8086') {
      return `${location.protocol}//localhost:8084`;
    }
    return `${location.protocol}//${location.host}`;
  }
}
