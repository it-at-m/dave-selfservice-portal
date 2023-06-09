import KnotenarmDTO from "@/domain/dto/KnotenarmDTO";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
import Fahrzeug from "@/domain/enums/Fahrzeug";
import Status from "@/domain/enums/Status";

const state = {
    zaehlung: {} as ZaehlungDTO,
};

const getters = {
    // Zählung
    getZaehlung(state: any): ZaehlungDTO {
        return state.zaehlung;
    },
    // EditZaehlung
    isZaehlungEditable(state: any): boolean {
        return (
            state.zaehlung.status === Status.COUNTING ||
            state.zaehlung.status === Status.CORRECTION
        );
    },
    // Zählung
    isHochrechnungsfaktorEditable(state: any): boolean {
        const editableStatus: Array<Status> = [
            Status.CREATED,
            Status.INSTRUCTED,
        ];
        return editableStatus.includes(state.zaehlung.status);
    },
    // Knotenarme der Zählung
    getKnotenarme(state: any): KnotenarmDTO[] {
        if (state.zaehlung.knotenarme) {
            return state.zaehlung.knotenarme;
        }
        return [];
    },
    // Fahrbeziehungen der Zählung
    getFahrbeziehungen(state: any): Array<FahrbeziehungDTO> {
        if (state.zaehlung.fahrbeziehungen) {
            return state.zaehlung.fahrbeziehungen;
        }
        return [];
    },
    // Kategorien der Zählung
    getKategorien(state: any): Array<string> {
        if (state.zaehlung.kategorien) {
            return state.zaehlung.kategorien;
        }
        return [];
    },
};

const mutations = {
    setZaehlung(state: any, payload: ZaehlungDTO) {
        state.zaehlung = payload;
    },
    setKnotenarme(state: any, payload: Array<KnotenarmDTO>) {
        state.zaehlung.knotenarme = payload;
    },
    addKnotenarm(state: any, payload: KnotenarmDTO) {
        state.zaehlung.knotenarme.push(payload);
    },
    deleteKnotenarm(state: any, payload: number) {
        let toDelete: KnotenarmDTO | null = null;
        // Zu löschendes Element suchen
        state.zaehlung.knotenarme.forEach((knotenarm: KnotenarmDTO) => {
            if (knotenarm.nummer === payload) {
                toDelete = knotenarm;
            }
        });
        // Wenn das Element existiert, wird dieses aus dem Array entfernt
        if (toDelete != null) {
            const index: number = state.zaehlung.knotenarme.indexOf(toDelete);
            if (index > -1) {
                state.zaehlung.knotenarme.splice(index, 1);
            }
        }
    },
    addOrUpdateKnotenarm(state: any, payload: KnotenarmDTO) {
        let containsKnotenarm = false;
        let toUpdate: KnotenarmDTO | null = null;
        // Zu aktualisierendes Element suchen
        state.zaehlung.knotenarme.forEach((knotenarm: KnotenarmDTO) => {
            if (knotenarm.nummer === payload.nummer) {
                toUpdate = knotenarm;
            }
            containsKnotenarm = containsKnotenarm || toUpdate !== null;
        });
        // Wenn das Element existiert, wird dieses im Array durch das Aktualiserte ersetzt
        if (containsKnotenarm) {
            const index: number = state.zaehlung.knotenarme.indexOf(toUpdate);
            if (index > -1) {
                state.zaehlung.knotenarme[index] = payload;
            }
        }
        // Ansonsten wird es neu hinzugefügt
        else {
            state.zaehlung.knotenarme.push(payload);
        }
    },
    addKategorie(state: any, payload: Fahrzeug) {
        state.zaehlung.kategorien.push(payload);
    },
    deleteKategorie(state: any, payload: Fahrzeug) {
        const index: number = state.zaehlung.kategorien.indexOf(payload);
        if (index > -1) {
            state.zaehlung.kategorien.splice(index, 1);
        }
    },
    addAllKategorien(state: any, payload: Array<Fahrzeug>) {
        state.zaehlung.kategorien = [];
        payload.forEach((fahrzeug: Fahrzeug) => {
            state.zaehlung.kategorien.push(fahrzeug);
        });
    },
    deleteAllKategorien(state: any) {
        state.zaehlung.kategorien = [];
    },
    deleteFahrbeziehungByKnotenarmnummer(state: any, payload: number) {
        const toDelete: Array<FahrbeziehungDTO> = [];
        // Alle zu löschenden Fahrbeziehungen entfernen
        state.zaehlung.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
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
                state.zaehlung.fahrbeziehungen.indexOf(deleteMe);
            if (index > -1) {
                state.zaehlung.fahrbeziehungen.splice(index, 1);
            }
        });
    },
    updateFahrbeziehung(state: any, payload: FahrbeziehungDTO) {
        let toUpdate: FahrbeziehungDTO | null = null;
        // Zu aktualisierendes Element suchen
        state.zaehlung.fahrbeziehungen.forEach(
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
        if (toUpdate !== null) {
            const index: number =
                state.zaehlung.fahrbeziehungen.indexOf(toUpdate);
            if (index > -1) {
                state.zaehlung.fahrbeziehungen[index] = payload;
            }
        } else {
            // Ansonsten wird eine neue Fahrbeziehung hinzugefügt
            state.zaehlung.fahrbeziehungen.push(payload);
        }
    },
    deleteFahrbeziehung(state: any, payload: FahrbeziehungDTO) {
        let toDelete: FahrbeziehungDTO | null = null;
        // Alle zu löschenden Fahrbeziehungen entfernen
        state.zaehlung.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
            // Vom Knotenarm ausgehende Fahrbeziehungen heraussuchen
            if (fz.von === payload.von && fz.nach === payload.nach) {
                toDelete = fz;
            }
        });
        if (toDelete !== null) {
            const index: number =
                state.zaehlung.fahrbeziehungen.indexOf(toDelete);
            if (index > -1) {
                state.zaehlung.fahrbeziehungen.splice(index, 1);
            }
        }
    },
};

const actions = {
    setZaehlung(context: any, payload: ZaehlungDTO) {
        context.commit("setZaehlung", payload);
    },
    setKnotenarme(context: any, payload: Array<KnotenarmDTO>) {
        context.commit("setKnotenarme", payload);
    },
    addOrUpdateKnotenarm(context: any, payload: KnotenarmDTO) {
        context.commit("addOrUpdateKnotenarm", payload);
    },
    deleteKnotenarm(context: any, payload: number) {
        context.commit("deleteKnotenarm", payload);
    },
    addKategorie(context: any, payload: Fahrzeug) {
        context.commit("addKategorie", payload);
    },
    deleteKategorie(context: any, payload: Fahrzeug) {
        context.commit("deleteKategorie", payload);
    },
    addAllKategorien(context: any, payload: Array<Fahrzeug>) {
        context.commit("addAllKategorien", payload);
    },
    deleteAllKategorien(context: any) {
        context.commit("deleteAllKategorien");
    },
    deleteFahrbeziehung(context: any, payload: FahrbeziehungDTO) {
        context.commit("deleteFahrbeziehung", payload);
    },
    deleteFahrbeziehungByKnotenarmnummer(context: any, payload: number) {
        context.commit("deleteFahrbeziehungByKnotenarmnummer", payload);
    },
    updateFahrbeziehung(context: any, payload: FahrbeziehungDTO) {
        context.commit("updateFahrbeziehung", payload);
    },
};

export default {
    state,
    getters,
    mutations,
    actions,
};
