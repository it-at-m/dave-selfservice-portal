import type KeyVal from "@/types/common/KeyVal";

export const StadtbezirkToBeschreibung = new Map<number, string>([
  [1, "1 Altstadt - Lehel"],
  [2, "2 Ludwigsvorstadt - Isarvorstadt"],
  [3, "3 Maxvorstadt"],
  [4, "4 Schwabing West"],
  [5, "5 Au - Haidhausen"],
  [6, "6 Sendling"],
  [7, "7 Sendling - Westpark"],
  [8, "8 Schwanthalerhöhe"],
  [9, "9 Neuhausen - Nymphenburge"],
  [10, "10 Moosach"],
  [11, "11 Milbertshofen - Am Hart"],
  [12, "12 Schwabing - Freimann"],
  [13, "13 Bogenhausen"],
  [14, "14 Berg am Laim"],
  [15, "15 Trudering - Riem"],
  [16, "16 Ramersdorf - Perlach"],
  [17, "17 Obergiesing - Fasangarten"],
  [18, "18 Untergiesing - Harlaching"],
  [19, "19 Thalkirchen - Obersendling - Forstenried - Fürstenried - Solln"],
  [20, "20 Hadern"],
  [21, "21 Pasing - Obermenzing"],
  [22, "22 Aubing - Lochhausen - Langwied"],
  [23, "23 Allach - Untermenzing"],
  [24, "24 Feldmoching - Hasenbergl"],
  [25, "25 Laim"],
  [32, "32 Außerhalb der Stadtgrenze"],
]);

export const BeschreibungToStadtbezirk = new Map(
  [...StadtbezirkToBeschreibung].reverse()
);

export const stadtbezirke = new Array<KeyVal>(
  { value: "1", title: "1 Altstadt - Lehel" },
  { value: "2", title: "2 Ludwigsvorstadt - Isarvorstadt" },
  { value: "3", title: "3 Maxvorstadt" },
  { value: "4", title: "4 Schwabing West" },
  { value: "5", title: "5 Au - Haidhausen" },
  { value: "6", title: "6 Sendling" },
  { value: "7", title: "7 Sendling - Westpark" },
  { value: "8", title: "8 Schwanthalerhöhe" },
  { value: "9", title: "9 Neuhausen - Nymphenburge" },
  { value: "10", title: "10 Moosach" },
  { value: "11", title: "11 Milbertshofen - Am Hart" },
  { value: "12", title: "12 Schwabing - Freimann" },
  { value: "13", title: "13 Bogenhausen" },
  { value: "14", title: "14 Berg am Laim" },
  { value: "15", title: "15 Trudering - Riem" },
  { value: "16", title: "16 Ramersdorf - Perlach" },
  { value: "17", title: "17 Obergiesing - Fasangarten" },
  { value: "18", title: "18 Untergiesing - Harlaching" },
  {
    value: "19",
    title: "19 Thalkirchen - Obersendling - Forstenried - Fürstenried - Solln",
  },
  { value: "20", title: "20 Hadern" },
  { value: "21", title: "21 Pasing - Obermenzing" },
  { value: "22", title: "22 Aubing - Lochhausen - Langwied" },
  { value: "23", title: "23 Allach - Untermenzing" },
  { value: "24", title: "24 Feldmoching - Hasenbergl" },
  { value: "25", title: "25 Laim" },
  { value: "32", title: "32 Außerhalb der Stadtgrenze" }
);
