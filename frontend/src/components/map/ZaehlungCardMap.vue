<template>
    <v-sheet
        :height="height"
        :width="width"
        :min-height="minheight"
    >
        <div
            id="cardmap"
            ref="cardmapRef"
            :style="mapStyle"
        />
    </v-sheet>
</template>

<script setup lang="ts">
import L, {
    CircleMarker,
    CircleMarkerOptions,
    Icon,
    LatLng,
    Marker,
    MarkerOptions,
} from "leaflet";
import {
    computed,
    ComputedRef,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import markerIconRed from "@/assets/marker-icon-red.png";
import { useEventbusStore } from "@/store/EventbusStore";

interface Props {
    height?: string;
    width?: string;
    minheight?: string;
    editZaehlungMarker?: boolean;
    showLuftbild: boolean;
    latLngZaehlstelle: LatLng;
    latLngZaehlung: LatLng;
}

const props = withDefaults(defineProps<Props>(), {
    height: "100%",
    width: "100%",
    minheight: "160px",
    editZaehlungMarker: false,
});

const mapAttribution =
    '&copy; <a href="https://stadt.muenchen.de/infos/geobasisdaten.html">GeodatenService München</a>';

const cardmapRef = ref<HTMLDivElement | null>(null);

let cardmap: L.Map;
let markerZaehlstelle: L.CircleMarker | null;
let markerZaehlung: L.Marker | null;

const eventbus = useEventbusStore();

watch(
    () => eventbus.getResetFormEvent,
    () => {
        resetMap();
    }
);

onMounted(() => {
    initMap();
});

onBeforeUnmount(() => {
    cardmap.remove();
});

function initMap(): void {
    cardmap = L.map(cardmapRef.value as HTMLElement, {
        minZoom: 10,
        maxZoom: 18,
        zoom: 16,
        preferCanvas: false,
        attributionControl: false,
        zoomControl: false,
        center: props.latLngZaehlstelle,
    });

    cardmap.whenReady(() => {
        setTimeout(() => {
            cardmap.invalidateSize();
            createLayersAndAddToMap();
            resetMap();
        }, 10);
    });
}

function createLayersAndAddToMap(): void {
    const baseLayers = createBaseLayers();
    baseLayers.BaseLayer.addTo(cardmap);
}

function createBaseLayers(): L.Control.LayersObject {
    const stadtkarteGesamt = L.tileLayer.wms(
        "https://geoportal.muenchen.de/geoserver/gsm/wms?",
        {
            layers: "gsm:g_stadtkarte_gesamt",
            className: "Stadtkarte",
            attribution: mapAttribution,
        }
    );

    const luftbild = L.tileLayer.wms(
        "https://geoportal.muenchen.de/geoserver/gsm/wms?",
        {
            layers: "gsm:g_luftbild",
            className: "Luftbild",
            attribution: mapAttribution,
        }
    );

    return {
        BaseLayer: props.showLuftbild ? luftbild : stadtkarteGesamt,
    };
}

function createMarkerForZaehlung(coords: LatLng) {
    const defaultIcon = new Icon.Default();
    defaultIcon.options.iconUrl = markerIconRed;

    const options: MarkerOptions = {} as MarkerOptions;
    options.opacity = 1.0;
    options.icon = defaultIcon;
    options.draggable = props.editZaehlungMarker;

    markerZaehlung = new Marker(coords, options);

    markerZaehlung.on("dragend", () => {
        if (markerZaehlung) updateZaehlungCoords(markerZaehlung.getLatLng());
    });

    markerZaehlung.addTo(cardmap);
}

function createMarkerForZaehlstelle(coords: LatLng) {
    const options: CircleMarkerOptions = {} as CircleMarkerOptions;
    options.opacity = 1.0;
    options.radius = 20;

    markerZaehlstelle = new CircleMarker(coords, options);

    markerZaehlstelle.bindTooltip("Zählstelle", {
        direction: "right",
        offset: [options.radius, 0],
    });
    markerZaehlstelle.addTo(cardmap);
}

// Wenn ein Marker existiert wird dieser gelöscht
function deleteMarkers() {
    if (markerZaehlstelle) {
        cardmap.removeLayer(markerZaehlstelle);
        markerZaehlstelle = null;
    }
    if (markerZaehlung) {
        cardmap.removeLayer(markerZaehlung);
        markerZaehlung = null;
    }
}

function resetMap() {
    deleteMarkers();
    if (props.latLngZaehlstelle) {
        createMarkerForZaehlstelle(props.latLngZaehlstelle);
    }
    if (props.latLngZaehlung) {
        createMarkerForZaehlung(props.latLngZaehlung);
    }
    cardmap.setView(props.latLngZaehlstelle, 16);
}

const emits = defineEmits<{
    (e: "updateZaehlungCoords", v: LatLng): void;
}>();

function updateZaehlungCoords(zaehlungCoords: LatLng) {
    if (props.editZaehlungMarker && zaehlungCoords) {
        emits("updateZaehlungCoords", zaehlungCoords);
    }
}

const mapStyle: ComputedRef<string> = computed(() => {
    return `height: ${props.height}; width: ${props.width}; min-height: ${props.minheight}; z-index: 1`;
});
</script>