import { Quelle } from "@/api/client";

export const quelleText = new Map<string, string>([
  [Quelle.Manually, "Händisch"],
  [Quelle.Detector, "Detektor"],
  [Quelle.Radar, "Radar"],
  [Quelle.Video, "Video"],
]);
