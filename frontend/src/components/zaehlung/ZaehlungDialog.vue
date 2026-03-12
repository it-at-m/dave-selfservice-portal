<template>
  <v-dialog
    v-model="showDialog"
    persistent
    :fullscreen="mobile"
  >
    <v-card
      width="100%"
      variant="flat"
    >
      <v-card-title>
        <v-icon
          end
          icon="mdi-calendar-edit"
        />
        {{ dialogtitle }}
      </v-card-title>

      <v-card-text class="py-0">
        <zaehlung-form v-model="zaehlung" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          text="Speichern"
          variant="elevated"
          @click="save()"
        />
        <v-btn
          color="grey-lighten-1"
          variant="elevated"
          text="Abbrechen"
          @click="cancel()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type { StartUhrzeitEndeUhrzeit } from "@/types/enum/Intervallnummern";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type LaengsverkehrDTO from "@/types/zaehlung/LaengsverkehrDTO";
import type QuerungsverkehrDTO from "@/types/zaehlung/QuerungsverkehrDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { computed, watch } from "vue";
import { useDisplay } from "vuetify";

import { ApiError } from "@/api/error";
import ZaehlungService from "@/api/service/ZaehlungService";
import ZaehlungForm from "@/components/zaehlung/form/ZaehlungForm.vue";
import { useEventbusStore } from "@/store/EventbusStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { intervallnummern } from "@/types/enum/Intervallnummern";
import Status from "@/types/enum/Status";
import Zaehlart from "@/types/enum/Zaehlart";

interface Props {
  showDialog: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "saved"): void;
  (e: "close-dialog"): void;
}>();

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const SEPARATOR = ";";

const { mobile } = useDisplay();
const eventbusStore = useEventbusStore();
const snackbarStore = useSnackbarStore();

watch(
  () => props.showDialog,
  () => {
    eventbusStore.setResetFormEvent();
  }
);

const showDialog = computed<boolean>(() => props.showDialog);

const dialogtitle = computed<string>(() => {
  let dialogtitleText = "anzeigen";
  if (zaehlung.value.status === Status.CORRECTION) {
    dialogtitleText = "korrigieren";
  } else if (zaehlung.value.status === Status.COUNTING) {
    dialogtitleText = "bearbeiten";
  }
  return `${zaehlung.value.zaehlstelleNummer} - Zählung ${dialogtitleText}`;
});

function save(): void {
  const zaehlart = zaehlung.value.zaehlart;

  if (zaehlart === Zaehlart.FJS) {
    prepareForSaveZaehlungFJS();
  } else if (zaehlart === Zaehlart.QU) {
    prepareForSaveZaehlungQU();
  } else {
    prepareForSaveZaehlung();
  }

  ZaehlungService.saveZaehlung(zaehlung.value)
    .then(() => {
      snackbarStore.showSuccess("Die Zählung wurde aktualisiert.");
      emits("saved");
    })
    .catch((error: ApiError) => {
      snackbarStore.showApiError(error);
    })
    .finally(() => {
      eventbusStore.setResetFormEvent();
    });
}

/**
 * Bereitet die tiefen Kopie auf das Speichern vor.
 * D.h. es werden die CSV-Files in Zeitintervall-Objekte umgewandelt
 * und den Verkehrsbeziehungen zu geordnet. Für alle Zählarten außer FJS und QU.
 */
function prepareForSaveZaehlung() {
  //[verkehrsbeziehung][strassenseite][zeitintervalle]
  const zeitintervalleProStrassenseiteProVerkehrsbeziehung: Map<
    string,
    Map<string, Array<ZeitintervallDTO>>
  > = new Map<string, Map<string, Array<ZeitintervallDTO>>>();

  zaehlung.value.knotenarme.forEach((arm: KnotenarmDTO) => {
    if (arm.filename && arm.filedata && arm.filedata.length > 0) {
      transformCsvDataToVerkehrsbeziehung(arm).forEach((value, key) => {
        zeitintervalleProStrassenseiteProVerkehrsbeziehung.set(key, value);
      });
    }
  });

  zaehlung.value.verkehrsbeziehungen.forEach((fz: VerkehrsbeziehungDTO) => {
    const key: string = getKeyOfVerkehrsbeziehung(
      fz,
      zaehlung.value.kreisverkehr
    );
    if (zeitintervalleProStrassenseiteProVerkehrsbeziehung.has(key)) {
      const zeitintervalleProStrassenseite: Map<
        string,
        Array<ZeitintervallDTO>
      > = zeitintervalleProStrassenseiteProVerkehrsbeziehung.get(key)!;
      if (zeitintervalleProStrassenseite.has(fz.strassenseite)) {
        fz.zeitintervalle = zeitintervalleProStrassenseite.get(
          fz.strassenseite.toString()
        )!;
      }
    }
    fz.isKreuzung = !zaehlung.value.kreisverkehr;
  });
}

/**
 * Diese Funktion bereitet die FJS-Daten für die Speicherung vor.
 *
 */
function prepareForSaveZaehlungFJS() {
  // Map[knotenarmnr][richtung][strassenseite][zeitintervalle]
  const zeitintervalleProStrassenseiteProRichtungProKnotenarm: Map<
    string,
    Map<string, Map<string, Array<ZeitintervallDTO>>>
  > = new Map<string, Map<string, Map<string, Array<ZeitintervallDTO>>>>();

  zaehlung.value.knotenarme.forEach((knotenarm: KnotenarmDTO) => {
    if (
      knotenarm.filename &&
      knotenarm.filedata &&
      knotenarm.filedata.length > 0
    ) {
      const knotenarmNr: string =
        removeCsvHeaderAndRetrieveKnotenarmNr(knotenarm);

      // Alle weiteren Zeilen enthalten Zähldaten
      knotenarm.filedata.forEach((line: string) => {
        if (line.trim().length === 0) {
          // skip Leerzeilen
        } else {
          const values: Array<string> = line.split(SEPARATOR);

          const intervall: ZeitintervallDTO =
            createZeitinvervallFromIntervallNr(values[0]);

          if (values[9].trim().length > 0) {
            intervall.fahrradfahrer = parseInt(values[9]);
          }

          if (values[10].trim().length > 0) {
            intervall.fussgaenger = parseInt(values[10]);
          }

          // Straßenseite auslesen
          let strassenseite: string = {} as string;
          if (values[2].trim().length > 0) {
            strassenseite = values[2];
          }

          // Himmelsrichtung auslesen
          let richtung: string = {} as string;
          if (values[3].trim().length > 0) {
            richtung = values[3];
          }

          if (
            !zeitintervalleProStrassenseiteProRichtungProKnotenarm.has(
              knotenarmNr
            )
          ) {
            zeitintervalleProStrassenseiteProRichtungProKnotenarm.set(
              knotenarmNr,
              new Map<string, Map<string, Array<ZeitintervallDTO>>>()
            );
          }
          if (
            !zeitintervalleProStrassenseiteProRichtungProKnotenarm
              .get(knotenarmNr)!
              .has(richtung)
          ) {
            zeitintervalleProStrassenseiteProRichtungProKnotenarm
              .get(knotenarmNr)!
              .set(richtung, new Map<string, Array<ZeitintervallDTO>>());
          }
          if (
            !zeitintervalleProStrassenseiteProRichtungProKnotenarm
              .get(knotenarmNr)!
              .get(richtung)!
              .has(strassenseite)
          ) {
            zeitintervalleProStrassenseiteProRichtungProKnotenarm
              .get(knotenarmNr)!
              .get(richtung)!
              .set(strassenseite, new Array<ZeitintervallDTO>());
          }
          zeitintervalleProStrassenseiteProRichtungProKnotenarm
            .get(knotenarmNr)!
            .get(richtung)!
            .get(strassenseite)!
            .push(intervall);
        }
      });
    }
  });

  // Zeitintervalle in bereits vorhandene Längsverkehre einsortieren
  zaehlung.value.laengsverkehr.forEach((lv: LaengsverkehrDTO) => {
    if (
      zeitintervalleProStrassenseiteProRichtungProKnotenarm.has(
        lv.knotenarm.toString()
      )
    ) {
      const zeitintervalleProStrassenseiteProRichtung: Map<
        string,
        Map<string, Array<ZeitintervallDTO>>
      > = zeitintervalleProStrassenseiteProRichtungProKnotenarm.get(
        lv.knotenarm.toString()
      )!;
      if (
        zeitintervalleProStrassenseiteProRichtung.has(lv.richtung.toString())
      ) {
        const zeitintervalleProStrassenseite: Map<
          string,
          Array<ZeitintervallDTO>
        > = zeitintervalleProStrassenseiteProRichtung.get(
          lv.strassenseite.toString()
        )!;
        if (zeitintervalleProStrassenseite.has(lv.strassenseite.toString())) {
          lv.zeitintervalle = zeitintervalleProStrassenseite.get(
            lv.richtung.toString()
          )!;
        }
      }
    }
  });

  // Zeitintervalle in bereits vorhandene Längsverkehre einsortieren
  //zaehlung.value.laengsverkehr.forEach((lv: LaengsverkehrDTO) => {
  //  lv.zeitintervalle = zeitintervalleProStrassenseiteProRichtungProKnotenarm
  //    .get(lv.knotenarm.toString())!
  //    .get(lv.richtung.toString())!
  //    .get(lv.strassenseite)!;
  //});
}

/**
 * Bereitet die Querungsverkehrsdaten für das Speichern vor.
 *
 *
 */
function prepareForSaveZaehlungQU() {
  // Map[knotenarmnr][richtung][zeitintervalle]
  const zeitintervalleProRichtungProKnotenarm: Map<
    string,
    Map<string, Array<ZeitintervallDTO>>
  > = new Map<string, Map<string, Array<ZeitintervallDTO>>>();

  // Alle Knotenarme (enthalten CSV-Daten) durchlaufen
  zaehlung.value.knotenarme.forEach((knotenarm: KnotenarmDTO) => {
    if (
      knotenarm.filename &&
      knotenarm.filedata &&
      knotenarm.filedata.length > 0
    ) {
      const knotenarmNr: string =
        removeCsvHeaderAndRetrieveKnotenarmNr(knotenarm);

      // Alle weiteren Zeilen enthalten Zähldaten
      knotenarm.filedata.forEach((line: string) => {
        if (line.trim().length === 0) {
          // skip Leerzeilen
        } else {
          const values: Array<string> = line.split(SEPARATOR);

          const intervall: ZeitintervallDTO =
            createZeitinvervallFromIntervallNr(values[0]);

          if (values[10].trim().length > 0) {
            intervall.fussgaenger = parseInt(values[10]);
          }

          // Himmelsrichtung auslesen
          let richtung: string = {} as string;
          if (values[3].trim().length > 0) {
            richtung = values[3];
          }

          if (!zeitintervalleProRichtungProKnotenarm.has(knotenarmNr)) {
            zeitintervalleProRichtungProKnotenarm.set(
              knotenarmNr,
              new Map<string, Array<ZeitintervallDTO>>()
            );
          }
          if (
            !zeitintervalleProRichtungProKnotenarm
              .get(knotenarmNr)!
              .has(richtung)
          ) {
            zeitintervalleProRichtungProKnotenarm
              .get(knotenarmNr)!
              .set(richtung, new Array<ZeitintervallDTO>());
          }
          zeitintervalleProRichtungProKnotenarm
            .get(knotenarmNr)!
            .get(richtung)!
            .push(intervall);
        }
      });
    }
  });

  // Zeitintervalle in bereits vorhandene Querungsverkehre einsortieren
  zaehlung.value.querungsverkehr.forEach((qu: QuerungsverkehrDTO) => {
    if (zeitintervalleProRichtungProKnotenarm.has(qu.knotenarm.toString())) {
      const zeitintervalleProRichtung: Map<
        string,
        Array<ZeitintervallDTO>
      > = zeitintervalleProRichtungProKnotenarm.get(qu.knotenarm.toString())!;
      if (zeitintervalleProRichtung.has(qu.richtung.toString())) {
        qu.zeitintervalle = zeitintervalleProRichtung.get(
          qu.richtung.toString()
        )!;
      }
    }
    //qu.zeitintervalle = zeitintervalleProRichtungProKnotenarm
    //  .get(qu.knotenarm.toString())!
    //  .get(qu.richtung.toString())!;
  });
}

/**
 * Wandelt die am Knotenarm hinterlegten Daten aus der CSV in ein Array vom Typ ZeitintervallDTO um.
 * @param arm Knotenarm mit den Daten der csv
 */
function transformCsvDataToVerkehrsbeziehung(
  arm: KnotenarmDTO
): Map<string, Array<ZeitintervallDTO>> {
  const verkehrsbeziehungen: Map<string, Array<ZeitintervallDTO>> = new Map<
    string,
    Array<ZeitintervallDTO>
  >();

  const zeitintervalleProNach: Map<string, Array<ZeitintervallDTO>> = new Map<
    string,
    Array<ZeitintervallDTO>
  >();

  const knotenarmVon: string = removeCsvHeaderAndRetrieveKnotenarmNr(arm);

  // Alle weiteren Zeilen enthalten Zähldaten
  arm.filedata.forEach((line: string) => {
    if (line.trim().length === 0) {
      // skip Leerzeilen
    } else {
      const values: Array<string> = line.split(SEPARATOR);
      const intervall: ZeitintervallDTO = createZeitinvervallFromIntervallNr(
        values[0]
      );

      // Bei Kreisverkehren steht hier e(infahrend), v(orbeifahrend) oder a(usfahrend) drinnen
      const knotenarmNach: string = values[1];

      // Wenn Nach noch nicht exisitert, dann leeres Array hinzufügen
      if (!zeitintervalleProNach.has(knotenarmNach)) {
        zeitintervalleProNach.set(knotenarmNach, []);
      }

      if (values[4].trim().length > 0) {
        intervall.pkw = parseInt(values[4]);
      }
      if (values[5].trim().length > 0) {
        intervall.lkw = parseInt(values[5]);
      }
      if (values[6].trim().length > 0) {
        intervall.lastzuege = parseInt(values[6]);
      }
      if (values[7].trim().length > 0) {
        intervall.busse = parseInt(values[7]);
      }
      if (values[8].trim().length > 0) {
        intervall.kraftraeder = parseInt(values[8]);
      }
      if (values[9].trim().length > 0) {
        intervall.fahrradfahrer = parseInt(values[9]);
      }
      if (values[10].trim().length > 0) {
        intervall.fussgaenger = parseInt(values[10]);
      }
      zeitintervalleProNach.get(knotenarmNach)!.push(intervall);
    }
  });

  zeitintervalleProNach.forEach((value, key) => {
    verkehrsbeziehungen.set(knotenarmVon + key, value);
  });
  return verkehrsbeziehungen;
}

function removeCsvHeaderAndRetrieveKnotenarmNr(
  knotenarm: KnotenarmDTO
): string {
  // Ersten 3 Zeilen entfernen
  knotenarm.filedata.shift(); // Meta-Header
  const knotenarmNr: string = knotenarm.filedata.shift()!.split(SEPARATOR)[3];
  knotenarm.filedata.shift(); // Zaehlung-Header
  return knotenarmNr;
}

function createZeitinvervallFromIntervallNr(
  intervallNr: string
): ZeitintervallDTO {
  const startEndeOfIntervallnummer: StartUhrzeitEndeUhrzeit =
    getStartEndeOfIntervallnummer(intervallNr);

  const intervall: ZeitintervallDTO = {} as ZeitintervallDTO;
  intervall.startUhrzeit = startEndeOfIntervallnummer.startUhrzeit;
  intervall.endeUhrzeit = startEndeOfIntervallnummer.endeUhrzeit;
  return intervall;
}

function getKeyOfVerkehrsbeziehung(
  fz: VerkehrsbeziehungDTO,
  isKreisverkehr: boolean
): string {
  let key = `${fz.knotenarm}`;
  if (isKreisverkehr) {
    if (fz.hinein) {
      key += "e";
    } else if (fz.vorbei) {
      key += "v";
    } else if (fz.heraus) {
      key += "a";
    }
  } else {
    key = `${fz.von}${fz.nach}`;
  }
  return key;
}

function getStartEndeOfIntervallnummer(
  nummer: string
): StartUhrzeitEndeUhrzeit {
  return intervallnummern.get(nummer)!;
}

function cancel(): void {
  eventbusStore.setResetFormEvent();
  emits("close-dialog");
}
</script>
