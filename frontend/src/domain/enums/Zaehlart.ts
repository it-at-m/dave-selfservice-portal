import KeyVal from "@/domain/KeyVal";

enum Zaehlart {
    // Standardzählung
    N = "N",
    // Hauptverkehrsrichtung/Oberfläche/Hoch
    H = "H",
    //Querschnitt
    Q = "Q",
    //Querschnitt/Sonderzählung
    Q_ = "Q_",
    // Bahnschnitt
    QB = "QB",
    // Querschnitt/Hauptverkehrsrichtung/ Oberfläche/Hoch
    QH = "QH",
    //  Isarschnitt
    QI = "QI",
    // Stadtgrenzenzählung
    QS = "QS",
    // Querschnitt Tunnel/Unterführung/Tief
    QT = "QT",
    // Querschnitt Radverkehr,
    QR = "QR",
    // Radverkehrszählung
    R = "R",
    // Tunnel / Unterführung / Tief
    T = "T",
    // Teilknoten
    TK = "TK",
}

export default Zaehlart;

export const zaehlartText = new Map<string, string>([
    [Zaehlart.N, "Standardzählung"],
    [Zaehlart.H, "Hauptverkehrsrichtung/Oberfläche/Hoch"],
    [Zaehlart.Q, "Querschnitt"],
    [Zaehlart.Q_, "Querschnitt/Sonderzählung"],
    [Zaehlart.QB, "Bahnschnitt"],
    [Zaehlart.QH, "Querschnitt/Hauptverkehrsrichtung/ Oberfläche/Hoch"],
    [Zaehlart.QI, "Isarschnitt"],
    [Zaehlart.QS, "Stadtgrenzenzählung"],
    [Zaehlart.QT, "Querschnitt Tunnel/Unterführung/Tief"],
    [Zaehlart.QR, "Querschnitt Radverkehr"],
    [Zaehlart.R, "Radverkehrszählung"],
    [Zaehlart.T, "Tunnel / Unterführung / Tief"],
    [Zaehlart.TK, "Teilknoten"],
]);

export const zaehlartenDropDown = new Array<KeyVal>(
    { value: Zaehlart.N, text: zaehlartText.get(Zaehlart.N)! },
    { value: Zaehlart.H, text: zaehlartText.get(Zaehlart.H)! },
    { value: Zaehlart.Q, text: zaehlartText.get(Zaehlart.Q)! },
    { value: Zaehlart.Q_, text: zaehlartText.get(Zaehlart.Q_)! },
    { value: Zaehlart.QB, text: zaehlartText.get(Zaehlart.QB)! },
    { value: Zaehlart.QH, text: zaehlartText.get(Zaehlart.QH)! },
    { value: Zaehlart.QI, text: zaehlartText.get(Zaehlart.QI)! },
    { value: Zaehlart.QS, text: zaehlartText.get(Zaehlart.QS)! },
    { value: Zaehlart.QT, text: zaehlartText.get(Zaehlart.QT)! },
    { value: Zaehlart.QR, text: zaehlartText.get(Zaehlart.QR)! },
    { value: Zaehlart.R, text: zaehlartText.get(Zaehlart.R)! },
    { value: Zaehlart.T, text: zaehlartText.get(Zaehlart.T)! },
    { value: Zaehlart.TK, text: zaehlartText.get(Zaehlart.TK)! }
);
