export const getCsvContentForAllZaehlarten = (zaehlstellennummer: string, zaehlart: string, datum: string) => {

    return `Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;
${zaehlstellennummer};${zaehlart};${datum};<knotenarmnummer>;;;;;;;
Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss
`;

};