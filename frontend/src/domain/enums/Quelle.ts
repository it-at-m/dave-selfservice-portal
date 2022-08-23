import KeyVal from "@/domain/KeyVal";

export enum Quelle {
  // manuelle Erhebung
  MANUALLY = 'MANUALLY',
  // Detektorzählung
  DETECTOR = 'DETECTOR',
  // Seitenradar
  RADAR = 'RADAR',
  // Videoerhebung
  VIDEO = 'VIDEO',
}

export default Quelle;

export const quelleText = new Map<string, string>([
  [Quelle.MANUALLY, 'Händisch'],
  [Quelle.DETECTOR, 'Detektor'],
  [Quelle.RADAR, 'Radar'],
  [Quelle.VIDEO, 'Video'],
]);

export const quelleDropDown = new Array<KeyVal>(
    {value: Quelle.MANUALLY, text: quelleText.get(Quelle.MANUALLY)!},
    {value: Quelle.DETECTOR, text: quelleText.get(Quelle.DETECTOR)!},
    {value: Quelle.RADAR, text: quelleText.get(Quelle.RADAR)!},
    {value: Quelle.VIDEO, text: quelleText.get(Quelle.VIDEO)!},
);

