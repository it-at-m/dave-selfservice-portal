import { defineStore } from "pinia";
import { computed, Ref, ref } from "vue";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import Status from "@/domain/enums/Status";
import KnotenarmDTO from "@/domain/dto/KnotenarmDTO";
import Fahrzeug from "@/domain/enums/Fahrzeug";
import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";

export const useZaehlungStore = defineStore("zaehlungStore", () => {
    const zaehlung: Ref<ZaehlungDTO> = ref<ZaehlungDTO>({} as ZaehlungDTO);

    const getZaehlung = computed(() => zaehlung.value);

    const isZaehlungEditable = computed(() => {
        return (
            zaehlung.value.status === Status.COUNTING ||
            zaehlung.value.status === Status.CORRECTION
        );
    });

    const isHochrechnungsfaktorEditable = computed(() => {
        const editableStatus: Array<Status> = [
            Status.CREATED,
            Status.INSTRUCTED,
        ];
        return editableStatus.includes(zaehlung.value.status);
    });

    const getKnotenarme = computed(() =>
        zaehlung.value.knotenarme ? zaehlung.value.knotenarme : []
    );

    const getFahrbeziehungen = computed(() =>
        zaehlung.value.fahrbeziehungen ? zaehlung.value.fahrbeziehungen : []
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

    function addAllFahrbeziehungen(payload: Array<FahrbeziehungDTO>) {
        zaehlung.value.fahrbeziehungen = [];
        payload.forEach((fahrbeziehungDTO: FahrbeziehungDTO) => {
            zaehlung.value.fahrbeziehungen.push(fahrbeziehungDTO);
        });
    }

    function deleteFahrbeziehungByKnotenarmnummer(payload: number) {
        const toDelete: Array<FahrbeziehungDTO> = [];
        // Alle zu löschenden Fahrbeziehungen entfernen
        zaehlung.value.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
            // Vom Knotenarm ausgehende Fahrbeziehungen heraussuchen
            if (fz.von === payload) {
                toDelete.push(fz);
            }
            // In den Knotenarm eingehende Fahrbeziehungen heraussuchen
            // U-Turn wird oben schon entfernt
            if (fz.von !== fz.nach && fz.nach === payload) {
                toDelete.push(fz);
            }
        });
        // Alle gefundenen Fahrbeziehungen entfernen
        toDelete.forEach((deleteMe: FahrbeziehungDTO) => {
            const index: number =
                zaehlung.value.fahrbeziehungen.indexOf(deleteMe);
            if (index > -1) {
                zaehlung.value.fahrbeziehungen.splice(index, 1);
            }
        });
    }

    function updateFahrbeziehung(payload: FahrbeziehungDTO) {
        let toUpdate: FahrbeziehungDTO | undefined = undefined;
        // Zu aktualisierendes Element suchen
        zaehlung.value.fahrbeziehungen.forEach(
            (fahrbeziehung: FahrbeziehungDTO) => {
                if (
                    fahrbeziehung.von === payload.von &&
                    fahrbeziehung.nach === payload.nach
                ) {
                    toUpdate = fahrbeziehung;
                }
            }
        );
        // Wenn das Element existiert, wird dieses im Array durch das Aktualiserte ersetzt
        if (toUpdate) {
            const index: number =
                zaehlung.value.fahrbeziehungen.indexOf(toUpdate);
            if (index > -1) {
                zaehlung.value.fahrbeziehungen[index] = payload;
            }
        } else {
            // Ansonsten wird eine neue Fahrbeziehung hinzugefügt
            zaehlung.value.fahrbeziehungen.push(payload);
        }
    }

    function deleteFahrbeziehung(payload: FahrbeziehungDTO) {
        let toDelete: FahrbeziehungDTO | undefined = undefined;
        // Alle zu löschenden Fahrbeziehungen entfernen
        zaehlung.value.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
            // Vom Knotenarm ausgehende Fahrbeziehungen heraussuchen
            if (fz.von === payload.von && fz.nach === payload.nach) {
                toDelete = fz;
            }
        });
        if (toDelete) {
            const index: number =
                zaehlung.value.fahrbeziehungen.indexOf(toDelete);
            if (index > -1) {
                zaehlung.value.fahrbeziehungen.splice(index, 1);
            }
        }
    }

    function deleteAllFahrbeziehungen() {
        zaehlung.value.fahrbeziehungen = [];
    }

    function updateFahrbeziehungKreisverkehr(payload: FahrbeziehungDTO) {
        let toUpdate: FahrbeziehungDTO | undefined = undefined;
        // Zu aktualisierendes Element suchen
        zaehlung.value.fahrbeziehungen.forEach(
            (fahrbeziehung: FahrbeziehungDTO) => {
                if (
                    fahrbeziehung.knotenarm === payload.knotenarm &&
                    fahrbeziehung.heraus === payload.heraus &&
                    fahrbeziehung.hinein === payload.hinein &&
                    fahrbeziehung.vorbei === payload.vorbei
                ) {
                    toUpdate = fahrbeziehung;
                }
            }
        );
        // Wenn das Element existiert, wird dieses im Array durch das Aktualiserte ersetzt
        if (toUpdate) {
            const index: number =
                zaehlung.value.fahrbeziehungen.indexOf(toUpdate);
            if (index > -1) {
                zaehlung.value.fahrbeziehungen[index] = payload;
            }
        } else {
            // Ansonsten wird eine neue Fahrbeziehung hinzugefügt
            zaehlung.value.fahrbeziehungen.push(payload);
        }
    }

    function deleteFahrbeziehungKreisverkehr(payload: FahrbeziehungDTO) {
        let toDelete: FahrbeziehungDTO | undefined = undefined;
        // Alle zu löschenden Fahrbeziehungen entfernen
        zaehlung.value.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
            // Vom Knotenarm ausgehende Fahrbeziehungen heraussuchen
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
            const index: number =
                zaehlung.value.fahrbeziehungen.indexOf(toDelete);
            if (index > -1) {
                zaehlung.value.fahrbeziehungen.splice(index, 1);
            }
        }
    }

    return {
        getZaehlung,
        isHochrechnungsfaktorEditable,
        getKnotenarme,
        getFahrbeziehungen,
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
        addAllFahrbeziehungen,
        deleteFahrbeziehungByKnotenarmnummer,
        updateFahrbeziehung,
        deleteFahrbeziehung,
        deleteAllFahrbeziehungen,
        updateFahrbeziehungKreisverkehr,
        deleteFahrbeziehungKreisverkehr,
    };
});
