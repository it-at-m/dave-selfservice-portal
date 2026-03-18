import {describe, it, expect} from "vitest"
import {getCsvContentForAllZaehlarten} from "@/components/zaehlung/ZaehlungCsvHeader";

describe("getCsvContentForAllZaehlarten", () => {
    it("should return the correct csv content headers", () => {
        const result = getCsvContentForAllZaehlarten("14103", "QJS", "2025-06-04");
        expect(result).toEqual(`Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;
14103;QJS;2025-06-04;<knotenarmnummer>;;;;;;;
Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss
`);

        const semicolonCount = (result.match(/;/g) || []).length;
        expect(semicolonCount, "Each of the 3 csv header templates should have 10 semicolons — for a total of 30.").toBe(30);

    });
});