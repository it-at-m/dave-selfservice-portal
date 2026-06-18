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
            v-if="isNotKreisverkehr && isNotZaehlartFjsOrQu"
            density="compact"
            :headers="verkehrsbeziehungHeader as Array<any>"
            :items="allVerkehrsbeziehungen"
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
import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type GeoPoint from "@/domain/GeoPoint";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { LatLng } from "leaflet";
import { isEmpty, isNil, parseInt, toArray, toString } from "lodash";
import { computed, ref } from "vue";

import LhmTextField from "@/components/common/LhmTextField.vue";
import ZaehlungCardMap from "@/components/map/ZaehlungCardMap.vue";
import ZaehlungGeometrie from "@/components/zaehlung/ZaehlungGeometrie.vue";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { useValidationStore } from "@/store/ValidationStore";
import Status from "@/types/enum/Status";
import Zaehlart from "@/types/enum/Zaehlart";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import KnotenarmComparator from "@/util/KnotenarmComparator";
import { useFussverkehrValidationUtils } from "@/util/validation/FussverkehrValidationUtils";
import { useValidationUtils } from "@/util/validation/ValidationUtils";
import VerkehrsbeziehungComparator from "@/util/VerkehrsbeziehungComparator";

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

const validationStore = useValidationStore();

const validationUtils = useValidationUtils();
const fussverkehrValidationUtils = useFussverkehrValidationUtils();

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

const allVerkehrsbeziehungen = computed<Array<VerkehrsbeziehungDTO>>(() =>
  toArray(zaehlung.value.verkehrsbeziehungen).sort(
    VerkehrsbeziehungComparator.sortByActiveVonAndNach
  )
);

const isNotKreisverkehr = computed<boolean>(() => !zaehlung.value.kreisverkehr);

const isNotZaehlartFjsOrQu = computed<boolean>(() => {
  return !(
    zaehlung.value.zaehlart === Zaehlart.FJS ||
    zaehlung.value.zaehlart === Zaehlart.QU
  );
});

const verkehrsbeziehungHeader = [
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
 * @param filename Name der geprüften Datei
 *
 */
function checkUploadedFiledata(
  armNummer: number,
  csvData: Array<string>,
  filename: string
): string {
  // keine Daten vorhanden
  if (isNil(csvData) || csvData.length < 4) {
    return `Die hochgeladene Datei ${filename} enthält keine Zähldaten.`;
  }
  const metaHeader: string = csvData[0];
  // MetaHeader vorhanden?
  if (isNil(metaHeader)) {
    return `Die Header der Metadaten fehlen in der hochgeladenen Datei ${filename}.`;
  }
  // MetaHeader korrekt?
  if (metaHeader!.trim() !== EXPECTED_META_HEADER) {
    return `Die Header der Metadaten in der hochgeladenen Datei ${filename} sind nicht korrekt.\nErwartet: ${EXPECTED_META_HEADER}`;
  }

  const metaData: string = csvData[1];
  // MetaData vorhanden?
  if (isNil(metaData)) {
    return "Die Metadaten fehlen in der hochgeladenen Datei ${filename}.";
  }
  // MetaData korrekt?
  const expectedMetaData = buildExpectedMetaData(armNummer);
  if (metaData!.trim() !== expectedMetaData) {
    return `Die Metadaten in der hochgeladenen Datei ${filename} sind nicht korrekt.\nErwartet: ${expectedMetaData}`;
  }

  const zaehldatenHeader: string = csvData[2];
  // ZaehldatenHeader vorhanden und korrekt?
  if (isNil(zaehldatenHeader)) {
    return "Die Header der Zähldaten fehlen in der hochgeladenen Datei ${filename}.";
  }
  // ZaehldatenHeader vorhanden und korrekt?
  if (zaehldatenHeader!.trim() !== EXPECTED_ZAEHLDATEN_HEADER) {
    return `Die Header der Zähldaten in der hochgeladenen Datei ${filename} sind nicht korrekt.\nErwartet: ${EXPECTED_ZAEHLDATEN_HEADER}`;
  }

  for (const [csvLineIndex, data] of csvData.entries()) {
    // Prüfung ab Zeile 4 der CSV und für nicht leere Zeilen
    if (csvLineIndex > 2 && data.trim().length > 0) {
      const splittedLine: Array<string> = data.split(SEPARATOR);
      if (splittedLine.length !== COLUMN_COUNT) {
        return `Je Zeile müssen ${COLUMN_COUNT} Spalten in der Datei ${filename} enthalten sein.`;
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
          splittedLine,
          filename
        );
      } else {
        invalidityReason = checkVerkehrsbeziehungData(
          csvLineIndex,
          armNummer,
          splittedLine,
          filename
        );
      }
      if (invalidityReason.length !== 0) {
        return invalidityReason;
      }
    } else {
      // skip Meta and Header
    }
  }

  const csvDataWithoutHeader = csvData.slice(3, csvData.length);

  // Prüfung auf mehrfach vorhandene Intervallnummern
  const identicalIntervallnummer =
    validationUtils.checkForIdenticalIntervallnummerJeBewegungsbeziehung(
      csvDataWithoutHeader
    );
  if (!isEmpty(identicalIntervallnummer)) {
    return identicalIntervallnummer;
  }

  // Prüfung auf die korrekte Anzahl der Intervallnummern entsprechend der Zähldauer
  const zaehldauer = zaehlung.value.zaehldauer;
  const incorrectNumberOfIntervals =
    validationUtils.checkForCorrectNumberOfIntervalsAccordingZaehldauer(
      csvDataWithoutHeader,
      zaehldauer
    );
  if (!isEmpty(incorrectNumberOfIntervals)) {
    return incorrectNumberOfIntervals;
  }

  // Prüfung ob die Intervalle dem Zählzeitraum der Zähldauer entsprechen.
  const incorrectAlgignmentOfIntervals =
    validationUtils.checkForAlignmentOfIntervallsAccordingZaehldauer(
      csvDataWithoutHeader,
      zaehldauer
    );
  if (!isEmpty(incorrectAlgignmentOfIntervals)) {
    return incorrectAlgignmentOfIntervals;
  }

  return "";
}

/**
 * Erstellung der erwarteten Metadaten.
 *
 * @param armNummer Nummer des Knotenarms
 * @return Erwartete Metadaten
 */
function buildExpectedMetaData(armNummer: number): string {
  const metaZaehlart =
    zaehlung.value.zaehlart === Zaehlart.N ? "" : zaehlung.value.zaehlart;
  const expectedMetaDataArray = [
    zaehlung.value.zaehlstelleNummer,
    metaZaehlart,
    zaehlung.value.datum,
    armNummer,
  ];
  // Fülle das Array mit leeren Feldern, bis die Länge den erwarteten Spalten entspricht
  while (expectedMetaDataArray.length < COLUMN_COUNT) {
    expectedMetaDataArray.push("");
  }
  // Erstelle den finalen String
  return expectedMetaDataArray.join(";");
}

/**
 * Prüfung der Verkehrsbeziehungen und Zähldaten.
 *
 * @param csvLineIndex aktueller Zeilenindex
 * @param armNummer Nummer des aktuellen Knotenarms
 * @param splittedLine Array der Zeilenspalten
 * @param filename Name der geprüften Datei
 * @return Grund der Invalidität
 */
function checkVerkehrsbeziehungData(
  csvLineIndex: number,
  armNummer: number,
  splittedLine: Array<string>,
  filename: string
): string {
  const csvLineNumber: number = csvLineIndex + 1;
  if (csvLineIndex > 3) {
    const nach: string = splittedLine[1];
    let verkehrsbeziehung: VerkehrsbeziehungDTO | undefined;
    if (zaehlung.value.kreisverkehr) {
      verkehrsbeziehung = zaehlung.value.verkehrsbeziehungen.find(
        (verkehrsbeziehung) => {
          return (
            verkehrsbeziehung.knotenarm === armNummer &&
            ((nach === "e" && verkehrsbeziehung.hinein) ||
              (nach === "v" && verkehrsbeziehung.vorbei) ||
              (nach === "a" && verkehrsbeziehung.heraus))
          );
        }
      );
      // kein Kreisverkehr
    } else {
      const nachArmNumber: number = parseInt(toString(nach.trim()));
      verkehrsbeziehung = zaehlung.value.verkehrsbeziehungen.find(
        (verkehrsbeziehung) => {
          return (
            armNummer === verkehrsbeziehung.von &&
            nachArmNumber === verkehrsbeziehung.nach
          );
        }
      );
    }
    if (isNil(verkehrsbeziehung)) {
      return `Für die Zähldaten in Zeile ${csvLineNumber} der Datei ${filename} ist keine Verkehrsbeziehung existent oder aktiv.\nWar: ${splittedLine}`;
    }
  }

  if (
    isEmpty(splittedLine[4]) &&
    isEmpty(splittedLine[5]) &&
    isEmpty(splittedLine[6]) &&
    isEmpty(splittedLine[7]) &&
    isEmpty(splittedLine[8])
  ) {
    return `Die Zähldaten in Zeile ${csvLineNumber} in der Datei ${filename} dürfen nicht leer sein.`;
  }

  if (zaehlung.value.kreisverkehr) {
    // e = einfahrend, a = abfahrend und v = vorbeifahrend
    if (
      splittedLine[1] !== "e" &&
      splittedLine[1] !== "v" &&
      splittedLine[1] !== "a"
    ) {
      return `Die 'nach'-Spalte in Zeile ${csvLineNumber} der Datei ${filename} darf nur 'e', 'v' oder 'a' enthalten.\nWar: ${splittedLine}`;
    }
  }

  for (let i = 4; i <= 8; i++) {
    // Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
    if (splittedLine[i].trim().length > 0) {
      if (
        !validationUtils.isWholeNonNegativeIntegerString(splittedLine[i].trim())
      ) {
        return `Die Zähldaten in Zeile ${csvLineNumber} der Datei ${filename} dürfen nur nicht-negative, ganze Zahlen enthalten.\nWar: ${splittedLine}`;
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
 * @param filename Name der geprüften Datei
 * @return Grund der Invalidität
 */
function checkFussverkehrData(
  csvLineIndex: number,
  armNummer: number,
  splittedLine: Array<string>,
  filename: string
): string {
  const zaehlart = zaehlung.value.zaehlart;

  let errorMessage: string | undefined;
  errorMessage = fussverkehrValidationUtils.validateNachOccurrence(
    zaehlart,
    splittedLine[1],
    filename
  );
  if (errorMessage) return errorMessage;

  errorMessage = fussverkehrValidationUtils.validateNachValue(
    armNummer,
    splittedLine[1],
    filename
  );
  if (errorMessage) return errorMessage;

  errorMessage = fussverkehrValidationUtils.validateStrassenseiteOccurrence(
    zaehlart,
    splittedLine[2],
    filename
  );
  if (errorMessage) return errorMessage;

  errorMessage = fussverkehrValidationUtils.validateStrassenseiteValue(
    zaehlart,
    splittedLine[2],
    armNummer,
    filename
  );
  if (errorMessage) return errorMessage;

  errorMessage = fussverkehrValidationUtils.validateRichtungOccurrence(
    zaehlart,
    splittedLine[3],
    filename
  );
  if (errorMessage) return errorMessage;

  errorMessage = fussverkehrValidationUtils.validateZaehlwerteOccurrence(
    splittedLine,
    filename
  );
  if (errorMessage) return errorMessage;

  errorMessage = fussverkehrValidationUtils.validateZaehlwerteValues(
    splittedLine,
    csvLineIndex,
    filename
  );
  if (errorMessage) return errorMessage;

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
 * Prüft, ob die aktuelle Zählung einen Knotenarm mit der übergebenen Knotenarmnummer enthält.
 *
 * @param knotenarmnummer zu prüfende Knotenarmnummer.
 * @returns true, wenn die Knotenarmnummer in der Zählung enthalten ist.
 */
function isKnotenarmnummerInZaehlung(knotenarmnummer: number): boolean {
  return zaehlung.value.knotenarme.some(
    (zaehlungArm: KnotenarmDTO) => zaehlungArm.nummer === knotenarmnummer
  );
}

/**
 * Methode zum Einlesen der Files.
 */
function readFiles() {
  let successfull = true;
  let errorText = "";
  let itemsProcessed = 0;
  const knotenarmeWithUploadedFiles = new Map<number, File>();
  let errorTextKnotenarmnummer = "";

  files.value.forEach((myFile) => {
    if (myFile) {
      if (wrongFileType(myFile)) {
        snackbarStore.showWarning(
          `Ungültiges Dateiformat.`,
          `Es werden nur CSV-Dateien unterstützt.`
        );
      } else {
        const fileReader = new FileReader();

        // Eventlistener hinzufügen und angeben, was passieren soll, wenn ein File geladen wurde ('load'-Event)
        fileReader.addEventListener(
          "load",
          function () {
            const csv: Array<string> = (fileReader.result as string).split(
              /\r\n|\n/
            );
            const knotenarmnummerOfCsv: number = getKnotenarmnummerOfCsv(csv);
            // Plausibilisierung: Kann die Datei einem Knotenarm der Zählung zugeordnet werden?
            if (!isKnotenarmnummerInZaehlung(knotenarmnummerOfCsv)) {
              snackbarStore.showError(
                `Die Datei ${myFile.name} konnte keinem Knotenarm zugeordnet werden. Knotenarmnummer prüfen!`
              );
            } else if (knotenarmeWithUploadedFiles.has(knotenarmnummerOfCsv)) {
              // Plausibilisierung: Wurden mehrere Dateien mit dieser Knotenarmnummer hochgeladen?
              const filename =
                knotenarmeWithUploadedFiles.get(knotenarmnummerOfCsv)?.name ??
                "";

              if (!errorTextKnotenarmnummer.includes(filename)) {
                errorTextKnotenarmnummer = `${errorTextKnotenarmnummer}\n - ${knotenarmeWithUploadedFiles.get(knotenarmnummerOfCsv)?.name}: Knotenarmnummer ${knotenarmnummerOfCsv}\n`;
              }
              errorTextKnotenarmnummer = `${errorTextKnotenarmnummer}\n - ${myFile.name}: Knotenarmnummer ${knotenarmnummerOfCsv}\n`;

              snackbarStore.showError(
                `Mehrere Dateien enthalten die gleiche Knotenarmnummer:`,
                errorTextKnotenarmnummer
              );
            } else {
              knotenarmeWithUploadedFiles.set(knotenarmnummerOfCsv, myFile);

              itemsProcessed++;
              zaehlung.value.knotenarme.forEach((zaehlungArm: KnotenarmDTO) => {
                if (zaehlungArm.nummer === knotenarmnummerOfCsv) {
                  // Plausibilitätscheck
                  const errorMessage: string = checkUploadedFiledata(
                    knotenarmnummerOfCsv,
                    csv,
                    myFile.name
                  );

                  const isUploadedFileForKnotenarmPlausible =
                    errorMessage.length === 0;
                  validationStore.setValidationStatusForKnotenarm(
                    zaehlungArm,
                    isUploadedFileForKnotenarmPlausible
                  );

                  if (isUploadedFileForKnotenarmPlausible) {
                    zaehlungArm.filename = myFile.name;
                    zaehlungArm.filedata = csv;
                  } else {
                    successfull = false;
                    errorText = `${errorText} ${myFile.name}: ${errorMessage}\n`;
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
            }
          },
          false
        );

        // Das 'load'-Event wird ausgelöst, sobald der FileReader das Laden beendet hat.
        fileReader.readAsText(myFile);
      }
    }
  });
}
</script>
