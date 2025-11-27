import { isEmpty } from "lodash";

import i18n from "@/plugins/i18n";
import { useSnackbarStore } from "@/store/SnackbarStore";

export function useDateUtils() {
  const snackbarStore = useSnackbarStore();

  function formatDate(date: string): string {
    if (!date) {
      return "";
    }
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year}`;
  }

  function sortDatesDescAsStrings(arrayToSort: string[]): string[] {
    return arrayToSort.sort(function (a, b) {
      return new Date(b).valueOf() - new Date(a).valueOf();
    });
  }

  function isDateAfter(dateToCheck: string, dateAfter: Date | string): boolean {
    return new Date(dateToCheck).valueOf() > new Date(dateAfter).valueOf();
  }

  function formatDateForBackend(date: Date | string): string {
    if (!date) {
      return "";
    }
    if (typeof date === "string") {
      const time = new Date().toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      date = new Date(date + "T" + time);
    }
    return date.toISOString();
  }

  function getTimeOfDate(date: Date | string): string {
    if (!date) {
      return "";
    }
    if (typeof date === "string") {
      date = getDatumOfString(date);
    }
    return `${i18n.global.d(date, "time", "de-DE")}`;
  }

  function getShortVersionOfDate(date: Date | string): string {
    if (!date) {
      return "";
    }
    if (typeof date === "string") {
      date = getDatumOfString(date);
    }
    return `${i18n.global.d(date, "short", "de-DE")}`;
  }

  function getShortVersionOfDateWithTime(date: Date | string): string {
    if (!date) {
      return "";
    }
    if (typeof date === "string") {
      date = getDatumOfString(date);
    }
    return `${getShortVersionOfDate(date)} - ${getTimeOfDate(date)}`;
  }

  function getLongVersionOfDate(date: Date | string): string {
    if (!date) {
      return "";
    }
    if (typeof date === "string") {
      date = getDatumOfString(date);
    }
    return `${i18n.global.d(date, "long", "de-DE")}`;
  }

  /**
   * es muss für i18n ein Datumsobjekt erzeugt werden.
   */
  function getDatumOfString(datum: string): Date {
    const d = datum;
    if (Date.parse(d)) {
      return new Date(d);
    }
    if (!isEmpty(datum)) {
      snackbarStore.showError(
        `Der angegebene Wert ${datum} kann nicht in ein Datum umgewandelt werden.`
      );
    }
    return new Date();
  }

  return {
    sortDatesDescAsStrings,
    formatDate,
    isDateAfter,
    formatDateForBackend,
    getTimeOfDate,
    getShortVersionOfDate,
    getShortVersionOfDateWithTime,
    getLongVersionOfDate,
    getDatumOfString,
  };
}
