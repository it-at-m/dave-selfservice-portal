import { Himmelsrichtung } from "@/api/client";

export const himmelsrichtungText: Map<string, string> = new Map<string, string>(
  [
    [Himmelsrichtung.N, "Nord"],
    [Himmelsrichtung.No, "Nordost"],
    [Himmelsrichtung.O, "Ost"],
    [Himmelsrichtung.So, "Südost"],
    [Himmelsrichtung.S, "Süd"],
    [Himmelsrichtung.Sw, "Südwest"],
    [Himmelsrichtung.W, "West"],
    [Himmelsrichtung.Nw, "Nordwest"],
  ]
);
