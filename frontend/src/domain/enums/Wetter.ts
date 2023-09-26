import KeyVal from "@/domain/KeyVal";

export enum Wetter {
    // Sonnig
    SUNNY = "SUNNY",
    // Sonnig kalt
    SUNNY_COLD = "SUNNY_COLD",
    // bewölkt
    CLOUDY = "CLOUDY",
    // regnerisch (Schauer)
    RAINY = "RAINY",
    // regnerisch (dauerhaft)
    CONTINUOUS_RAINY = "CONTINUOUS_RAINY",
    // neblig
    FOGGY = "FOGGY",
    // Schnee
    SNOWY = "SNOWY",
    // keinen Angabe
    NO_INFORMATION = "NO_INFORMATION",
}

export default Wetter;

export const wetterText = new Map<string, string>([
    [Wetter.SUNNY, "sonnig"],
    [Wetter.SUNNY_COLD, "sonnig kalt"],
    [Wetter.CLOUDY, "bewölkt"],
    [Wetter.RAINY, "regnerisch (Schauer)"],
    [Wetter.CONTINUOUS_RAINY, "regnerisch (dauerhaft)"],
    [Wetter.FOGGY, "neblig"],
    [Wetter.SNOWY, "Schneefall"],
    [Wetter.NO_INFORMATION, "Keine Wetterinformationen"],
]);

export const wetterDropDown = new Array<KeyVal>(
    { value: Wetter.SUNNY, text: wetterText.get(Wetter.SUNNY)! },
    { value: Wetter.SUNNY_COLD, text: wetterText.get(Wetter.SUNNY_COLD)! },
    { value: Wetter.CLOUDY, text: wetterText.get(Wetter.CLOUDY)! },
    { value: Wetter.RAINY, text: wetterText.get(Wetter.RAINY)! },
    {
        value: Wetter.CONTINUOUS_RAINY,
        text: wetterText.get(Wetter.CONTINUOUS_RAINY)!,
    },
    { value: Wetter.FOGGY, text: wetterText.get(Wetter.FOGGY)! },
    { value: Wetter.SNOWY, text: wetterText.get(Wetter.SNOWY)! },
    {
        value: Wetter.NO_INFORMATION,
        text: wetterText.get(Wetter.NO_INFORMATION)!,
    }
);
