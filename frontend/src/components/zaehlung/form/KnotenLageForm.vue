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
          cols="6"
          sm="9"
        >
          <zaehlung-card-map
            height="100%"
            width="100%"
            :lat-lng-zaehlstelle="coordsZaehlstelle"
            :lat-lng-zaehlung="coordsZaehlung"
            :edit-zaehlung-marker="false"
          />
        </v-col>
        <v-col
          cols="6"
          sm="3"
        >
          <verkehr-form
            v-model:zaehlung="zaehlung"
            height="100%"
            width="100%"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="6"
          sm="9"
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
                  @update:model-value="handleCsvFileSelection()"
                />
              </v-form>
            </v-col>
            <v-spacer />
          </v-row>
          <v-row
            v-for="arm in relevantKnotenarme"
            :key="arm.nummer"
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
          cols="6"
          sm="3"
        >
          <v-data-table
            v-if="isNotKreisverkehr"
            density="compact"
            :headers="bewegungsbeziehungenHeader"
            :items="bewegungsbeziehungen"
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
import type {
  ExternalKnotenarmDTO,
  ExternalLaengsverkehrDTO,
  ExternalQuerungsverkehrDTO,
  ExternalVerkehrsbeziehungDTO,
  ExternalZaehlungDTO,
} from "@/api/client";

import { LatLng } from "leaflet";
import { isEmpty, isNil, parseInt, toArray } from "lodash";
import { computed, ref } from "vue";

import { Status, Zaehlart } from "@/api/client";
import LhmTextField from "@/components/common/LhmTextField.vue";
import ZaehlungCardMap from "@/components/map/ZaehlungCardMap.vue";
import VerkehrForm from "@/components/zaehlung/form/verkehrsbeziehungen/VerkehrForm.vue";
import { useKnotenarmFileStore } from "@/store/KnotenarmFileStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { useValidationStore } from "@/store/ValidationStore";
import UploadedFileStatus from "@/types/enum/UploadedFileStatus";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import KnotenarmComparator from "@/util/KnotenarmComparator";
import { useFussverkehrValidationUtils } from "@/util/validation/FussverkehrValidationUtils";
import { useKfzVerkehrValidationUtils } from "@/util/validation/KfzVerkehrValidationUtils";
import { useValidationUtils } from "@/util/validation/ValidationUtils";
import VerkehrsbeziehungComparator from "@/util/VerkehrsbeziehungComparator";

interface Props {
  height: string;
}

defineProps<Props>();

const zaehlung = defineModel<ExternalZaehlungDTO>({
  required: true,
});

const validationUtils = useValidationUtils();

const SEPARATOR = validationUtils.SEPARATOR;

const FILE_INPUT_FIELD_ID = "fileInputField";

const snackbarStore = useSnackbarStore();

const validationStore = useValidationStore();
const knotenarmFileStore = useKnotenarmFileStore();

const fussverkehrValidationUtils = useFussverkehrValidationUtils();
const kfzVerkehrValidationUtils = useKfzVerkehrValidationUtils();

const resetFileInput = ref<number>(0);

const files = ref<Array<File>>([]);

const relevantKnotenarme = computed<Array<ExternalKnotenarmDTO>>(() => {
  const knotenarme = validationUtils.getRelevantKnotenarmeForFileUpload(
    zaehlung.value
  );
  return knotenarme.sort(KnotenarmComparator.sortByNumber);
});

const kreisverkehrText = computed<string>(() =>
  zaehlung.value.kreisverkehr ? "Ja" : "Nein"
);

const uploadIcon = computed<string>(() =>
  isZaehlungEditable.value ? "mdi-upload" : ""
);

const coordsZaehlstelle = computed<LatLng>(() => {
  const punkt = zaehlung.value.zaehlstellePunkt;
  if (punkt?.lat != null && punkt.lon != null) {
    return new LatLng(punkt.lat, punkt.lon);
  } else {
    return DefaultObjectCreator.createCenterOfMunichLatLng();
  }
});

const coordsZaehlung = computed<LatLng>(() => {
  const punkt = zaehlung.value.punkt;
  if (punkt?.lat != null && punkt.lon != null) {
    return new LatLng(punkt.lat, punkt.lon);
  } else {
    return coordsZaehlstelle.value;
  }
});

const isZaehlungEditable = computed<boolean>(() => {
  return (
    zaehlung.value.status === Status.Counting ||
    zaehlung.value.status === Status.Correction
  );
});

const bewegungsbeziehungen = computed<
  Array<
    | ExternalVerkehrsbeziehungDTO
    | ExternalQuerungsverkehrDTO
    | ExternalLaengsverkehrDTO
  >
>(() => {
  const zaehlart = zaehlung.value?.zaehlart;

  let source:
    | Array<ExternalVerkehrsbeziehungDTO>
    | Array<ExternalQuerungsverkehrDTO>
    | Array<ExternalLaengsverkehrDTO>
    | undefined;

  if (zaehlart === Zaehlart.Qu) {
    source = zaehlung.value?.querungsverkehr as
      | Array<ExternalQuerungsverkehrDTO>
      | undefined;
  } else if (zaehlart === Zaehlart.Fjs) {
    source = zaehlung.value?.laengsverkehr as
      | Array<ExternalLaengsverkehrDTO>
      | undefined;
  } else {
    source = zaehlung.value?.verkehrsbeziehungen as
      | Array<ExternalVerkehrsbeziehungDTO>
      | undefined;
  }
  // toArray sorgt dafür, dass undefined/null in [] umgewandelt werden,
  // anschließend sortieren
  return zaehlart === Zaehlart.Qu || zaehlart === Zaehlart.Fjs
    ? toArray(source).sort(
        VerkehrsbeziehungComparator.sortLaengsUndQuerungByNumber
      )
    : toArray(source).sort(VerkehrsbeziehungComparator.sortByVonAndNach);
});

const isNotKreisverkehr = computed<boolean>(() => !zaehlung.value.kreisverkehr);

// Dynamische Header basierend auf der Zählart
const bewegungsbeziehungenHeader = computed<Array<any>>(() => {
  const zaehlart = zaehlung.value.zaehlart;

  // Header für QjS (Querschnitt je Strassenseite)
  if (zaehlart === Zaehlart.Qjs) {
    return [
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
      {
        title: "Str.s",
        align: "center",
        sortable: false,
        value: "strassenseite",
      },
    ];
  }

  // Header für FjS (Fußgänger/Rad je Strassenseite)
  if (zaehlart === Zaehlart.Fjs) {
    return [
      {
        title: "Von",
        align: "center",
        sortable: false,
        value: "knotenarm",
        lastFixed: true,
      },
      {
        title: "Str.s",
        align: "center",
        sortable: false,
        value: "strassenseite",
      },
      {
        title: "Ri",
        align: "center",
        sortable: false,
        value: "richtung",
      },
    ];
  }

  // Header für Qu (Fußgänger/Rad Querungen)
  if (zaehlart === Zaehlart.Qu) {
    return [
      {
        title: "Von",
        align: "center",
        sortable: false,
        value: "knotenarm",
        lastFixed: true,
      },
      {
        title: "Ri",
        align: "center",
        sortable: false,
        value: "richtung",
      },
    ];
  }

  // Andere Zählarten
  return [
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
});

function fileUpload(): void {
  if (isZaehlungEditable.value) {
    document.getElementById(FILE_INPUT_FIELD_ID)?.click();
  }
}

function getStyle(arm: ExternalKnotenarmDTO): string {
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
  validationStore.uploadedFilesChanged = true;
  relevantKnotenarme.value.forEach((arm: ExternalKnotenarmDTO) => {
    if (arm.nummer === nummer) {
      validationStore.setUploadedFileStatus(arm, UploadedFileStatus.MISSING);
      arm.filename = "";
      knotenarmFileStore.deleteFiledata(arm.nummer);
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
  const hasDataMsg = validationUtils.hasAtLeastFourLinesOfData(csvData);
  if (hasDataMsg.length > 0) {
    return hasDataMsg;
  }

  const hasMetaHeader = validationUtils.hasMetadatenHeader(csvData);
  if (hasMetaHeader.length > 0) {
    return hasMetaHeader;
  }

  const hasCorrectMetaHeader =
    validationUtils.hasCorrectMetadatenHeader(csvData);
  if (hasCorrectMetaHeader.length > 0) {
    return hasCorrectMetaHeader;
  }

  const hasMetadata = validationUtils.hasMetadata(csvData);
  if (hasMetadata.length > 0) {
    return hasMetadata;
  }

  const hasCorrectMetadata = validationUtils.hasCorrectMetadata(
    csvData,
    armNummer,
    zaehlung.value
  );
  if (hasCorrectMetadata.length > 0) {
    return hasCorrectMetadata;
  }

  const zaehldatenHeader = validationUtils.hasZaehldatenHeader(csvData);
  if (zaehldatenHeader.length > 0) {
    return zaehldatenHeader;
  }

  const correctZaehldatenHeader =
    validationUtils.hasCorrectZaehldatenHeader(csvData);
  if (correctZaehldatenHeader.length > 0) {
    return correctZaehldatenHeader;
  }

  for (const [csvLineIndex, data] of csvData.entries()) {
    // Prüfung ab Zeile 4 der CSV und für nicht leere Zeilen
    if (csvLineIndex > 2 && data.trim().length > 0) {
      const splittedLine: Array<string> = data.split(SEPARATOR);

      // Prüfen auf korrekte Anzahl an Spalten.
      const hasCorrectNumberOfColumns =
        validationUtils.hasCsvDataLineCorrectNumberOfColumns(splittedLine);
      if (!isEmpty(hasCorrectNumberOfColumns)) {
        return hasCorrectNumberOfColumns;
      }

      const isIntervallnummerSet =
        validationUtils.isIntervallnummerSetInCsvDataLine(splittedLine);
      if (!isEmpty(isIntervallnummerSet)) {
        return enrichValidationErrorMessage(
          isIntervallnummerSet,
          splittedLine,
          csvLineIndex,
          filename
        );
      }

      const zaehlwerteWithValidFormat =
        validationUtils.validateZaehlwerteValues(splittedLine);
      if (!isEmpty(zaehlwerteWithValidFormat)) {
        return enrichValidationErrorMessage(
          zaehlwerteWithValidFormat,
          splittedLine,
          csvLineIndex,
          filename
        );
      }

      // Unterscheidung zw. Fussverkehrszählung und anderen Zählungen
      let invalidityReason: string;
      if (
        zaehlung.value.zaehlart === Zaehlart.Qjs ||
        zaehlung.value.zaehlart === Zaehlart.Fjs ||
        zaehlung.value.zaehlart === Zaehlart.Qu
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

  // Prüfen ob für die in der beauftragten Zählung angeforderten Richtungsinformationen Intervalle existieren.
  const intervallsWithRequiredRichtungsinformationAreExistent =
    validateIntervallsWithRequiredRichtungsinformationAreExistent(
      armNummer,
      csvDataWithoutHeader,
      zaehlung.value
    );
  if (!isEmpty(intervallsWithRequiredRichtungsinformationAreExistent)) {
    return intervallsWithRequiredRichtungsinformationAreExistent;
  }

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
  // Metadaten überspringen
  if (csvLineIndex < 3) {
    return "";
  }

  let errorMessage: string | undefined;

  let columnName =
    validationUtils.EXPECTED_ZAEHLDATEN_HEADER.split(SEPARATOR)[2];
  errorMessage = validationUtils.validateIsColumnValueEmpty(
    splittedLine[2],
    columnName
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  columnName = validationUtils.EXPECTED_ZAEHLDATEN_HEADER.split(SEPARATOR)[3];
  errorMessage = validationUtils.validateIsColumnValueEmpty(
    splittedLine[3],
    columnName
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  if (zaehlung.value.kreisverkehr) {
    errorMessage = kfzVerkehrValidationUtils.validateNachValueForKreisverkehr(
      splittedLine[1]
    );
    if (errorMessage)
      return enrichValidationErrorMessage(
        errorMessage,
        splittedLine,
        csvLineIndex,
        filename
      );

    errorMessage =
      kfzVerkehrValidationUtils.validateVerkehrsbeziehungForKreisverkehr(
        zaehlung.value.verkehrsbeziehungen,
        armNummer,
        splittedLine[1]
      );
  } else {
    errorMessage = kfzVerkehrValidationUtils.validateNachValueForKreuzung(
      zaehlung.value.verkehrsbeziehungen,
      armNummer,
      splittedLine[1]
    );
  }
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  errorMessage =
    kfzVerkehrValidationUtils.validateStrassenseiteRichtungOccurrence(
      splittedLine[2]
    );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  errorMessage = validationUtils.validateZaehlwerteOccurrence(
    zaehlung.value.kategorien,
    splittedLine
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

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
  // Metadaten überspringen
  if (csvLineIndex < 3) {
    return "";
  }

  const zaehlart = zaehlung.value.zaehlart;

  let errorMessage: string | undefined;
  errorMessage = fussverkehrValidationUtils.validateNachOccurrence(
    zaehlart,
    splittedLine[1]
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  if (Zaehlart.Qjs === zaehlart) {
    errorMessage = fussverkehrValidationUtils.validateNachValue(
      armNummer,
      splittedLine[1]
    );
    if (errorMessage)
      return enrichValidationErrorMessage(
        errorMessage,
        splittedLine,
        csvLineIndex,
        filename
      );
  }

  errorMessage = fussverkehrValidationUtils.validateStrassenseiteOccurrence(
    zaehlart,
    splittedLine[2]
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  errorMessage = fussverkehrValidationUtils.validateStrassenseiteValue(
    zaehlart,
    splittedLine[2],
    armNummer
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  errorMessage = fussverkehrValidationUtils.validateRichtungOccurrence(
    zaehlart,
    splittedLine[3]
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  errorMessage = fussverkehrValidationUtils.validateRichtungValue(
    zaehlart,
    armNummer,
    splittedLine[3]
  );
  if (errorMessage)
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  errorMessage = validationUtils.validateZaehlwerteOccurrence(
    zaehlung.value.kategorien,
    splittedLine
  );
  if (!isEmpty(errorMessage))
    return enrichValidationErrorMessage(
      errorMessage,
      splittedLine,
      csvLineIndex,
      filename
    );

  return "";
}

/**
 * Prüft, ob in der CSV-Datei für den Knotenarm die Intervalle entsprechend der angeforderten Richtungsinformation
 * und nicht beauftragte Intervalle vorhanden sind.
 *
 * @param armNummer des Knotenarms
 * @param csvDataWithoutHeader zum prüfen.
 * @param zaehlung für die angeforderten Richtungsinformationen.
 */
function validateIntervallsWithRequiredRichtungsinformationAreExistent(
  armNummer: number,
  csvDataWithoutHeader: Array<string>,
  zaehlung: ExternalZaehlungDTO
): string {
  if (zaehlung.zaehlart === Zaehlart.Qjs) {
    const nachAndStrassenseiteIntervallsAreExistent =
      fussverkehrValidationUtils.validateRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
        armNummer,
        csvDataWithoutHeader,
        zaehlung.verkehrsbeziehungen
      );
    if (!isEmpty(nachAndStrassenseiteIntervallsAreExistent)) {
      return nachAndStrassenseiteIntervallsAreExistent;
    }

    const toMuchNachAndStrassenseiteIntervallsAreExistent =
      fussverkehrValidationUtils.validateNonRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
        armNummer,
        csvDataWithoutHeader,
        zaehlung.verkehrsbeziehungen
      );
    if (!isEmpty(toMuchNachAndStrassenseiteIntervallsAreExistent)) {
      return toMuchNachAndStrassenseiteIntervallsAreExistent;
    }
  } else if (zaehlung.zaehlart === Zaehlart.Fjs) {
    const strassenseiteAndRichtungIntervallsAreExistent =
      fussverkehrValidationUtils.validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
        armNummer,
        csvDataWithoutHeader,
        zaehlung.laengsverkehr
      );
    if (!isEmpty(strassenseiteAndRichtungIntervallsAreExistent)) {
      return strassenseiteAndRichtungIntervallsAreExistent;
    }

    const toMuchStrassenseiteAndRichtungIntervallsAreExistent =
      fussverkehrValidationUtils.validateNonRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
        armNummer,
        csvDataWithoutHeader,
        zaehlung.laengsverkehr
      );
    if (!isEmpty(toMuchStrassenseiteAndRichtungIntervallsAreExistent)) {
      return toMuchStrassenseiteAndRichtungIntervallsAreExistent;
    }
  } else if (zaehlung.zaehlart === Zaehlart.Qu) {
    const richtungIntervallsAreExistent =
      fussverkehrValidationUtils.validateRequiredRichtungIntervallsForQuAreExistent(
        armNummer,
        csvDataWithoutHeader,
        zaehlung.querungsverkehr
      );
    if (!isEmpty(richtungIntervallsAreExistent)) {
      return richtungIntervallsAreExistent;
    }

    const toMuchRichtungIntervallsAreExistent =
      fussverkehrValidationUtils.validateNonRequiredRichtungIntervallsForQuAreExistent(
        armNummer,
        csvDataWithoutHeader,
        zaehlung.querungsverkehr
      );
    if (!isEmpty(toMuchRichtungIntervallsAreExistent)) {
      return toMuchRichtungIntervallsAreExistent;
    }
  } else {
    // KFZ-Verkehr
    if (zaehlung.kreisverkehr) {
      const nachIntervallsAreExistent =
        kfzVerkehrValidationUtils.validateRequiredNachIntervallsAreExistentForKreisverkehr(
          armNummer,
          csvDataWithoutHeader,
          zaehlung.verkehrsbeziehungen
        );
      if (!isEmpty(nachIntervallsAreExistent)) {
        return nachIntervallsAreExistent;
      }

      const toMuchNachIntervallsAreExistent =
        kfzVerkehrValidationUtils.validateNonRequiredNachIntervallsAreExistentForKreisverkehr(
          armNummer,
          csvDataWithoutHeader,
          zaehlung.verkehrsbeziehungen
        );
      if (!isEmpty(toMuchNachIntervallsAreExistent)) {
        return toMuchNachIntervallsAreExistent;
      }
    } else {
      const nachIntervallsAreExistent =
        kfzVerkehrValidationUtils.validateRequiredNachIntervallsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          zaehlung.verkehrsbeziehungen
        );
      if (!isEmpty(nachIntervallsAreExistent)) {
        return nachIntervallsAreExistent;
      }

      const toMuchNachIntervallsAreExistent =
        kfzVerkehrValidationUtils.validateNonRequiredNachIntervallsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          zaehlung.verkehrsbeziehungen
        );
      if (!isEmpty(toMuchNachIntervallsAreExistent)) {
        return toMuchNachIntervallsAreExistent;
      }
    }
  }
  return "";
}

/**
 * Verarbeitet die Auswahl der CSV-Dateien.
 * Zeigt bei zu vielen Dateien eine Fehlermeldung an.
 * Startet andernfalls das Einlesen und Validieren der ausgewählten Dateien.
 */
function handleCsvFileSelection() {
  // wenn zu viele Files hochgeladen wurden, dann Abbrechen
  if (
    !isNil(files.value) &&
    files.value.length > relevantKnotenarme.value.length
  ) {
    // Damit nacheinander ein File mit identischen Namen hochgeladen werden
    // kann, wird der FileInput immer zurückgesetzt
    resetFileInput.value = Math.floor(Math.random() * 10001);
    snackbarStore.showError(
      `Zu viele Dateien`,
      `Je hochzuladenden Knotenarm ist exakt eine Datei erforderlich.`
    );
  } else {
    // Einlesen
    readAndValidateUploadedCsvFiles();
  }
}

/**
 * Prüft, ob der Knotenarm mit der angegebenen Nummer für den CSV-Upload der aktuellen Zählung relevant ist.
 *
 * @param knotenarmnummer Nummer des zu prüfenden Knotenarms.
 * @returns true, wenn der Knotenarm für den CSV-Upload relevant ist, andernfalls false.
 */
function isKnotenarmRelevantForFileUpload(knotenarmnummer: number): boolean {
  return relevantKnotenarme.value.some(
    (zaehlungArm: ExternalKnotenarmDTO) =>
      zaehlungArm.nummer === knotenarmnummer
  );
}

/**
 * Liest die ausgewählten CSV-Dateien ein und ordnet sie den relevanten Knotenarmen zu.
 * Prüft die CSV-Daten und speichert den Dateinamen am Knotenarm sowie Dateiinhalt und Validierungsstatus in den Stores.
 * Zeigt Erfolgs- oder Fehlermeldungen an.
 */
function readAndValidateUploadedCsvFiles() {
  const filedataByKnotenarm = knotenarmFileStore.filedataByKnotenarm;
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

        validationStore.startUploadedFileRead();

        // Eventlistener hinzufügen und angeben, was passieren soll, wenn ein File geladen wurde ('load'-Event)
        fileReader.addEventListener(
          "load",
          function () {
            // Nach einem Dialogwechsel dürfen ausstehende Uploads keine Daten mehr ändern.
            if (
              filedataByKnotenarm !== knotenarmFileStore.filedataByKnotenarm
            ) {
              return;
            }
            try {
              const csv: Array<string> = (fileReader.result as string).split(
                /\r\n|\n/
              );
              const knotenarmnummerOfCsv: number = getKnotenarmnummerOfCsv(csv);
              // Plausibilisierung: Kann die Datei einem Knotenarm der Zählung zugeordnet werden?
              if (!isKnotenarmRelevantForFileUpload(knotenarmnummerOfCsv)) {
                snackbarStore.showError(
                  `Die Datei ${myFile.name} konnte keinem Knotenarm zugeordnet werden. Knotenarmnummer prüfen!`
                );
              } else if (
                knotenarmeWithUploadedFiles.has(knotenarmnummerOfCsv)
              ) {
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
                validationStore.uploadedFilesChanged = true;

                itemsProcessed++;
                relevantKnotenarme.value.forEach(
                  (zaehlungArm: ExternalKnotenarmDTO) => {
                    if (zaehlungArm.nummer === knotenarmnummerOfCsv) {
                      // Plausibilitätscheck
                      const errorMessage: string = checkUploadedFiledata(
                        knotenarmnummerOfCsv,
                        csv,
                        myFile.name
                      );

                      const isUploadedFileForKnotenarmPlausible =
                        errorMessage.length === 0;
                      validationStore.setUploadedFileStatus(
                        zaehlungArm,
                        isUploadedFileForKnotenarmPlausible
                          ? UploadedFileStatus.VALID
                          : UploadedFileStatus.INVALID
                      );

                      zaehlungArm.filename = myFile.name;
                      knotenarmFileStore.setFiledata(zaehlungArm.nummer, csv);

                      if (!isUploadedFileForKnotenarmPlausible) {
                        successfull = false;
                        errorText = `${errorText} ${myFile.name}: ${errorMessage}\n`;
                      }

                      // Wenn alle Files eingelesen wurden, dann zeige das Ergebnis an
                      if (itemsProcessed === files.value.length) {
                        // Damit nacheinander ein File mit identischem Namen hocheladen werden
                        // kann, wird immer der FileInput zurückgesetzt
                        resetFileInput.value = Math.floor(
                          Math.random() * 10001
                        );
                        // wenn zu wenig Files hochgeladen wurden, dann Abbrechen
                        const knotenarmWithoutFile =
                          validationUtils.hasAnyRelevantKnotenarmNoFile(
                            zaehlung.value
                          );
                        if (!isNil(files.value) && knotenarmWithoutFile) {
                          snackbarStore.showError(
                            `Zu wenig Dateien`,
                            `Es muss pro Knotenarm genau eine Datei hochgeladen werden.`
                          );
                        } else {
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
                    }
                  }
                );
              }
            } finally {
              validationStore.finishUploadedFileRead();
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

function enrichValidationErrorMessage(
  errorMessage: string,
  splittedLine: Array<string>,
  csvLineIndex: number,
  filename: string
) {
  return `${errorMessage}\nWar: ${splittedLine}\nZeile: ${csvLineIndex + 1}\nDatei: ${filename}`;
}
</script>
