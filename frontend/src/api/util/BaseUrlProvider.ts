export default class BaseUrlProvider {
  static getBaseUrl(): string {
    const location = window.location;
    if (location.host === "localhost:8085") {
      return `${location.protocol}//localhost:8086`;
    }
    return `${location.protocol}//${location.host}`;
  }
}
