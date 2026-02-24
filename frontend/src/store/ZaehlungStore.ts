import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { defineStore } from "pinia";
import { computed, ref } from "vue";

import Fahrzeug from "@/types/enum/Fahrzeug";
import Status from "@/types/enum/Status";

export const useZaehlungStore = defineStore("zaehlungStore", () => {
  const zaehlung = ref<ZaehlungDTO>({} as ZaehlungDTO);

  const getZaehlung = computed(() => zaehlung.value);

  const isZaehlungEditable = computed(() => {
    return (
      zaehlung.value.status === Status.COUNTING ||
      zaehlung.value.status === Status.CORRECTION
    );
  });

  const isHochrechnungsfaktorEditable = computed(() => {
    const editableStatus: Array<Status> = [Status.CREATED, Status.INSTRUCTED];
    return editableStatus.includes(zaehlung.value.status);
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

  function setZaehlung(payload: ZaehlungDTO) {
    zaehlung.value = payload;
  }

  function setKnotenarme(payload: Array<KnotenarmDTO>) {
    zaehlung.value.knotenarme = payload;
  }

  function addKnotenarm(payload: KnotenarmDTO) {
    zaehlung.value.knotenarme.push(payload);
  }

  function deleteKnotenarm(payload: number) {
    let toDelete: KnotenarmDTO | undefined = undefined;
    // Zu löschendes Element suchen
    zaehlung.value.knotenarme.forEach((knotenarm: KnotenarmDTO) => {
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

  function addOrUpdateKnotenarm(payload: KnotenarmDTO) {
    let toUpdate: KnotenarmDTO | undefined = undefined;
    // Zu aktualisierendes Element suchen
    zaehlung.value.knotenarme.forEach((knotenarm: KnotenarmDTO) => {
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
    zaehlung.value.kategorien.push(payload);
  }

  function deleteKategorie(payload: Fahrzeug) {
    const index: number = zaehlung.value.kategorien.indexOf(payload);
    if (index > -1) {
      zaehlung.value.kategorien.splice(index, 1);
    }
  }

  function addAllKategorien(payload: Array<Fahrzeug>) {
    zaehlung.value.kategorien = [];
    payload.forEach((fahrzeug: Fahrzeug) => {
      zaehlung.value.kategorien.push(fahrzeug);
    });
  }

  function deleteAllKategorien() {
    zaehlung.value.kategorien = [];
  }

  function addAllVerkehrsbeziehungen(payload: Array<VerkehrsbeziehungDTO>) {
    zaehlung.value.verkehrsbeziehungen = [];
    payload.forEach((verkehrsbeziehungDTO: VerkehrsbeziehungDTO) => {
      zaehlung.value.verkehrsbeziehungen.push(verkehrsbeziehungDTO);
    });
  }

  function deleteVerkehrsbeziehungByKnotenarmnummer(payload: number) {
    const toDelete: Array<VerkehrsbeziehungDTO> = [];
    // Alle zu löschenden Verkehrsbeziehungen entfernen
    zaehlung.value.verkehrsbeziehungen.forEach((fz: VerkehrsbeziehungDTO) => {
      // Vom Knotenarm ausgehende Verkehrsbeziehungen heraussuchen
      if (fz.von === payload) {
        toDelete.push(fz);
      }
      // In den Knotenarm eingehende Verkehrsbeziehungen heraussuchen
      // U-Turn wird oben schon entfernt
      if (fz.von !== fz.nach && fz.nach === payload) {
        toDelete.push(fz);
      }
    });
    // Alle gefundenen Verkehrsbeziehungen entfernen
    toDelete.forEach((deleteMe: VerkehrsbeziehungDTO) => {
      const index: number = zaehlung.value.verkehrsbeziehungen.indexOf(deleteMe);
      if (index > -1) {
        zaehlung.value.verkehrsbeziehungen.splice(index, 1);
      }
    });
  }

  function updateVerkehrsbeziehung(payload: VerkehrsbeziehungDTO) {
    let toUpdate: VerkehrsbeziehungDTO | undefined = undefined;
    // Zu aktualisierendes Element suchen
    zaehlung.value.verkehrsbeziehungen.forEach(
      (verkehrsbeziehung: VerkehrsbeziehungDTO) => {
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
      const index: number = zaehlung.value.verkehrsbeziehungen.indexOf(toUpdate);
      if (index > -1) {
        zaehlung.value.verkehrsbeziehungen[index] = payload;
      }
    } else {
      // Ansonsten wird eine neue Verkehrsbeziehung hinzugefügt
      zaehlung.value.verkehrsbeziehungen.push(payload);
    }
  }

  function deleteVerkehrsbeziehung(payload: VerkehrsbeziehungDTO) {
    let toDelete: VerkehrsbeziehungDTO | undefined = undefined;
    // Alle zu löschenden Verkehrsbeziehungen entfernen
    zaehlung.value.verkehrsbeziehungen.forEach((fz: VerkehrsbeziehungDTO) => {
      // Vom Knotenarm ausgehende Verkehrsbeziehungen heraussuchen
      if (fz.von === payload.von && fz.nach === payload.nach) {
        toDelete = fz;
      }
    });
    if (toDelete) {
      const index: number = zaehlung.value.verkehrsbeziehungen.indexOf(toDelete);
      if (index > -1) {
        zaehlung.value.verkehrsbeziehungen.splice(index, 1);
      }
    }
  }

  function deleteAllVerkehrsbeziehungen() {
    zaehlung.value.verkehrsbeziehungen = [];
  }

  function updateVerkehrsbeziehungKreisverkehr(payload: VerkehrsbeziehungDTO) {
    let toUpdate: VerkehrsbeziehungDTO | undefined = undefined;
    // Zu aktualisierendes Element suchen
    zaehlung.value.verkehrsbeziehungen.forEach(
      (verkehrsbeziehung: VerkehrsbeziehungDTO) => {
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
      const index: number = zaehlung.value.verkehrsbeziehungen.indexOf(toUpdate);
      if (index > -1) {
        zaehlung.value.verkehrsbeziehungen[index] = payload;
      }
    } else {
      // Ansonsten wird eine neue Verkehrsbeziehung hinzugefügt
      zaehlung.value.verkehrsbeziehungen.push(payload);
    }
  }

  function deleteVerkehrsbeziehungKreisverkehr(payload: VerkehrsbeziehungDTO) {
    let toDelete: VerkehrsbeziehungDTO | undefined = undefined;
    // Alle zu löschenden Verkehrsbeziehungen entfernen
    zaehlung.value.verkehrsbeziehungen.forEach((fz: VerkehrsbeziehungDTO) => {
      // Vom Knotenarm ausgehende Verkehrsbeziehungen heraussuchen
      if (
        fz.knotenarm === payload.knotenarm &&
        fz.heraus === payload.heraus &&
        fz.hinein === payload.hinein &&
        fz.vorbei === payload.vorbei
      ) {
        toDelete = fz;
      }
    });
    if (toDelete) {
      const index: number = zaehlung.value.verkehrsbeziehungen.indexOf(toDelete);
      if (index > -1) {
        zaehlung.value.verkehrsbeziehungen.splice(index, 1);
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
