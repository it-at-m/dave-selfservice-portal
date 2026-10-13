enum Strassenseite {
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
}

export default Strassenseite;

export const StrassenseiteText = new Map<string, string>([
  [Strassenseite.N, "Nord"],
  [Strassenseite.S, "Süd"],
  [Strassenseite.W, "West"],
  [Strassenseite.O, "Ost"],
  [Strassenseite.NO, "Nordost"],
  [Strassenseite.NW, "Nordwest"],
  [Strassenseite.SO, "Südost"],
  [Strassenseite.SW, "Südwest"],
]);
