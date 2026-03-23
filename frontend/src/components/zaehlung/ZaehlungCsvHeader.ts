export const getCsvContentForAllZaehlarten = (
  zaehlstellennummer: string,
  zaehlart: string,
  datum: string
) => {
  return (
    `Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;\n` +
    `${zaehlstellennummer};${zaehlart};${datum};<knotenarmnummer>;;;;;;;\n` +
    `Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss\n`
  );
};
