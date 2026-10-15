import XsrfTokenExtractor from "@/api/util/XsrfTokenExtractor";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export default class FetchUtils {
  /**
   * Liefert eine default GET-Config für fetch
   */
  static getGETConfig(): RequestInit {
    return {
      headers: this.getHeaders(),
      mode: "cors",
      credentials: "same-origin",
      redirect: "manual",
    };
  }

  /**
   * Liefert eine default POST-Config für fetch
   * @param body zu übertragender Body
   */
  static getPOSTConfig(body: any): RequestInit {
    return {
      method: "POST",
      body: JSON.stringify(body),
      headers: FetchUtils.getHeaders(),
      mode: "cors",
      credentials: "same-origin",
      redirect: "manual",
    };
  }

  /**
   *  Baut den Header fuer den Request auf
   * @returns {Headers}
   */
  static getHeaders(): Headers {
    return new Headers({
      "Content-Type": "application/json",
      "Accept-Language": "de-DE",
      "X-XSRF-TOKEN": XsrfTokenExtractor.getXsrfToken().toString(),
    });
  }
}
