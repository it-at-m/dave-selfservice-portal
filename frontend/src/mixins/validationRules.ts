export default {
  install(Vue: any, options: any) {
    // Regular Expressions anschauen auf https://regexr.com/

    let RULE_SET: any = {
      // Einzelne Regeln
      REQUIRED: [(v: string) => !!v || 'Feld muss befüllt werden'],
      NOSPACES: [(v: string) => (!v || v.toString().indexOf(' ') < 0) || 'Keine Leerzeichen erlaubt'],
      ONLYNUMBERS: [(v: string) => (!v || /^([0-9]+)$/.test(v)) || "Feld darf nur Zahlen enthalten"],
      MAX_SIX_CHARACTERS: [(v: string) => (!v || v.toString().length <= 6) || "Feld darf nicht mehr als 6 Zeichen beinhalten"],
      SIX_CHARACTERS: [(v: string) => (!v || v.toString().length == 6) || "Feld muss 6 Zeichen beinhalten"],
      DATE: [(v: string) => (!v || /^([0-9][0-9]\.[0-9][0-9]\.[0-9][0-9][0-9][0-9])$/.test(v)) || "Feld muss das Format DD.MM.YYYY haben"],
      MONEY: [(v: string) => (!v || /^((\$?([0-9]{1,3}(\.)?([0-9]{3}(\.)?)*[0-9]{3}|[0-9]+)(,[0-9]{1,2})?)|(0,[0-9]{1,2}))$/.test(v)) || "Feld kann höchstens 2 Nachkommastellen haben z.B. 1234,00 oder 1.234,00"],
      DECIMALPOINTS: [(v: string) => (!v || /^(([0-9.]*[0-9](,[0-9]{1,2})?)|0,[0-9]{1,2})$/.test(v)) || "zuviele Nachkommastellen"],
      // Eine Telefonnummer beginnt mit Null oder Klammer auf oder einem Pluszeichen,
      // gefolgt von Ziffern, Punkten, Bindestrichen, runden Klammern, Schrägstrichen.
      // Mindestens 7 Zeichen müssen es insgesamt sein.
      // Telefonnummern ohne Vorwahl werden nicht akzeptiert.
      PHONENUMBER: [(v: string) => (!v || /^([0(+][0-9\\.-\\/ ()]{7,})$/.test(v)) || "Vorwahl beginnend mit 0 ( oder + gefolgt von Leerstellen 0-9 . (  ) - /"],
      EMAIL: [(v: string) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Email ungültig"], // Aufbau: _@_._
      // UTM_KOORDINATE: [(v: string) => (!v || /^([0-9]{0,6}(\.[0-9]{0,3})?)$/.test(v)) || "Feld muss einer Koordinatenangabe xxxxxx.xxx entsprechen"],
      X_KOORDINATE: [(v: string) => (!v || /^([0-9]{6})$/.test(v)) || "Feld muss einer Koordinatenangabe mit genau 6 Ziffern entsprechen"],
      Y_KOORDINATE: [(v: string) => (!v || /^([0-9]{7})$/.test(v)) || "Feld muss einer Koordinatenangabe mit genau 7 Ziffern entsprechen"],
      // UTM_KOORDINATE: [(v: string) => (!v || /^([0-9]{0,6}[0-9]?)$/.test(v)) || "Feld muss einer Koordinatenangabe mit mindestens6, maximal 7 Ziffern entsprechen"],

      // Zusammengehaengte Regeln müssen als Funktion definiert werden, da sonst kein Zugriff auf andere Werte innerhalb des gleichen Objektes erfolgen kann
      REQNOSPACE: function () {
        return [this.REQUIRED[0], this.NOSPACES[0]];
      },

      ZAEHLSTELLENNUMMER: function () {
        return [this.REQUIRED[0], this.NOSPACES[0], this.ONLYNUMBERS[0], this.SIX_CHARACTERS[0]];
      },

      // KOORDINATE: function () {
      //   return [this.REQUIRED[0], this.UTM_KOORDINATE[0]];
      // },

      XKOORDINATE: function () {
        return [this.REQUIRED[0], this.X_KOORDINATE[0]];
      },

      YKOORDINATE: function () {
        return [this.REQUIRED[0], this.Y_KOORDINATE[0]];
      }

    };

    Vue.prototype.$lhmGetRule = (key: string) => {
      // Ueberpruefung ob der entsprechende Wert eine Funktion oder ein Objekt / Array ist, damit in den vue Komponenten der Aufruf immer gleich ist
      if (RULE_SET[key] instanceof Function) {
        return RULE_SET[key]();
      } else {
        return RULE_SET[key];
      }
    };

    Vue.prototype.$lhmValidateDecimalPoints = (currencyToValidate: string) => {
      return RULE_SET['DECIMALPOINTS'][0](currencyToValidate) === true;
    };


  }
}