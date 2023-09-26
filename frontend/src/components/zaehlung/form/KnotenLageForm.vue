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
                        height="100%"
                        width="100%"
                        active-color="#1565C0"
                        passive-color="#EEEEEE"
                        :knotenarme="knotenarmeStore"
                    ></zaehlung-geometrie>
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
                                :text="getKreisverkehrText"
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
                            md="1"
                        >
                            <v-btn @click="fileUpload">
                                <v-icon>{{ appendIcon }}</v-icon>
                                Upload
                            </v-btn>
                            <v-form ref="fileInputForm">
                                <v-file-input
                                    :id="FILE_INPUT_FIELD_ID"
                                    :key="resetFileInput"
                                    style="display: none"
                                    dense
                                    single-line
                                    multiple
                                    accept=".csv"
                                    @change="onFileSelect($event)"
                                />
                            </v-form>
                        </v-col>
                        <v-spacer />
                    </v-row>
                    <v-row
                        v-for="arm in getKnotenarme"
                        :key="arm.id"
                        dense
                    >
                        <v-col
                            cols="12"
                            md="6"
                        >
                            <v-text-field
                                :value="arm.strassenname"
                                single-line
                                dense
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
                                dense
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
                        dense
                        :headers="fahrbeziehungHeader"
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

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import ZaehlungGeometrie from "@/components/zaehlung/ZaehlungGeometrie.vue";
import KnotenarmDTO from "@/domain/dto/KnotenarmDTO";
import { LatLng } from "leaflet";
import GeoPoint from "@/domain/GeoPoint";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import ZaehlungCardMap from "@/components/map/ZaehlungCardMap.vue";
import _ from "lodash";
import LhmTextField from "@/components/common/LhmTextField.vue";
import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
import FahrbeziehungComparator from "@/util/FahrbeziehungComparator";
import { Levels } from "@/api/error";
import KnotenarmComparator from "@/util/KnotenarmComparator";
import Zaehlart from "@/domain/enums/Zaehlart";
/* eslint-enable no-unused-vars */
@Component({
    components: {
        LhmTextField,
        ZaehlungCardMap,
        ZaehlungGeometrie,
    },
})
export default class KnotenLageForm extends Vue {
    @Prop()
    private readonly height!: string;

    private static readonly EXPECTED_META_HEADER: string =
        "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;";

    private static readonly EXPECTED_ZAEHLDATEN_HEADER: string =
        "Intervallnummer;nach;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss";

    private static readonly SEPARATOR: string = ";";

    private readonly FILE_INPUT_FIELD_ID: string = "fileInputField";

    private resetFileInput = 0;

    private zaehlung: ZaehlungDTO =
        DefaultObjectCreator.createDefaultZaehlungDTO();

    mounted() {
        this.updateWorkingCopy();
    }

    get zaehlungStore(): ZaehlungDTO {
        return this.$store.getters.getZaehlung;
    }

    get knotenarmeStore(): Array<KnotenarmDTO> {
        return this.$store.getters.getKnotenarme;
    }

    get getKreisverkehrText() {
        return this.zaehlung.kreisverkehr ? "Ja" : "Nein";
    }

    @Watch("zaehlungStore", { deep: true, immediate: true })
    updateWorkingCopy(): void {
        this.zaehlung = _.cloneDeep(this.zaehlungStore);
        this.zaehlung.knotenarme.sort(KnotenarmComparator.sortByNumber);
    }

    updateStore(): void {
        this.$store.dispatch("setZaehlung", _.cloneDeep(this.zaehlung));
    }

    get coordsZaehlstelle(): LatLng {
        let punkt: GeoPoint = this.zaehlung.zaehlstellePunkt;
        if (punkt)
            return new LatLng(parseFloat(punkt.lat), parseFloat(punkt.lon));
        else return DefaultObjectCreator.createCenterOfMunichLatLng();
    }

    get coordsZaehlung(): LatLng {
        let punkt: GeoPoint = this.zaehlung.punkt;
        if (punkt)
            return new LatLng(parseFloat(punkt.lat), parseFloat(punkt.lon));
        else return this.coordsZaehlstelle;
    }

    private fileUpload(): void {
        if (this.isZaehlungEditable) {
            document.getElementById(this.FILE_INPUT_FIELD_ID)?.click();
        }
    }

    get fahrbeziehungHeader(): Array<any> {
        return [
            {
                text: "Von",
                align: "center",
                sortable: false,
                value: "von",
                divider: "true",
            },
            {
                text: "Nach",
                align: "center",
                sortable: false,
                value: "nach",
            },
        ];
    }

    get allFahrbeziehungen(): Array<FahrbeziehungDTO> {
        return this.zaehlung.fahrbeziehungen.sort(
            FahrbeziehungComparator.sortByActiveVonAndNach
        );
    }

    private getStyle(arm: KnotenarmDTO): string {
        let style = "display: none";
        if (arm.filename && arm.filename.trim().length > 0) {
            style = "";
        }
        return style;
    }

    private onFileSelect(selectedFiles: Array<any>) {
        // wenn zuviele Files hochgeladen wurden, dann Abbrechen
        if (
            !_.isNil(selectedFiles) &&
            selectedFiles.length > this.zaehlungStore.knotenarme.length
        ) {
            // Damit nacheinander ein File mit identischem Namen hocheladen werden
            // kann, wird immer der FileInput zurückgesetzt
            this.resetFileInput = Math.floor(Math.random() * 10001);
            this.$store.dispatch("snackbar/showToast", {
                level: Levels.ERROR,
                snackbarTextPart1: `Zu viele Dateien`,
                snackbarTextPart2: `Es darf pro Knotenarm nur eine Datei hochgeladen werden.`,
            });
        } else {
            // Einlesen
            this.readFiles(selectedFiles);
        }
    }

    /**
     * Methode zum Einlesen der Files.
     */
    /* eslint-disable @typescript-eslint/no-this-alias */
    private readFiles(selectedFiles: Array<any>) {
        let that = this;
        let successfull = true;
        let errorText = "";
        let itemsProcessed = 0;

        selectedFiles.forEach((myFile) => {
            const fileReader = new FileReader();
            // Eventlistener hinzufügen und angeben, was passieren soll, wenn ein File geladen wurde ('load'-Event)
            fileReader.addEventListener(
                "load",
                function () {
                    const csv: Array<string> = (
                        fileReader.result as string
                    ).split(/\r\n|\n/);
                    const knotenarmnummerOfCsv: number =
                        that.getKnotenarmnummerOfCsv(csv);
                    itemsProcessed++;
                    that.zaehlung.knotenarme.forEach(
                        (zaehlungArm: KnotenarmDTO) => {
                            if (zaehlungArm.nummer === knotenarmnummerOfCsv) {
                                // Plausibilitätscheck
                                const isPlausible: string =
                                    that.checkUploadedFiledata(
                                        knotenarmnummerOfCsv,
                                        csv
                                    );
                                if (isPlausible.length === 0) {
                                    zaehlungArm.filename = myFile.name;
                                    zaehlungArm.filedata = csv;
                                    that.updateStore();
                                } else {
                                    successfull = false;
                                    errorText = `${errorText} ${myFile.name}: ${isPlausible}\n`;
                                }

                                // Wenn alle Files eingelesen wurden, dann zeige das Ergebnis an
                                if (itemsProcessed === selectedFiles.length) {
                                    // Damit nacheinander ein File mit identischem Namen hocheladen werden
                                    // kann, wird immer der FileInput zurückgesetzt
                                    that.resetFileInput = Math.floor(
                                        Math.random() * 10001
                                    );
                                    if (successfull) {
                                        that.$store.dispatch(
                                            "snackbar/showToast",
                                            {
                                                level: Levels.SUCCESS,
                                                snackbarTextPart1: `Alle Dateien konnten einem Knotenarm zugeordnet werden.`,
                                            }
                                        );
                                    } else {
                                        that.$store.dispatch(
                                            "snackbar/showToast",
                                            {
                                                level: Levels.ERROR,
                                                snackbarTextPart1: `Folgende Dateien wurden abgelehnt:`,
                                                snackbarTextPart2: errorText,
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    );
                },
                false
            );

            if (myFile) {
                if (this.wrongFileType(myFile)) {
                    that.$store.dispatch("snackbar/showToast", {
                        level: Levels.WARNING,
                        snackbarTextPart1: `Ungültiges Dateiformat.`,
                        snackbarTextPart2: `Es werden nur CSV-Dateien unterstützt und keine ${myFile.name
                            .split(".")
                            .pop()
                            .toUpperCase()}-Dateien.`,
                    });
                } else {
                    // Das 'load'-Event wird ausgelöst, sobald der FileReader das Laden beendet hat.
                    fileReader.readAsText(myFile);
                }
            }
        });
    }
    /* eslint-disable @typescript-eslint/no-this-alias */

    private wrongFileType(file: File): boolean {
        return !file.name.toLowerCase().endsWith(".csv");
    }

    private deleteFile(nummer: number): void {
        this.zaehlung.knotenarme.forEach((arm: KnotenarmDTO) => {
            if (arm.nummer === nummer) {
                arm.filename = "";
                arm.filedata = [];
            }
        });
        this.updateStore();
    }

    get getKnotenarme(): Array<KnotenarmDTO> {
        return this.zaehlung.knotenarme;
    }

    get isZaehlungEditable(): boolean {
        return this.$store.getters.isZaehlungEditable;
    }

    get appendIcon(): string {
        if (this.isZaehlungEditable) {
            return "mdi-upload";
        } else {
            return "";
        }
    }

    get isNotKreisverkehr(): boolean {
        return !this.zaehlungStore.kreisverkehr;
    }

    public getKnotenarmnummerOfCsv(csvData: Array<string>): number {
        // keine Daten vorhanden
        if (_.isNil(csvData) || csvData.length < 4) {
            return 0;
        }
        let metaData: string = csvData[1];
        // MetaHeader vorhanden?
        const metaDataSplitted: Array<string> = metaData.split(
            KnotenLageForm.SEPARATOR
        );
        const armNummer: any = metaDataSplitted[3];
        if (isNaN(armNummer)) {
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
     * @param arm aktueller Knotenarm
     * @param csvData File as Array<string>
     */
    public checkUploadedFiledata(
        armNummer: number,
        csvData: Array<string>
    ): string {
        const zaehlung: ZaehlungDTO = this.zaehlungStore;
        // keine Daten vorhanden
        if (_.isNil(csvData) || csvData.length < 4) {
            return "Die hochgeladene Datei enthält keine Zähldaten.";
        }
        const metaHeader: string = csvData[0];
        // MetaHeader vorhanden?
        if (_.isNil(metaHeader)) {
            return "Die Header der Metadaten fehlen in der hochgeladenen Datei.";
        }
        // MetaHeader korrekt?
        if (metaHeader!.trim() !== KnotenLageForm.EXPECTED_META_HEADER) {
            return `Die Header der Metadaten in der hochgeladenen Datei sind nicht korrekt.\nErwartet: ${KnotenLageForm.EXPECTED_META_HEADER}`;
        }

        const metaData: string = csvData[1];
        // MetaData vorhanden?
        if (_.isNil(metaData)) {
            return "Die Metadaten fehlen in der hochgeladenen Datei.";
        }
        // MetaData korrekt?

        const expectedMetaData = `${zaehlung.zaehlstelleNummer};${
            zaehlung.zaehlart === Zaehlart.N ? "" : zaehlung.zaehlart
        };${zaehlung.datum};${armNummer};;;;;`;
        if (metaData!.trim() !== expectedMetaData) {
            return `Die Metadaten in der hochgeladenen Datei sind nicht korrekt.\nErwartet: ${expectedMetaData}`;
        }

        const zaehldatenHeader: string = csvData[2];
        // ZaehldatenHeader vorhanden und korrekt?
        if (_.isNil(zaehldatenHeader)) {
            return "Die Header der Zähldaten fehlen in der hochgeladenen Datei.";
        }
        // ZaehldatenHeader vorhanden und korrekt?
        if (
            zaehldatenHeader!.trim() !==
            KnotenLageForm.EXPECTED_ZAEHLDATEN_HEADER
        ) {
            return `Die Header der Zähldaten in der hochgeladenen Datei sind nicht korrekt.\nErwartet: ${KnotenLageForm.EXPECTED_ZAEHLDATEN_HEADER}`;
        }

        // Plausiprüfung, ob nur Nummern enthalten sind in den Zähldaten
        for (let [csvLineIndex, data] of csvData.entries()) {
            // Prüfung ab Zeile 3 der CSV und für nicht leere Zeilen
            if (csvLineIndex > 2 && data.trim().length > 0) {
                const csvLineNumber: number = csvLineIndex + 1;
                const splittedLine: Array<any> = data.split(
                    KnotenLageForm.SEPARATOR
                );
                if (splittedLine.length !== 9) {
                    return `Je Zeile müssen 9 Spalten enthalten sein.`;
                }

                // Intervallnummer muss eine Zahl sein zwischen 1 und 96 (eingeschlossen) sein
                if (isNaN(splittedLine[0].trim())) {
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
                    if (this.zaehlung.kreisverkehr) {
                        fahrbeziehung = this.zaehlung.fahrbeziehungen.find(
                            (fahrbeziehung) => {
                                return (
                                    fahrbeziehung.knotenarm === armNummer &&
                                    ((nach === "e" && fahrbeziehung.hinein) ||
                                        (nach === "v" &&
                                            fahrbeziehung.vorbei) ||
                                        (nach === "a" && fahrbeziehung.heraus))
                                );
                            }
                        );
                    } else {
                        const nachArmNumber: number = _.parseInt(
                            _.toString(nach.trim())
                        );
                        fahrbeziehung = this.zaehlung.fahrbeziehungen.find(
                            (fahrbeziehung) => {
                                return (
                                    armNummer === fahrbeziehung.von &&
                                    nachArmNumber === fahrbeziehung.nach
                                );
                            }
                        );
                    }
                    if (_.isNil(fahrbeziehung)) {
                        return `Für die Zähldaten in Zeile ${csvLineNumber} ist keine Fahrbeziehung existent oder aktiv.\nWar: ${splittedLine}`;
                    }
                }

                // Prüfung der Zähldaten auf Korrektheit
                if (this.zaehlungStore.kreisverkehr) {
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
                        const fieldValue: any =
                            splittedLine[columnIndex].trim();
                        if (fieldValue.length >= 0) {
                            if (isNaN(fieldValue)) {
                                return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nur Nummern enthalten.\nWar: ${splittedLine}`;
                            } else if (_.parseInt(_.toString(fieldValue)) < 0) {
                                return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nicht negativ sein.\nWar: ${splittedLine}`;
                            }
                        }
                    }
                } else {
                    for (let fieldValue of splittedLine) {
                        // Kreuzung: Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
                        if (fieldValue.trim().length >= 0) {
                            if (isNaN(fieldValue.trim())) {
                                return `Die Zähldaten in Zeile ${csvLineNumber} dürfen nur Nummern enthalten.\nWar: ${splittedLine}`;
                            } else if (
                                _.parseInt(_.toString(fieldValue.trim())) < 0
                            ) {
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
}
</script>
