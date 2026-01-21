enum Richtung {
  // Nord
  N = "N",
  // Süd
  S = "S",
  // West
  W = "W",
  // Ost
  O = "O",
  // Nordwest
  NW = "NW",
  // Nordost
  NO = "NO",
  // Südwest
  SW = "SW",
  // Südost
  SO = "SO",
  // EIN
  EIN = "EIN",
  // AUS
  AUS = "AUS",
}

export default Richtung;

export const RichtungText = new Map<string, string>([
  [Richtung.N, "Nord"],
  [Richtung.S, "Süd"],
  [Richtung.W, "West"],
  [Richtung.O, "Ost"],
  [Richtung.NO, "Nordost"],
  [Richtung.NW, "Nordwest"],
  [Richtung.SO, "Südost"],
  [Richtung.SW, "Südwest"],
  [Richtung.EIN, "EIN"],
  [Richtung.AUS, "AUS"],
]);
