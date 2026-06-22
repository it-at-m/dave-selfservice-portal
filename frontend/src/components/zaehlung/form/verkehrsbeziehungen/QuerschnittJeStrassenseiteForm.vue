<template>
  <v-sheet
      :width="width"
      :height="height"
      :max-height="height"
      color="transparent"
      class="d-flex flex-row justify-center overflow-y-auto"
  >
    <svg
        :height="height"
        :width="width"
        viewBox="0 0 1400 1400"
        preserveAspectRatio="xMidYMid"
        fill-rule="evenodd"
        stroke-width="28.222"
        stroke-linejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        xml:space="preserve"
    >
      <g
          id="querschnitt"
          :transform="rotateSvg"
      >
        <g id="description">
<!--          <g id="second_street">-->
<!--            <text-->
<!--                v-if="secondStreetname.length === 1"-->
<!--                id="singlerow2"-->
<!--                xml:space="preserve"-->
<!--                style="-->
<!--                font-style: normal;-->
<!--                font-variant: normal;-->
<!--                font-weight: normal;-->
<!--                font-stretch: normal;-->
<!--                font-size: 33.4058px;-->
<!--                font-family: sans-serif;-->
<!--                font-variant-ligatures: normal;-->
<!--                font-variant-caps: normal;-->
<!--                font-variant-numeric: normal;-->
<!--                font-variant-east-asian: normal;-->
<!--                text-align: start;-->
<!--                writing-mode: rl-tb;-->
<!--                direction: rtl;-->
<!--                text-anchor: start;-->
<!--                fill: #000000;-->
<!--                stroke-width: 39.1848;-->
<!--              "-->
<!--                x="1332.2212"-->
<!--                y="712.01141"-->
<!--            >-->
<!--              <tspan-->
<!--                  id="tspan21"-->
<!--                  style="stroke-width: 38.9194; unicode-bidi: plaintext"-->
<!--                  x="1332.2212"-->
<!--                  y="712.01141"-->
<!--              >-->
<!--                {{ secondStreetname[0] }}-->
<!--              </tspan>-->
<!--            </text>-->
<!--            <text-->
<!--                v-if="secondStreetname.length === 2"-->
<!--                id="multirow2"-->
<!--                xml:space="preserve"-->
<!--                style="-->
<!--                font-style: normal;-->
<!--                font-variant: normal;-->
<!--                font-weight: normal;-->
<!--                font-stretch: normal;-->
<!--                font-size: 33.4058px;-->
<!--                font-family: sans-serif;-->
<!--                font-variant-ligatures: normal;-->
<!--                font-variant-caps: normal;-->
<!--                font-variant-numeric: normal;-->
<!--                font-variant-east-asian: normal;-->
<!--                text-align: start;-->
<!--                writing-mode: rl-tb;-->
<!--                direction: rtl;-->
<!--                text-anchor: start;-->
<!--                fill: #000000;-->
<!--                stroke-width: 39.1848;-->
<!--              "-->
<!--                y="691.19336"-->
<!--                x="1332.2212"-->
<!--            >-->
<!--              <tspan-->
<!--                  id="tspan17"-->
<!--                  style="stroke-width: 39.1848; unicode-bidi: plaintext"-->
<!--                  x="1332.2212"-->
<!--                  y="691.19336"-->
<!--              >-->
<!--                {{ secondStreetname[0] }}-->
<!--              </tspan>-->
<!--              <tspan-->
<!--                  id="tspan18"-->
<!--                  style="stroke-width: 39.1848; unicode-bidi: plaintext"-->
<!--                  x="1332.2212"-->
<!--                  y="732.95062"-->
<!--              >-->
<!--                {{ secondStreetname[1] }}-->
<!--              </tspan>-->
<!--            </text>-->
<!--          </g>-->
          <g id="second_number">
            <ellipse
                id="ellipse13"
                style="
                fill: none;
                fill-opacity: 1;
                stroke: #000000;
                stroke-width: 1.02435;
                stroke-dasharray: none;
                stroke-opacity: 1;
              "
                cx="924"
                cy="700"
                rx="20.487822"
                ry="20.487823"
            />
            <text
                id="text14"
                xml:space="preserve"
                style="
                font-size: 33.4058px;
                font-family: sans-serif;
                text-align: start;
                writing-mode: lr-tb;
                direction: ltr;
                text-anchor: start;
                fill: #000000;
                stroke-width: 52.2711;
              "
                x="913.19183"
                y="711.73895"
            >
              <tspan
                  id="tspan14"
                  x="913.19183"
                  y="711.73895"
                  style="stroke-width: 52.2711"
              >
                {{ secondNode?.nummer }}
              </tspan>
            </text>
          </g>
<!--          <g id="first_street">-->
<!--            <text-->
<!--                v-if="firstStreetname.length === 1"-->
<!--                id="singlerow"-->
<!--                xml:space="preserve"-->
<!--                style="-->
<!--                font-style: normal;-->
<!--                font-variant: normal;-->
<!--                font-weight: normal;-->
<!--                font-stretch: normal;-->
<!--                font-size: 33.4058px;-->
<!--                font-family: sans-serif;-->
<!--                font-variant-ligatures: normal;-->
<!--                font-variant-caps: normal;-->
<!--                font-variant-numeric: normal;-->
<!--                font-variant-east-asian: normal;-->
<!--                text-align: start;-->
<!--                writing-mode: lr-tb;-->
<!--                direction: ltr;-->
<!--                text-anchor: start;-->
<!--                fill: #000000;-->
<!--                stroke-width: 39.1848;-->
<!--              "-->
<!--                x="68.368858"-->
<!--                y="712.17938"-->
<!--            >-->
<!--              <tspan-->
<!--                  id="tspan15"-->
<!--                  style="stroke-width: 39.1848"-->
<!--                  x="68.368858"-->
<!--                  y="712.17938"-->
<!--              >-->
<!--                {{ firstStreetname[0] }}-->
<!--              </tspan>-->
<!--            </text>-->
<!--            <text-->
<!--                v-if="firstStreetname.length === 2"-->
<!--                id="multirow"-->
<!--                xml:space="preserve"-->
<!--                style="-->
<!--                font-style: normal;-->
<!--                font-variant: normal;-->
<!--                font-weight: normal;-->
<!--                font-stretch: normal;-->
<!--                font-size: 33.4058px;-->
<!--                font-family: sans-serif;-->
<!--                font-variant-ligatures: normal;-->
<!--                font-variant-caps: normal;-->
<!--                font-variant-numeric: normal;-->
<!--                font-variant-east-asian: normal;-->
<!--                text-align: start;-->
<!--                writing-mode: lr-tb;-->
<!--                direction: ltr;-->
<!--                text-anchor: start;-->
<!--                fill: #000000;-->
<!--                stroke-width: 39.1848;-->
<!--              "-->
<!--                x="68.368858"-->
<!--                y="691.19336"-->
<!--            >-->
<!--              <tspan-->
<!--                  id="tspan20"-->
<!--                  style="stroke-width: 39.1848"-->
<!--                  x="68.368858"-->
<!--                  y="691.19336"-->
<!--              >-->
<!--                {{ firstStreetname[0] }}-->
<!--              </tspan>-->
<!--              <tspan-->
<!--                  id="tspan1"-->
<!--                  style="stroke-width: 39.1848"-->
<!--                  x="68.368858"-->
<!--                  y="732.95062"-->
<!--              >-->
<!--                {{ firstStreetname[1] }}-->
<!--              </tspan>-->
<!--            </text>-->
<!--          </g>-->
          <g id="first_number">
            <ellipse
                id="ellipse3"
                style="
                fill: none;
                fill-opacity: 1;
                stroke: #000000;
                stroke-width: 1.02435;
                stroke-dasharray: none;
                stroke-opacity: 1;
              "
                cx="476"
                cy="700"
                rx="20.487822"
                ry="20.487823"
            />
            <text
                id="text2"
                xml:space="preserve"
                style="
                font-size: 33.4058px;
                font-family: sans-serif;
                text-align: start;
                writing-mode: lr-tb;
                direction: ltr;
                text-anchor: start;
                fill: #000000;
                stroke-width: 52.2711;
              "
                y="711.73895"
                x="465.80084"
            >
              <tspan
                  id="tspan2"
                  style="stroke-width: 52.2711"
                  x="465.80084"
                  y="711.73895"
              >
                {{ firstNode?.nummer }}
              </tspan>
            </text>
          </g>
        </g>
        <g id="arrows">
          <g
              id="arrow4"
              style="cursor: pointer"
              @click="handleClickOnQuerschnittsverkehrJeStrassenseiteArrowFour()"
          >
            <path
                id="path4"
                :fill="calculateColorOfVerkehrsbeziehungArrowFour()"
                d="m 69.999999,860.99999 v -28 H 1330 v 27.997 z"
            />
            <path
                id="spike4"
                :fill="calculateColorOfVerkehrsbeziehungArrowFour()"
                d="m 15265.992,17469.828 -304.316,176.002 -0.265,-351.547 z"
                transform="matrix(0.09192953,0,0,0.07964786,-38.395512,-544.45264)"
            />
          </g>
          <g
              id="arrow3"
              style="cursor: pointer"
              @click="handleClickOnQuerschnittsverkehrJeStrassenseiteArrowThree()"
          >
            <path
                id="path3"
                :fill="calculateColorOfVerkehrsbeziehungArrowThree()"
                d="m 69.999999,804.99999 v -28 H 1330 v 27.997 z"
            />
            <path
                id="spike3"
                :fill="calculateColorOfVerkehrsbeziehungArrowThree()"
                d="m 15265.992,17469.828 -304.316,176.002 -0.265,-351.547 z"
                transform="matrix(-0.09192953,0,0,-0.07964786,1438.3955,2182.4526)"
            />
          </g>
          <g
              id="arrow2"
              style="cursor: pointer"
              @click="handleClickOnQuerschnittsverkehrJeStrassenseiteArrowTwo()"
          >
            <path
                id="path2"
                :fill="calculateColorOfVerkehrsbeziehungArrowTwo()"
                d="M 69.999999,623 V 595 H 1330 v 27.997 z"
            />
            <path
                id="spike2"
                :fill="calculateColorOfVerkehrsbeziehungArrowTwo()"
                d="m 15265.992,17469.828 -304.316,176.002 -0.265,-351.547 z"
                transform="matrix(0.09192953,0,0,0.07964786,-38.395512,-782.45264)"
            />
          </g>
          <g
              id="arrow1"
              style="cursor: pointer"
              @click="handleClickOnQuerschnittsverkehrJeStrassenseiteArrowOne()"
          >
            <path
                id="path1"
                :fill="calculateColorOfVerkehrsbeziehungArrowOne()"
                d="M 69.999999,567 V 539 H 1330 v 27.998 z"
            />
            <path
                id="spike1"
                :fill="calculateColorOfVerkehrsbeziehungArrowOne()"
                d="m 15265.992,17469.828 -304.316,176.002 -0.265,-351.547 z"
                transform="matrix(-0.09192953,0,0,-0.07964786,1438.3955,1944.4526)"
            />
          </g>
        </g>
      </g>
    </svg>
  </v-sheet>
</template>

<script setup lang="ts">
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";

import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { cloneDeep, first, last, toArray } from "lodash";
import { computed, onMounted, ref, watch } from "vue";

import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import KnotenarmComparator from "@/util/KnotenarmComparator";
import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";

interface Props {
  height: string;
  width: string;
}
defineProps<Props>();

const zaehlung = defineModel<ZaehlungDTO>("zaehlung", {
  required: true,
});

const activeColor = "#D50000";
const passiveColor = "#9E9E9E";

const selectedVerkehrsbeziehungen = computed(() => {
  return zaehlung.value.verkehrsbeziehungen;
});

const firstStreetname = ref<Array<string>>([]);
const secondStreetname = ref<Array<string>>([]);

const availableNodeNumbers = computed(() => {
  return availableNodes.value.map((arm) => arm.nummer);
});
const availableNodes = computed(() => {
  return zaehlung.value.knotenarme
      .toSorted(KnotenarmComparator.sortByNumber)
      .reverse();
});

const firstNode = computed(() => {
  return first(availableNodes.value);
});
const secondNode = computed(() => {
  return last(availableNodes.value);
});
const rotateSvg = computed(() => {
  // Die Viewbox der SVG liegt bei 1400 1400. Die Rotation muss in deren Zentrum stattfinden, daher 700 700
  let rotation = "rotate(0,700,700)";
  if (availableNodeNumbers.value.includes(1)) {
    rotation = "rotate(-90,700,700)";
  }
  if (availableNodeNumbers.value.includes(2)) {
    rotation = "rotate(0,700,700)";
  }
  if (availableNodeNumbers.value.includes(5)) {
    rotation = "rotate(-45,700,700)";
  }
  if (availableNodeNumbers.value.includes(6)) {
    rotation = "rotate(45,700,700)";
  }
  return rotation;
});

function createVerkehrsbeziehungArrowOne(): VerkehrsbeziehungDTO {
  const verkehrsbeziehung = {} as VerkehrsbeziehungDTO;
  if (availableNodeNumbers.value.includes(1)) {
    verkehrsbeziehung.von = 1;
    verkehrsbeziehung.nach = 3;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.W;
  }
  if (availableNodeNumbers.value.includes(2)) {
    verkehrsbeziehung.von = 2;
    verkehrsbeziehung.nach = 4;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.N;
  }
  if (availableNodeNumbers.value.includes(5)) {
    verkehrsbeziehung.von = 5;
    verkehrsbeziehung.nach = 7;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.NW;
  }
  if (availableNodeNumbers.value.includes(6)) {
    verkehrsbeziehung.von = 6;
    verkehrsbeziehung.nach = 8;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.NO;
  }
  return verkehrsbeziehung;
}

function createVerkehrsbeziehungArrowTwo(): VerkehrsbeziehungDTO {
  const verkehrsbeziehung = {} as VerkehrsbeziehungDTO;
  if (availableNodeNumbers.value.includes(1)) {
    verkehrsbeziehung.von = 3;
    verkehrsbeziehung.nach = 1;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.W;
  }
  if (availableNodeNumbers.value.includes(2)) {
    verkehrsbeziehung.von = 4;
    verkehrsbeziehung.nach = 2;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.N;
  }
  if (availableNodeNumbers.value.includes(5)) {
    verkehrsbeziehung.von = 7;
    verkehrsbeziehung.nach = 5;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.NW;
  }
  if (availableNodeNumbers.value.includes(6)) {
    verkehrsbeziehung.von = 8;
    verkehrsbeziehung.nach = 6;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.NO;
  }
  return verkehrsbeziehung;
}

function createVerkehrsbeziehungArrowThree(): VerkehrsbeziehungDTO {
  const verkehrsbeziehung = {} as VerkehrsbeziehungDTO;
  if (availableNodeNumbers.value.includes(1)) {
    verkehrsbeziehung.von = 1;
    verkehrsbeziehung.nach = 3;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.O;
  }
  if (availableNodeNumbers.value.includes(2)) {
    verkehrsbeziehung.von = 2;
    verkehrsbeziehung.nach = 4;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.S;
  }
  if (availableNodeNumbers.value.includes(5)) {
    verkehrsbeziehung.von = 5;
    verkehrsbeziehung.nach = 7;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.SO;
  }
  if (availableNodeNumbers.value.includes(6)) {
    verkehrsbeziehung.von = 6;
    verkehrsbeziehung.nach = 8;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.SW;
  }
  return verkehrsbeziehung;
}

function createVerkehrsbeziehungArrowFour(): VerkehrsbeziehungDTO {
  const verkehrsbeziehung = {} as VerkehrsbeziehungDTO;
  if (availableNodeNumbers.value.includes(1)) {
    verkehrsbeziehung.von = 3;
    verkehrsbeziehung.nach = 1;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.O;
  }
  if (availableNodeNumbers.value.includes(2)) {
    verkehrsbeziehung.von = 4;
    verkehrsbeziehung.nach = 2;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.S;
  }
  if (availableNodeNumbers.value.includes(5)) {
    verkehrsbeziehung.von = 7;
    verkehrsbeziehung.nach = 5;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.SO;
  }
  if (availableNodeNumbers.value.includes(6)) {
    verkehrsbeziehung.von = 8;
    verkehrsbeziehung.nach = 6;
    verkehrsbeziehung.strassenseite = Himmelsrichtung.SW;
  }
  return verkehrsbeziehung;
}

function handleClickOnQuerschnittsverkehrJeStrassenseiteArrowOne() {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowOne();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  const verkehrsbeziehungen = toArray(
      cloneDeep(selectedVerkehrsbeziehungen.value)
  );

  if (index >= 0) {
    verkehrsbeziehungen.splice(index, 1);
  } else {
    verkehrsbeziehungen.push(verkehrsbeziehung);
  }

  zaehlung.value.verkehrsbeziehungen = verkehrsbeziehungen;
}

function handleClickOnQuerschnittsverkehrJeStrassenseiteArrowTwo() {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowTwo();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  const verkehrsbeziehungen = toArray(
      cloneDeep(selectedVerkehrsbeziehungen.value)
  );

  if (index >= 0) {
    verkehrsbeziehungen.splice(index, 1);
  } else {
    verkehrsbeziehungen.push(verkehrsbeziehung);
  }

  zaehlung.value.verkehrsbeziehungen = verkehrsbeziehungen;
}

function handleClickOnQuerschnittsverkehrJeStrassenseiteArrowThree() {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowThree();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  const verkehrsbeziehungen = toArray(
      cloneDeep(selectedVerkehrsbeziehungen.value)
  );

  if (index >= 0) {
    verkehrsbeziehungen.splice(index, 1);
  } else {
    verkehrsbeziehungen.push(verkehrsbeziehung);
  }

  zaehlung.value.verkehrsbeziehungen = verkehrsbeziehungen;
}

function handleClickOnQuerschnittsverkehrJeStrassenseiteArrowFour() {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowFour();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  const verkehrsbeziehungen = toArray(
      cloneDeep(selectedVerkehrsbeziehungen.value)
  );

  if (index >= 0) {
    verkehrsbeziehungen.splice(index, 1);
  } else {
    verkehrsbeziehungen.push(verkehrsbeziehung);
  }

  zaehlung.value.verkehrsbeziehungen = verkehrsbeziehungen;
}

function findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
    clickedVerkehrsbeziehung: VerkehrsbeziehungDTO
) {
  return selectedVerkehrsbeziehungen.value.findIndex(
      (verkehrsbeziehung: VerkehrsbeziehungDTO) => {
        return (
            verkehrsbeziehung.von === clickedVerkehrsbeziehung.von &&
            verkehrsbeziehung.nach === clickedVerkehrsbeziehung.nach &&
            verkehrsbeziehung.strassenseite ===
            clickedVerkehrsbeziehung.strassenseite
        );
      }
  );
}

onMounted(() => {
  resetForm();
  prepareStreetnames();
});

watch(
    () => zaehlung.value.knotenarme,
    () => {
      resetForm();
      prepareStreetnames();
    },
    { deep: true, immediate: true }
);

function calculateColorOfVerkehrsbeziehungArrowOne(): string | undefined {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowOne();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  let color = passiveColor;

  if (index >= 0) {
    color = activeColor;
  }

  return color;
}

function calculateColorOfVerkehrsbeziehungArrowTwo(): string | undefined {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowTwo();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  let color = passiveColor;

  if (index >= 0) {
    color = activeColor;
  }

  return color;
}

function calculateColorOfVerkehrsbeziehungArrowThree(): string | undefined {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowThree();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  let color = passiveColor;

  if (index >= 0) {
    color = activeColor;
  }

  return color;
}

function calculateColorOfVerkehrsbeziehungArrowFour(): string | undefined {
  const verkehrsbeziehung = createVerkehrsbeziehungArrowFour();

  const index =
      findIndexInSelectedVerkehrsbeziehungForClickedVerkehrsbeziehung(
          verkehrsbeziehung
      );

  let color = passiveColor;

  if (index >= 0) {
    color = activeColor;
  }

  return color;
}

function resetForm(): void {
  firstStreetname.value = [];
  secondStreetname.value = [];
}

function prepareStreetnames(): void {
  firstStreetname.value = getStreetname(firstNode.value);
  secondStreetname.value = getStreetname(secondNode.value);
}

function getStreetname(knotenarm: KnotenarmDTO | undefined): Array<string> {
  let strasse = "";
  if (knotenarm && knotenarm.strassenname) {
    strasse = knotenarm.strassenname;
  }
  let pieces = [strasse];
  const zeichen = strasse.length;
  // Anzahl Zeichen
  if (zeichen > 17) {
    pieces = ["", ""];
    if (strasse.endsWith("str.")) {
      const index = strasse.indexOf("str.");
      pieces[0] = strasse.substring(0, zeichen - 4);
      pieces[1] = strasse.substring(index, 4);
    }
    // Platz
    if (strasse.endsWith("pl.")) {
      const index = strasse.indexOf("pl.");
      pieces[0] = strasse.substring(0, zeichen - 3);
      pieces[1] = strasse.substring(index, 3);
    }
    // Bindestrich
    if (strasse.includes("-")) {
      // pieces = strasse.split(trenner);
      const index = strasse.indexOf("-");
      pieces[0] = strasse.substring(0, index + 1);
      pieces[1] = strasse.substring(index + 1);
    }
    // Leerzeichen
    else if (strasse.includes(" ")) {
      const index = strasse.indexOf(" ");
      pieces[0] = strasse.substring(0, index + 1);
      pieces[1] = strasse.substring(index + 1);
    }
  }
  return pieces;
}
</script>

<style scoped>
/* SVG komplett un-klickbar machen (keine Click/Hover/Pointer-Ereignisse) */
svg {
  pointer-events: none;
}
</style>