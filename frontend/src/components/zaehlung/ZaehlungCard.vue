<template>
  <v-card
      :loading="loading"
      class="mx-auto my-12"
      max-width="374"
  >
    <template slot="progress">
      <v-progress-linear
          color="deep-purple"
          height="10"
          indeterminate
      ></v-progress-linear>
    </template>

    <zaehlung-card-map
        :lat-lng-zaehlstelle="coordsZaehlstelle"
        :lat-lng-zaehlung="coordsZaehlung"
        :show-luftbild=true
    />

    <v-speed-dial
        v-model="fab"
        absolute
        top
        left
    >
      <template v-slot:activator>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-avatar v-bind="attrs" v-on="on"
                      :color="statusDesign.color"
                      size="56">
              <v-icon x-large>{{ statusDesign.iconPath }}</v-icon>
            </v-avatar>
          </template>
          <span>
          {{ statusDesign.tooltip }}
        </span>
        </v-tooltip>
      </template>
    </v-speed-dial>

    <div @click="openZaehlungDialog" :style="{cursor: 'pointer'}">

      <v-row>
        <v-col cols="12" md="8">
          <v-card-title>{{ title }}</v-card-title>
          <v-card-subtitle>
            Zählstellennummer: {{zaehlung.zaehlstelleNummer}}
            {{ datum }}
            <br/>
            </v-card-subtitle>
        </v-col>
        <v-col cols="12" md="4">
          <v-card-title>
            <zaehlung-geometrie
                height="60"
                width="60"
                activeColor="#1565C0"
                passiveColor="#EEEEEE"
                :knotenarme="zaehlung.knotenarme"
            ></zaehlung-geometrie>
          </v-card-title>
        </v-col>
      </v-row>

      <v-card-text>

        <v-row
            align="center"
            class="mx-0 mt-2"
            no-gutters>
          <v-spacer/>
          <v-col cols="12" md="1">
            <zaehlart-icon :zaehlart="zaehlung.zaehlart" :color="ICONCOLOR"></zaehlart-icon>
          </v-col>
          <v-spacer/>
          <v-col cols="12" md="1">
            <wetter-icon :wetter="zaehlung.wetter" :color="ICONCOLOR"></wetter-icon>
          </v-col>
          <v-spacer/>
          <v-col cols="12" md="1">
            <zaehldauer-icon :zaehldauer="zaehlung.zaehldauer" :color="ICONCOLOR"></zaehldauer-icon>
          </v-col>
          <v-spacer/>
          <v-col cols="12" md="1">
            <quelle-icon :quelle="zaehlung.quelle" :color="ICONCOLOR"></quelle-icon>
          </v-col>
          <v-spacer/>
        </v-row>

        <v-row
            align="center"
            class="mx-0 mt-2"
            no-gutters>
          <v-col md="12">
            <v-data-table
                dense
                :headers="streetsHeader"
                :items="streets"
                item-key="nummer"
                :items-per-page="-1"
                hide-default-footer
                fixed-header
            />
          </v-col>
        </v-row>
      </v-card-text>
    </div>

    <v-card-actions>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" v-if="showButtonAbschliessen"
                 class="ml-2 mr-2"
                 color="secondary"
                 @click="zaehlungAbschliessen">
            Abschließen
          </v-btn>
        </template>
        <span>
          Abschließen
        </span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" v-if="showButtonKorrektur"
                 class="ml-2 mr-2"
                 color="secondary"
                 @click="zaehlungKorrigieren">
            Korrigieren
          </v-btn>
        </template>
        <span>
          Korrigieren
        </span>
      </v-tooltip>

      <v-spacer/>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on"
                 class="ml-2 mr-2"
                 icon
                 color="secondary"
                 @click="openChatDialog">
            <v-badge v-if="zaehlung.unreadMessagesDienstleister"
                     dot
                     color="red"
            >
              <v-icon>mdi-tooltip-account</v-icon>
            </v-badge>
            <v-icon v-else>mdi-tooltip-account</v-icon>
          </v-btn>
        </template>
        <span>
          Chat
        </span>
      </v-tooltip>

      <v-menu
          top
          right
          offset-x
          offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
              color="black"
              icon
              v-bind="attrs"
              v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-row dense>
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on"
                       class="ml-2 mr-2"
                       icon
                       small
                       color="secondary"
                       @click="downloadDummyCsv">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
              <span>
                CSV-Muster herunterladen
              </span>
            </v-tooltip>
          </v-row>
        </v-list>
      </v-menu>

    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import ZaehlungCardMap from "@/components/map/ZaehlungCardMap.vue";
import {latLng, LatLng} from "leaflet";
import GeoPoint from "@/domain/GeoPoint";
import ZaehlartIcon from "@/components/icons/ZaehlartIcon.vue";
import WetterIcon from "@/components/icons/WetterIcon.vue";
import ZaehldauerIcon from "@/components/icons/ZaehldauerIcon.vue";
import QuelleIcon from "@/components/icons/QuelleIcon.vue";
import KnotenarmDTO from "@/domain/dto/KnotenarmDTO";
import KnotenarmComparator from "@/util/KnotenarmComparator";
import Status, {statusIcon} from "@/domain/enums/Status";
import ZaehlungGeometrie from "@/components/zaehlung/ZaehlungGeometrie.vue";
import IconOptions from "@/components/icons/IconOptions";
import _ from "lodash";
import ZaehlungService from "@/api/service/ZaehlungService";
import SavedDTO from "@/domain/dto/SavedDTO";
import {ApiError} from "@/api/error";
import UpdateStatusDTO from "@/domain/dto/UpdateStatusDTO";
import Zaehlart from "@/domain/enums/Zaehlart";
/* eslint-enable no-unused-vars */
@Component({
  components: {
    ZaehlungGeometrie,
    QuelleIcon,
    ZaehldauerIcon,
    WetterIcon,
    ZaehlartIcon,
    ZaehlungCardMap
  }
})
export default class ZaehlungCard extends Vue {

  private readonly ICONCOLOR: string = 'black';

  private fab: boolean = false;
  private loading: boolean = false;

  @Prop()
  private readonly zaehlung!: ZaehlungDTO;

  get getZaehlung(): ZaehlungDTO {
    return this.zaehlung;
  }

  get coordsZaehlstelle(): LatLng {
    return this.createLatLngFromString(this.zaehlung.zaehlstellePunkt.lat, this.zaehlung.zaehlstellePunkt.lon);
  }

  get coordsZaehlung(): LatLng {
    const geoPoint: GeoPoint = this.zaehlung.punkt;
    return this.createLatLngFromString(geoPoint.lat, geoPoint.lon);
  }

  get title(): string {
    return this.getZaehlung.projektName;
  }

  get datum(): string {
    return `${this.$d(new Date(this.getZaehlung.datum), 'short', 'de-DE')}`;
  }

  get streets(): Array<KnotenarmDTO> {
    const knotenarme: Array<KnotenarmDTO> = []
    Object.assign(knotenarme, this.getZaehlung.knotenarme)
    return knotenarme.sort(KnotenarmComparator.sortByNumber);
  }

  get streetsHeader(): Array<any> {
    return [
      {
        text: 'Nummer',
        align: 'center',
        sortable: false,
        value: 'nummer',
        divider: "true",
      },
      {
        text: 'Straßenname',
        align: 'center',
        sortable: false,
        value: 'strassenname',
      },
    ];
  }

  get statusDesign(): IconOptions {
    let design: IconOptions | undefined = statusIcon.get(this.zaehlung.status);
    if (!design) {
      design = {} as IconOptions;
      design.color = 'deep-orange lighten-4';
      design.iconPath = 'mdi-calendar-question';
      design.tooltip = 'Status unbekannt';
    }
    return design;
  }

  get showButtonKorrektur(): boolean {
    return this.hasUploadedFile && this.zaehlung.status === Status.CORRECTION;
  }

  get showButtonAbschliessen(): boolean {
    // Wenn alle Knotenarme einen Filename beinhalten, darf man diesen Button sehen
    return this.hasUploadedFile && this.zaehlung.status === Status.COUNTING;
  }

  // Erzeugt aus den String Koordinaten ein Objekt von Typ LatLng
  private createLatLngFromString(lat: string, lng: string): LatLng {
    return latLng(
        parseFloat(lat),
        parseFloat(lng)
    );
  }

  private zaehlungAbschliessen(): void {
    this.loading = true;
    // Wenn alle Knotenarme einen Filename beinhalten, darf man diesen Button drücken
    if (this.hasUploadedFile) {
      const updateZaehlung: UpdateStatusDTO = {} as UpdateStatusDTO;
      updateZaehlung.zaehlungId = this.zaehlung.id;
      updateZaehlung.status = Status.ACCOMPLISHED;
      ZaehlungService.updateStatus(updateZaehlung).then((savedDTO: SavedDTO) => {
        savedDTO.response = `Die Zählung vom ${this.datum} wurde an den Auftraggeber übermittelt.`
        this.$emit('saved', savedDTO);
      }).catch((error: ApiError) => {
        this.$store.dispatch('snackbar/showError', error);
      }).finally(() => {
        this.loading = false;
      });
    }
  }

  get hasUploadedFile(): boolean {
    let hasFile: boolean = false;
    this.getZaehlung.knotenarme.forEach((arm: KnotenarmDTO) => {
      hasFile = hasFile || (arm.filename != undefined && arm.filename.trim().length > 0);
    });
    return hasFile;
  }

  private zaehlungKorrigieren(): void {
    this.loading = true;
    if (this.hasUploadedFile) {
      const updateZaehlung: UpdateStatusDTO = {} as UpdateStatusDTO;
      updateZaehlung.zaehlungId = this.zaehlung.id;
      updateZaehlung.status = Status.ACCOMPLISHED;
      ZaehlungService.updateStatus(updateZaehlung).then((savedDTO: SavedDTO) => {
        savedDTO.response = `Die korrigierte Zählung vom ${this.datum} wurde an den Auftraggeber übermittelt.`
        this.$emit('saved', savedDTO);
      }).catch((error: ApiError) => {
        this.$store.dispatch('snackbar/showError', error);
      }).finally(() => {
        this.loading = false;
      });
    }
  }

  private openZaehlungDialog(): void {
    this.$store.dispatch("setZaehlung", _.cloneDeep(this.zaehlung));
    this.$emit('openZaehlungDialog');
  }

  private downloadDummyCsv(): void {
    // Beispiel: 62301Q_20210423_Knotenarm2.csv
    const zaehlstelleNummer: string = this.zaehlung.zaehlstelleNummer;
    const zaehlart: string = this.zaehlung.zaehlart === Zaehlart.N ? '' : this.zaehlung.zaehlart;
    let filename: string = `${zaehlstelleNummer}${zaehlart}_${this.zaehlung.datum.replace("-", "")}_Knotenarm_X.csv`

    let metaHeader: string = 'Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;\n';
    let metaData: string = `${zaehlstelleNummer};${zaehlart};${this.zaehlung.datum};<von-Knotenarmnr>;;;;;\n`;
    let zaehlungHeader: string = 'Intervallnummer;nach;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss\n';

    let csvContent = "data:text/csv;charset=utf-8,"
        + metaHeader
        + metaData
        + zaehlungHeader
    ;

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF

    link.click();
  }


  private openChatDialog() {
    this.$store.dispatch("setZaehlung", _.cloneDeep(this.zaehlung));
    // Lokal false setzen damit der Punkt verschwindet, innerhalb des ChatDialog wird die Zählung auch in der DB geupdated
    this.zaehlung.unreadMessagesDienstleister = false;
    this.$emit('openChatDialog');
  }

}
</script>
