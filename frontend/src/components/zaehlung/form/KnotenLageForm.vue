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
          cols="12"
          md="10"
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
          cols="12"
          md="2"
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
          cols="12"
          md="10"
        >
          <v-row
            dense
            no-gutters
          >
            <v-col
              cols="12"
              md="2"
            >
              <lhm-text-field
                caption="Kreisverkehr"
                :text="kreisverkehrText"
              />
            </v-col>
            <v-col
              cols="12"
              md="8"
            >
              <lhm-text-field
                caption="Kreuzungsname"
                :text="zaehlung.kreuzungsname"
              />
            </v-col>
            <v-col
              v-if="isZaehlungEditable"
              cols="12"
              md="2"
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
          >
            <v-col
              cols="12"
              md="6"
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
              md="5"
            >
              <v-text-field
                v-model="arm.filename"
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
        <v-spacer />
        <v-col
          cols="12"
          md="2"
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
import Status from "@/types/enum/Status";
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
  "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;";

const EXPECTED_ZAEHLDATEN_HEADER =
  "Intervallnummer;nach;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss";

const SEPARATOR = ";";

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
 *      Zählstellennummer;Zählart;Datum;Knotenarmnummer;
 * Zeile 2:
 *      Wert;Wert oder leer;Wert;Wert;
 * Zeile 3:
 *      Intervallnummer;nach;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss;
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
    // Prüfung ab Zeile 3 der CSV und für nicht leere Zeilen
    if (csvLineIndex > 2 && data.trim().length > 0) {
      const csvLineNumber: number = csvLineIndex + 1;
      const splittedLine: Array<string> = data.split(SEPARATOR);
      if (splittedLine.length !== 9) {
        return `Je Zeile müssen 9 Spalten enthalten sein.`;
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

      // Prüfung der Knotenarme in Zähldaten auf Übereinstimmung mit vorhandenen Fahrbeziehungen
      if (csvLineIndex > 3) {
        const nach: string = splittedLine[1];
        let fahrbeziehung: FahrbeziehungDTO | undefined;
        if (zaehlung.value.kreisverkehr) {
          fahrbeziehung = zaehlung.value.fahrbeziehungen.find(
            (fahrbeziehung) => {
              return (
                fahrbeziehung.knotenarm === armNummer &&
                ((nach === "e" && fahrbeziehung.hinein) ||
                  (nach === "v" && fahrbeziehung.vorbei) ||
                  (nach === "a" && fahrbeziehung.heraus))
              );
            }
          );
        } else {
          const nachArmNumber: number = parseInt(toString(nach.trim()));
          fahrbeziehung = zaehlung.value.fahrbeziehungen.find(
            (fahrbeziehung) => {
              return (
                armNummer === fahrbeziehung.von &&
                nachArmNumber === fahrbeziehung.nach
              );
            }
          );
        }
        if (isNil(fahrbeziehung)) {
          return `Für die Zähldaten in Zeile ${csvLineNumber} ist keine Fahrbeziehung existent oder aktiv.\nWar: ${splittedLine}`;
        }
      }

      // Prüfung der Zähldaten auf Korrektheit
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
      } else {
        for (const fieldValue of splittedLine) {
          // Kreuzung: Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
          if (fieldValue.trim().length >= 0) {
            if (isNaN(Number(fieldValue.trim()))) {
              return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nur Nummern enthalten.\nWar: ${splittedLine}`;
            } else if (parseInt(toString(fieldValue.trim())) < 0) {
              return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nicht negativ sein.\nWar: ${splittedLine}`;
            }
          }
        }
      }
    } else {
      // skip Meta and Header
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
