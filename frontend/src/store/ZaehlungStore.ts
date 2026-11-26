import type {
  ExternalKnotenarmDTO,
  ExternalVerkehrsbeziehungDTO,
  ExternalZaehlungDTO,
  Fahrzeug,
} from "@/api/client";

import { defineStore } from "pinia";
import { computed, ref } from "vue";

import Status from "@/types/enum/Status";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";

export const useZaehlungStore = defineStore("zaehlungStore", () => {
  const zaehlung = ref(DefaultObjectCreator.createDefaultZaehlungDTO());

  const getZaehlung = computed(() => zaehlung.value);

  const isZaehlungEditable = computed(() => {
    return (
      zaehlung.value.status === Status.COUNTING ||
      zaehlung.value.status === Status.CORRECTION
    );
  });

  const isHochrechnungsfaktorEditable = computed(() => {
    return (
      zaehlung.value.status === Status.CREATED ||
      zaehlung.value.status === Status.INSTRUCTED
    );
  });

  const getKnotenarme = computed(() =>
    zaehlung.value.knotenarme ? zaehlung.value.knotenarme : []
  );

  const getVerkehrsbeziehungen = computed(() =>
    zaehlung.value.verkehrsbeziehungen ? zaehlung.value.verkehrsbeziehungen : []
  );

  const getKategorien = computed(() =>
    zaehlung.value.kategorien ? zaehlung.value.kategorien : []
  );

  function setZaehlung(payload: ExternalZaehlungDTO) {
    zaehlung.value = Object.assign(payload, {
      knotenarme: payload.knotenarme ?? [],
      kategorien: payload.kategorien ?? [],
      verkehrsbeziehungen: payload.verkehrsbeziehungen ?? [],
      laengsverkehr: payload.laengsverkehr ?? [],
      querungsverkehr: payload.querungsverkehr ?? [],
    });
  }

  function setKnotenarme(payload: Array<ExternalKnotenarmDTO>) {
    zaehlung.value.knotenarme = payload;
  }

  function addKnotenarm(payload: ExternalKnotenarmDTO) {
    if (!zaehlung.value.knotenarme) {
      zaehlung.value.knotenarme = [];
    }
    zaehlung.value.knotenarme.push(payload);
  }

  function deleteKnotenarm(payload: number) {
    let toDelete: ExternalKnotenarmDTO | undefined = undefined;
    if (!zaehlung.value.knotenarme) {
      zaehlung.value.knotenarme = [];
    }
    // Zu löschendes Element suchen
    zaehlung.value.knotenarme.forEach((knotenarm: ExternalKnotenarmDTO) => {
      if (knotenarm.nummer === payload) {
        toDelete = knotenarm;
      }
    });
    // Wenn das Element existiert, wird dieses aus dem Array entfernt
    if (toDelete) {
      const index: number = zaehlung.value.knotenarme.indexOf(toDelete);
      if (index > -1) {
        zaehlung.value.knotenarme.splice(index, 1);
      }
    }
  }

  function addOrUpdateKnotenarm(payload: ExternalKnotenarmDTO) {
    let toUpdate: ExternalKnotenarmDTO | undefined = undefined;
    if (!zaehlung.value.knotenarme) {
      zaehlung.value.knotenarme = [];
    }
    // Zu aktualisierendes Element suchen
    zaehlung.value.knotenarme.forEach((knotenarm: ExternalKnotenarmDTO) => {
      if (knotenarm.nummer === payload.nummer) {
        toUpdate = knotenarm;
      }
    });
    // Wenn das Element existiert, wird dieses im Array durch das Aktualiserte ersetzt
    if (toUpdate) {
      const index: number = zaehlung.value.knotenarme.indexOf(toUpdate);
      if (index > -1) {
        zaehlung.value.knotenarme[index] = payload;
      }
    }
    // Ansonsten wird es neu hinzugefügt
    else {
      zaehlung.value.knotenarme.push(payload);
    }
  }

  function addKategorie(payload: Fahrzeug) {
    if (!zaehlung.value.kategorien) {
      zaehlung.value.kategorien = [];
    }
    zaehlung.value.kategorien.push(payload);
  }

  function deleteKategorie(payload: Fahrzeug) {
    if (zaehlung.value.kategorien) {
      const index: number = zaehlung.value.kategorien.indexOf(payload);
      if (index > -1) {
        zaehlung.value.kategorien.splice(index, 1);
      }
    }
  }

  function addAllKategorien(payload: Array<Fahrzeug>) {
    zaehlung.value.kategorien = [];
    payload.forEach((fahrzeug: Fahrzeug) => {
      zaehlung.value.kategorien!.push(fahrzeug);
    });
  }

  function deleteAllKategorien() {
    zaehlung.value.kategorien = [];
  }

  function addAllVerkehrsbeziehungen(
    payload: Array<ExternalVerkehrsbeziehungDTO>
  ) {
    zaehlung.value.verkehrsbeziehungen = [];
    payload.forEach((verkehrsbeziehungDTO: ExternalVerkehrsbeziehungDTO) => {
      zaehlung.value.verkehrsbeziehungen!.push(verkehrsbeziehungDTO);
    });
  }

  function deleteVerkehrsbeziehungByKnotenarmnummer(payload: number) {
    if (zaehlung.value.verkehrsbeziehungen) {
      const toDelete: Array<ExternalVerkehrsbeziehungDTO> = [];
      // Alle zu löschenden Verkehrsbeziehungen entfernen
      zaehlung.value.verkehrsbeziehungen.forEach(
        (fz: ExternalVerkehrsbeziehungDTO) => {
          // Vom Knotenarm ausgehende Verkehrsbeziehungen heraussuchen
          if (fz.von === payload) {
            toDelete.push(fz);
          }
          // In den Knotenarm eingehende Verkehrsbeziehungen heraussuchen
          // U-Turn wird oben schon entfernt
          if (fz.von !== fz.nach && fz.nach === payload) {
            toDelete.push(fz);
          }
        }
      );
      // Alle gefundenen Verkehrsbeziehungen entfernen
      toDelete.forEach((deleteMe: ExternalVerkehrsbeziehungDTO) => {
        const index: number =
          zaehlung.value.verkehrsbeziehungen!.indexOf(deleteMe);
        if (index > -1) {
          zaehlung.value.verkehrsbeziehungen!.splice(index, 1);
        }
      });
    }
  }

  function updateVerkehrsbeziehung(payload: ExternalVerkehrsbeziehungDTO) {
    if (zaehlung.value.verkehrsbeziehungen) {
      let toUpdate: ExternalVerkehrsbeziehungDTO | undefined = undefined;
      // Zu aktualisierendes Element suchen
      zaehlung.value.verkehrsbeziehungen.forEach(
        (verkehrsbeziehung: ExternalVerkehrsbeziehungDTO) => {
          if (
            verkehrsbeziehung.von === payload.von &&
            verkehrsbeziehung.nach === payload.nach
          ) {
            toUpdate = verkehrsbeziehung;
          }
        }
      );
      // Wenn das Element existiert, wird dieses im Array durch das Aktualiserte ersetzt
      if (toUpdate) {
        const index: number =
          zaehlung.value.verkehrsbeziehungen.indexOf(toUpdate);
        if (index > -1) {
          zaehlung.value.verkehrsbeziehungen[index] = payload;
        }
      } else {
        // Ansonsten wird eine neue Verkehrsbeziehung hinzugefügt
        zaehlung.value.verkehrsbeziehungen.push(payload);
      }
    }
  }

  function deleteVerkehrsbeziehung(payload: ExternalVerkehrsbeziehungDTO) {
    if (zaehlung.value.verkehrsbeziehungen) {
      let toDelete: ExternalVerkehrsbeziehungDTO | undefined = undefined;
      // Alle zu löschenden Verkehrsbeziehungen entfernen
      zaehlung.value.verkehrsbeziehungen.forEach(
        (fz: ExternalVerkehrsbeziehungDTO) => {
          // Vom Knotenarm ausgehende Verkehrsbeziehungen heraussuchen
          if (fz.von === payload.von && fz.nach === payload.nach) {
            toDelete = fz;
          }
        }
      );
      if (toDelete) {
        const index: number =
          zaehlung.value.verkehrsbeziehungen.indexOf(toDelete);
        if (index > -1) {
          zaehlung.value.verkehrsbeziehungen.splice(index, 1);
        }
      }
    }
  }

  function deleteAllVerkehrsbeziehungen() {
    zaehlung.value.verkehrsbeziehungen = [];
  }

  function updateVerkehrsbeziehungKreisverkehr(
    payload: ExternalVerkehrsbeziehungDTO
  ) {
    if (zaehlung.value.verkehrsbeziehungen) {
      let toUpdate: ExternalVerkehrsbeziehungDTO | undefined = undefined;
      // Zu aktualisierendes Element suchen
      zaehlung.value.verkehrsbeziehungen.forEach(
        (verkehrsbeziehung: ExternalVerkehrsbeziehungDTO) => {
          if (
            verkehrsbeziehung.knotenarm === payload.knotenarm &&
            verkehrsbeziehung.heraus === payload.heraus &&
            verkehrsbeziehung.hinein === payload.hinein &&
            verkehrsbeziehung.vorbei === payload.vorbei
          ) {
            toUpdate = verkehrsbeziehung;
          }
        }
      );
      // Wenn das Element existiert, wird dieses im Array durch das Aktualiserte ersetzt
      if (toUpdate) {
        const index: number =
          zaehlung.value.verkehrsbeziehungen.indexOf(toUpdate);
        if (index > -1) {
          zaehlung.value.verkehrsbeziehungen[index] = payload;
        }
      } else {
        // Ansonsten wird eine neue Verkehrsbeziehung hinzugefügt
        zaehlung.value.verkehrsbeziehungen.push(payload);
      }
    }
  }

  function deleteVerkehrsbeziehungKreisverkehr(
    payload: ExternalVerkehrsbeziehungDTO
  ) {
    if (zaehlung.value.verkehrsbeziehungen) {
      let toDelete: ExternalVerkehrsbeziehungDTO | undefined = undefined;
      // Alle zu löschenden Verkehrsbeziehungen entfernen
      zaehlung.value.verkehrsbeziehungen.forEach(
        (fz: ExternalVerkehrsbeziehungDTO) => {
          // Vom Knotenarm ausgehende Verkehrsbeziehungen heraussuchen
          if (
            fz.knotenarm === payload.knotenarm &&
            fz.heraus === payload.heraus &&
            fz.hinein === payload.hinein &&
            fz.vorbei === payload.vorbei
          ) {
            toDelete = fz;
          }
        }
      );
      if (toDelete) {
        const index: number =
          zaehlung.value.verkehrsbeziehungen.indexOf(toDelete);
        if (index > -1) {
          zaehlung.value.verkehrsbeziehungen.splice(index, 1);
        }
      }
    }
  }

  return {
    getZaehlung,
    isHochrechnungsfaktorEditable,
    isZaehlungEditable,
    getKnotenarme,
    getVerkehrsbeziehungen,
    getKategorien,
    setZaehlung,
    setKnotenarme,
    addKnotenarm,
    deleteKnotenarm,
    addOrUpdateKnotenarm,
    addKategorie,
    deleteKategorie,
    addAllKategorien,
    deleteAllKategorien,
    addAllVerkehrsbeziehungen,
    deleteVerkehrsbeziehungByKnotenarmnummer,
    updateVerkehrsbeziehung,
    deleteVerkehrsbeziehung,
    deleteAllVerkehrsbeziehungen,
    updateVerkehrsbeziehungKreisverkehr,
    deleteVerkehrsbeziehungKreisverkehr,
  };
});
