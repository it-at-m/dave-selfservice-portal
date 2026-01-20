<template>
  <v-sheet
    width="100%"
    :height="height"
    :max-height="height"
    class="overflow-y-auto"
  >
    <v-card-text>
      <v-row dense>
        <v-col
          cols="8"
          sm="10"
        >
          <zaehlung-card-map
            height="200px"
            width="100%"
            :lat-lng-zaehlstelle="coordsZaehlstelle"
            :lat-lng-zaehlung="coordsZaehlung"
            :show-luftbild="false"
            :edit-zaehlung-marker="false"
          />
        </v-col>
        <v-col
          cols="4"
          sm="2"
        >
          <zaehlung-geometrie
            id="geo"
            v-model="zaehlung.knotenarme"
            height="100%"
            width="100%"
            active-color="#1565C0"
            passive-color="#EEEEEE"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="8"
          sm="10"
        >
          <v-row
            dense
            no-gutters
          >
            <v-col
              cols="12"
              sm="2"
            >
              <lhm-text-field
                caption="Kreisverkehr"
                :text="kreisverkehrText"
              />
            </v-col>
            <v-col
              cols="12"
              sm="8"
            >
              <lhm-text-field
                caption="Kreuzungsname"
                :text="zaehlung.kreuzungsname"
              />
            </v-col>
            <v-col
              v-if="isZaehlungEditable"
              cols="12"
              sm="2"
            >
              <v-btn
                text="Upload"
                :prepend-icon="uploadIcon"
                @click="fileUpload"
              />
              <v-form ref="fileInputForm">
                <v-file-input
                  :id="FILE_INPUT_FIELD_ID"
                  :key="resetFileInput"
                  v-model="files"
                  style="display: none"
                  density="compact"
                  single-line
                  multiple
                  accept=".csv"
                  @update:model-value="onFileSelect()"
                />
              </v-form>
            </v-col>
            <v-spacer />
          </v-row>
          <v-row
            v-for="arm in knotenarme"
            :key="arm.id"
            dense
            no-gutters
          >
            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                :value="arm.strassenname"
                variant="underlined"
                single-line
                readonly
                color="black"
                :prepend-icon="'mdi-numeric-' + arm.nummer"
              />
            </v-col>

            <v-col
              cols="12"
              sm="5"
            >
              <v-text-field
                v-model="arm.filename"
                class="ml-5"
                :style="getStyle(arm)"
                single-line
                readonly
                color="black"
                clearable
                @click:clear="deleteFile(arm.nummer)"
              />
            </v-col>
            <v-spacer />
          </v-row>
        </v-col>
        <v-col
          cols="4"
          sm="2"
        >
          <v-data-table
            v-if="isNotKreisverkehr"
            density="compact"
            :headers="fahrbeziehungHeader as Array<any>"
            :items="allFahrbeziehungen"
            item-key="id"
            :items-per-page="-1"
            hide-default-footer
            fixed-header
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-sheet>
</template>

<script setup lang="ts">
import type FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
import type GeoPoint from "@/domain/GeoPoint";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { LatLng } from "leaflet";
import { isNil, parseInt, toArray, toString } from "lodash";
import { computed, ref } from "vue";

import LhmTextField from "@/components/common/LhmTextField.vue";
import ZaehlungCardMap from "@/components/map/ZaehlungCardMap.vue";
import ZaehlungGeometrie from "@/components/zaehlung/ZaehlungGeometrie.vue";
import { useSnackbarStore } from "@/store/SnackbarStore";
import Richtung from "@/types/enum/Richtung";
import Status from "@/types/enum/Status";
import Strassenseite from "@/types/enum/Strassenseite";
import Zaehlart from "@/types/enum/Zaehlart";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import FahrbeziehungComparator from "@/util/FahrbeziehungComparator";
import KnotenarmComparator from "@/util/KnotenarmComparator";

interface Props {
  height: string;
}

defineProps<Props>();

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const EXPECTED_META_HEADER =
  "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;";

const EXPECTED_ZAEHLDATEN_HEADER =
  "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss";

const SEPARATOR = ";";

const COLUMN_COUNT = EXPECTED_ZAEHLDATEN_HEADER.split(SEPARATOR).length;

const FILE_INPUT_FIELD_ID = "fileInputField";

const snackbarStore = useSnackbarStore();

const resetFileInput = ref<number>(0);

const files = ref<Array<File>>([]);

const knotenarme = computed<Array<KnotenarmDTO>>(() => {
  const knotenarme = zaehlung.value.knotenarme;
  return knotenarme.sort(KnotenarmComparator.sortByNumber);
});

const kreisverkehrText = computed<string>(() =>
  zaehlung.value.kreisverkehr ? "Ja" : "Nein"
);

const uploadIcon = computed<string>(() =>
  isZaehlungEditable.value ? "mdi-upload" : ""
);

const coordsZaehlstelle = computed<LatLng>(() => {
  const punkt: GeoPoint = zaehlung.value.zaehlstellePunkt;
  if (punkt) {
    return new LatLng(parseFloat(punkt.lat), parseFloat(punkt.lon));
  } else {
    return DefaultObjectCreator.createCenterOfMunichLatLng();
  }
});

const coordsZaehlung = computed<LatLng>(() => {
  const punkt: GeoPoint = zaehlung.value.punkt;
  if (punkt) {
    return new LatLng(parseFloat(punkt.lat), parseFloat(punkt.lon));
  } else {
    return coordsZaehlstelle.value;
  }
});

const isZaehlungEditable = computed<boolean>(() => {
  return [Status.COUNTING, Status.CORRECTION].includes(zaehlung.value.status);
});

const allFahrbeziehungen = computed<Array<FahrbeziehungDTO>>(() =>
  toArray(zaehlung.value.fahrbeziehungen).sort(
    FahrbeziehungComparator.sortByActiveVonAndNach
  )
);

const isNotKreisverkehr = computed<boolean>(() => !zaehlung.value.kreisverkehr);

const fahrbeziehungHeader = [
  {
    title: "Von",
    align: "center",
    sortable: false,
    value: "von",
    lastFixed: true,
  },
  {
    title: "Nach",
    align: "center",
    sortable: false,
    value: "nach",
  },
];

function fileUpload(): void {
  if (isZaehlungEditable.value) {
    document.getElementById(FILE_INPUT_FIELD_ID)?.click();
  }
}

function getStyle(arm: KnotenarmDTO): string {
  let style = "display: none";
  if (arm.filename && arm.filename.trim().length > 0) {
    style = "";
  }
  return style;
}

function wrongFileType(file: File): boolean {
  return !file.name.toLowerCase().endsWith(".csv");
}

function deleteFile(nummer: number): void {
  zaehlung.value.knotenarme.forEach((arm: KnotenarmDTO) => {
    if (arm.nummer === nummer) {
      arm.filename = "";
      arm.filedata = [];
    }
  });
}

function getKnotenarmnummerOfCsv(csvData: Array<string>): number {
  // keine Daten vorhanden
  if (isNil(csvData) || csvData.length < 4) {
    return 0;
  }
  const metaData: string = csvData[1];
  // MetaHeader vorhanden?
  const metaDataSplitted: Array<string> = metaData.split(SEPARATOR);
  if (isNaN(Number(metaDataSplitted[3]))) {
    return 0;
  }
  return parseInt(metaDataSplitted[3].trim());
}

/**
 * Überprüft die hochgeladen Files auf Plausibilität, bevor diese gespeichert werden.
 *
 * Aufbau:
 *
 * Zeile 1:
 *      Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;
 * Zeile 2:
 *      Wert;Wert oder leer;Wert;Wert;;;;;
 * Zeile 3:
 *      Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss
 * Ab Zeile 4:
 *      nur noch dazugehörige Werte
 *
 * @param armNummer aktueller Knotenarm
 * @param csvData File as Array<string>
 */
function checkUploadedFiledata(
  armNummer: number,
  csvData: Array<string>
): string {
  // keine Daten vorhanden
  if (isNil(csvData) || csvData.length < 4) {
    return "Die hochgeladene Datei enthält keine Zähldaten.";
  }
  const metaHeader: string = csvData[0];
  // MetaHeader vorhanden?
  if (isNil(metaHeader)) {
    return "Die Header der Metadaten fehlen in der hochgeladenen Datei.";
  }
  // MetaHeader korrekt?
  if (metaHeader!.trim() !== EXPECTED_META_HEADER) {
    return `Die Header der Metadaten in der hochgeladenen Datei sind nicht korrekt.\nErwartet: ${EXPECTED_META_HEADER}`;
  }

  const metaData: string = csvData[1];
  // MetaData vorhanden?
  if (isNil(metaData)) {
    return "Die Metadaten fehlen in der hochgeladenen Datei.";
  }
  // MetaData korrekt?

  const expectedMetaData = `${zaehlung.value.zaehlstelleNummer};${
    zaehlung.value.zaehlart === Zaehlart.N ? "" : zaehlung.value.zaehlart
  };${zaehlung.value.datum};${armNummer};;;;;`;
  if (metaData!.trim() !== expectedMetaData) {
    return `Die Metadaten in der hochgeladenen Datei sind nicht korrekt.\nErwartet: ${expectedMetaData}`;
  }

  const zaehldatenHeader: string = csvData[2];
  // ZaehldatenHeader vorhanden und korrekt?
  if (isNil(zaehldatenHeader)) {
    return "Die Header der Zähldaten fehlen in der hochgeladenen Datei.";
  }
  // ZaehldatenHeader vorhanden und korrekt?
  if (zaehldatenHeader!.trim() !== EXPECTED_ZAEHLDATEN_HEADER) {
    return `Die Header der Zähldaten in der hochgeladenen Datei sind nicht korrekt.\nErwartet: ${EXPECTED_ZAEHLDATEN_HEADER}`;
  }

  // Plausiprüfung, ob nur Nummern enthalten sind in den Zähldaten
  for (const [csvLineIndex, data] of csvData.entries()) {
    // Prüfung ab Zeile 4 der CSV und für nicht leere Zeilen
    if (csvLineIndex > 2 && data.trim().length > 0) {
      const csvLineNumber: number = csvLineIndex + 1;
      const splittedLine: Array<string> = data.split(SEPARATOR);
      if (splittedLine.length !== COLUMN_COUNT) {
        return `Je Zeile müssen ${COLUMN_COUNT} Spalten enthalten sein.`;
      }

      // Intervallnummer muss eine Zahl sein zwischen 1 und 96 (eingeschlossen) sein
      if (isNaN(Number(splittedLine[0].trim()))) {
        return `Die Intervallnummer in Zeile ${csvLineNumber} muss eine Zahl zwischen 1 und 96 (eingeschlossen) sein.`;
      } else {
        const nr: number = parseInt(splittedLine[0].trim());
        if (nr < 1 || nr > 96) {
          return `Die Intervallnummer in Zeile ${csvLineNumber} muss zwischen 1 und 96 (eingeschlossen) liegen.`;
        }
      }

      // Unterscheidung zw. Fussverkehrszählung und anderen Zählungen
      let invalidityReason: string;
      if (
        zaehlung.value.zaehlart === Zaehlart.QJS ||
        zaehlung.value.zaehlart === Zaehlart.FJS ||
        zaehlung.value.zaehlart === Zaehlart.QU
      ) {
        invalidityReason = checkFussverkehrData(
          csvLineIndex,
          armNummer,
          splittedLine
        );
      } else {
        invalidityReason = checkFahrbeziehungData(
          csvLineIndex,
          armNummer,
          splittedLine
        );
      }
      if (invalidityReason.length !== 0) {
        return invalidityReason;
      }
    } else {
      // skip Meta and Header
    }
  }
  return "";
}

/**
 * Prüfung der Knotenarme in Zähldaten auf Übereinstimmung mit vorhandenen Fahrbeziehungen.
 *
 * @param csvLineIndex aktueller Zeilenindex
 * @param armNummer Nummer des aktuellen Knotenarms
 * @param splittedLine Array der Zeilenspalten
 * @return Grund der Invalidität
 */
function checkFahrbeziehungData(
  csvLineIndex: number,
  armNummer: number,
  splittedLine: Array<string>
): string {
  if (csvLineIndex > 3) {
    const nach: string = splittedLine[1];
    let fahrbeziehung: FahrbeziehungDTO | undefined;
    if (zaehlung.value.kreisverkehr) {
      fahrbeziehung = zaehlung.value.fahrbeziehungen.find((fahrbeziehung) => {
        return (
          fahrbeziehung.knotenarm === armNummer &&
          ((nach === "e" && fahrbeziehung.hinein) ||
            (nach === "v" && fahrbeziehung.vorbei) ||
            (nach === "a" && fahrbeziehung.heraus))
        );
      });
    } else {
      const nachArmNumber: number = parseInt(toString(nach.trim()));
      fahrbeziehung = zaehlung.value.fahrbeziehungen.find((fahrbeziehung) => {
        return (
          armNummer === fahrbeziehung.von &&
          nachArmNumber === fahrbeziehung.nach
        );
      });
    }
    if (isNil(fahrbeziehung)) {
      return `Für die Zähldaten in Zeile ${csvLineIndex + 1} ist keine Fahrbeziehung existent oder aktiv.\nWar: ${splittedLine}`;
    }
  }

  // Prüfung der Zähldaten auf Korrektheit
  const csvLineNumber: number = csvLineIndex + 1;
  if (zaehlung.value.kreisverkehr) {
    // e = einfahrend, a = abfahrend und v = vorbeifahrend
    if (
      splittedLine[1] !== "e" &&
      splittedLine[1] !== "v" &&
      splittedLine[1] !== "a"
    ) {
      return `Die 'nach'-Spalte in Zeile ${csvLineNumber} darf nur 'e', 'v' oder 'a' enthalten.\nWar: ${splittedLine}`;
    }
    for (
      let columnIndex = 2;
      columnIndex < splittedLine.length;
      columnIndex++
    ) {
      // Kreisverkehr: Ab Spalte 3 dürfen Zähldaten nur nicht negative Zahlen enthalten oder müssen leer sein.
      const fieldValue: string = splittedLine[columnIndex].trim();
      if (fieldValue.length >= 0) {
        if (isNaN(Number(fieldValue))) {
          return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nur Nummern enthalten.\nWar: ${splittedLine}`;
        } else if (parseInt(toString(fieldValue)) < 0) {
          return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nicht negativ sein.\nWar: ${splittedLine}`;
        }
      }
    }
    // kein Kreisverkehr
  } else {
    for (let i = 4; i <= 8; i++) {
      // Kreuzung: Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
      if (splittedLine[i].trim().length >= 0) {
        if (isNaN(Number(splittedLine[i].trim()))) {
          return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nur Nummern enthalten.\nWar: ${splittedLine}`;
        } else if (parseInt(toString(splittedLine[i].trim())) < 0) {
          return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nicht negativ sein.\nWar: ${splittedLine}`;
        }
      }
    }
  }

  return "";
}

/**
 * Prüfung der Daten von Fussverkehrszählungen auf Validität.
 *
 * @param csvLineIndex Index der aktuellen Zeile
 * @param armNummer Nummer des aktuellen Knotenarms
 * @param splittedLine Array der Zeilenspalten
 * @return Grund der Invalidität
 */
function checkFussverkehrData(
  csvLineIndex: number,
  armNummer: number,
  splittedLine: Array<string>
): string {
  if (splittedLine[1]) {
    return "Zielknotenarm darf nicht gefüllt sein.";
  }
  if (!splittedLine[2]) {
    if (
      zaehlung.value.zaehlart === Zaehlart.FJS ||
      zaehlung.value.zaehlart === Zaehlart.QJS
    ) {
      return "Strassenseite darf nicht leer sein.";
    }
  } else {
    if (zaehlung.value.zaehlart === Zaehlart.QU && splittedLine[2]) {
      return "Strassenseite muss leer sein.";
    }
  }

  if (
    splittedLine[2] !== Strassenseite.N &&
    splittedLine[2] !== Strassenseite.S &&
    splittedLine[2] !== Strassenseite.W &&
    splittedLine[2] !== Strassenseite.O &&
    splittedLine[2] !== Strassenseite.NO &&
    splittedLine[2] !== Strassenseite.NW &&
    splittedLine[2] !== Strassenseite.SO &&
    splittedLine[2] !== Strassenseite.SW
  ) {
    return `Strassenseite ist ungültig: ${splittedLine[2]}.`;
  }

  if (
    (armNummer === 1 || armNummer === 3) &&
    splittedLine[2] !== Strassenseite.W &&
    splittedLine[2] !== Strassenseite.O
  ) {
    return `Strassenseite ${splittedLine[2]} ist ungültig für Knotenarme 1 und 3.`;
  }

  if (
    (armNummer === 2 || armNummer === 4) &&
    splittedLine[2] !== Strassenseite.N &&
    splittedLine[2] !== Strassenseite.S
  ) {
    return `Strassenseite ${splittedLine[2]} ist ungültig für Knotenarme 2 und 4.`;
  }

  if (
    (armNummer === 5 || armNummer === 7) &&
    splittedLine[2] !== Strassenseite.NW &&
    splittedLine[2] !== Strassenseite.SO
  ) {
    return `Strassenseite ${splittedLine[2]} ist ungültig für Knotenarme 5 und 7.`;
  }

  if (
    (armNummer === 6 || armNummer === 8) &&
    splittedLine[2] !== Strassenseite.NO &&
    splittedLine[2] !== Strassenseite.SW
  ) {
    return `Strassenseite ${splittedLine[2]} ist ungültig für Knotenarme 6 und 8.`;
  }

  if (zaehlung.value.zaehlart === Zaehlart.QU) {
    if (
      splittedLine[3] !== Richtung.N &&
      splittedLine[3] !== Richtung.O &&
      splittedLine[3] !== Richtung.S &&
      splittedLine[3] !== Richtung.W &&
      splittedLine[3] !== Richtung.NO &&
      splittedLine[3] !== Richtung.SO &&
      splittedLine[3] !== Richtung.SW &&
      splittedLine[3] !== Richtung.NW
    ) {
      return `Richtung ${splittedLine[3]} ist ungültig für Zählart ${Zaehlart.QU}.`;
    }
  } else if (zaehlung.value.zaehlart === Zaehlart.FJS) {
    if (splittedLine[3] !== Richtung.EIN && splittedLine[3] !== Richtung.AUS) {
      return `Richtung ${splittedLine[3]} ist ungültig für Zählart ${Zaehlart.FJS}.`;
    }
  } else {
    if (splittedLine[3]) {
      return `Richtung muss leer sein für Zählart ${zaehlung.value.zaehlart}.`;
    }
  }

  if (
    splittedLine[4] ||
    splittedLine[5] ||
    splittedLine[6] ||
    splittedLine[7] ||
    splittedLine[8]
  ) {
    return "Fahrzeugarten sind ungültig für Fussverkehrszählungen.";
  }

  if (!splittedLine[9] && !splittedLine[10]) {
    return "Fussverkehrszähldaten dürfen nicht leer sein.";
  }

  const csvLineNumber: number = csvLineIndex + 1;
  for (let i = 9; i <= 10; i++) {
    // Kreuzung: Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
    if (splittedLine[i].trim().length >= 0) {
      if (isNaN(Number(splittedLine[i].trim()))) {
        return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nur Nummern enthalten.\nWar: ${splittedLine}`;
      } else if (parseInt(toString(splittedLine[i].trim())) < 0) {
        return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nicht negativ sein.\nWar: ${splittedLine}`;
      }
    }
  }

  return "";
}

function onFileSelect() {
  // wenn zu viele Files hochgeladen wurden, dann Abbrechen
  if (
    !isNil(files.value) &&
    files.value.length > zaehlung.value.knotenarme.length
  ) {
    // Damit nacheinander ein File mit identischem Namen hocheladen werden
    // kann, wird immer der FileInput zurückgesetzt
    resetFileInput.value = Math.floor(Math.random() * 10001);
    snackbarStore.showError(
      `Zu viele Dateien`,
      `Es darf pro Knotenarm nur eine Datei hochgeladen werden.`
    );
  } else {
    // Einlesen
    readFiles();
  }
}

/**
 * Methode zum Einlesen der Files.
 */
function readFiles() {
  let successfull = true;
  let errorText = "";
  let itemsProcessed = 0;

  files.value.forEach((myFile) => {
    const fileReader = new FileReader();
    // Eventlistener hinzufügen und angeben, was passieren soll, wenn ein File geladen wurde ('load'-Event)
    fileReader.addEventListener(
      "load",
      function () {
        const csv: Array<string> = (fileReader.result as string).split(
          /\r\n|\n/
        );
        const knotenarmnummerOfCsv: number = getKnotenarmnummerOfCsv(csv);
        if (knotenarmnummerOfCsv === 0) {
          snackbarStore.showError(
            `Die Datei ${myFile.name} konnte keinem Knotenarm zugeordnet werden. Metadaten prüfen`
          );
        }
        itemsProcessed++;
        zaehlung.value.knotenarme.forEach((zaehlungArm: KnotenarmDTO) => {
          if (zaehlungArm.nummer === knotenarmnummerOfCsv) {
            // Plausibilitätscheck
            const isPlausible: string = checkUploadedFiledata(
              knotenarmnummerOfCsv,
              csv
            );
            if (isPlausible.length === 0) {
              zaehlungArm.filename = myFile.name;
              zaehlungArm.filedata = csv;
            } else {
              successfull = false;
              errorText = `${errorText} ${myFile.name}: ${isPlausible}\n`;
            }

            // Wenn alle Files eingelesen wurden, dann zeige das Ergebnis an
            if (itemsProcessed === files.value.length) {
              // Damit nacheinander ein File mit identischem Namen hocheladen werden
              // kann, wird immer der FileInput zurückgesetzt
              resetFileInput.value = Math.floor(Math.random() * 10001);
              if (successfull) {
                snackbarStore.showSuccess(
                  `Alle Dateien konnten einem Knotenarm zugeordnet werden.`
                );
              } else {
                snackbarStore.showError(
                  `Folgende Dateien wurden abgelehnt:`,
                  errorText
                );
              }
            }
          }
        });
      },
      false
    );

    if (myFile) {
      if (wrongFileType(myFile)) {
        snackbarStore.showWarning(
          `Ungültiges Dateiformat.`,
          `Es werden nur CSV-Dateien unterstützt.`
        );
      } else {
        // Das 'load'-Event wird ausgelöst, sobald der FileReader das Laden beendet hat.
        fileReader.readAsText(myFile);
      }
    }
  });
}
</script>
