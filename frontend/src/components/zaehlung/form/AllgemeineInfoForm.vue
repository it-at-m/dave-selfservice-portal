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
          md="4"
        >
          <lhm-text-field
            caption="Projektnummer"
            :text="zaehlung.projektNummer"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <lhm-text-field
            caption="Projektname"
            :text="zaehlung.projektName"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <lhm-text-field
            caption="Sonderzählung"
            :text="getSonderzaehlungText"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="12"
          md="4"
        >
          <v-menu
            v-if="isZaehlungInstructed"
            v-model="datepickerMenuModel"
            :close-on-content-click="false"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="formattedDate"
                prepend-inner-icon="mdi-calendar"
                readonly
              />
            </template>
            <v-card>
              <v-card-text>
                <v-row style="justify-content: center">
                  <v-date-picker
                    v-model="datepickerModel"
                    width="300"
                    hide-header
                    border
                    show-adjacent-months
                    color="primary"
                  />
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  text="OK"
                  color="secondary"
                  variant="elevated"
                  @click="saveDate"
                />
                <v-btn
                  text="Abbrechen"
                  color="grey-lighten-1"
                  variant="elevated"
                  @click="closeMenu"
                />
              </v-card-actions>
            </v-card>
          </v-menu>
          <lhm-text-field
            v-else
            caption="Zählung am"
            :text="formattedDateAsText"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <lhm-text-field
            caption="Zähldauer"
            :text="getZaehldauer"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <lhm-text-field
            caption="Zählintervall"
            :text="getZaehlintervall"
          />
        </v-col>
        <v-spacer />
      </v-row>
      <v-row dense>
        <v-col
          cols="12"
          md="4"
        >
          <v-autocomplete
            v-if="isZaehlungInstructed"
            v-model="zaehlung.zaehlart"
            :items="getZaehlarten"
            label="Zählart"
            required
          />
          <lhm-text-field
            v-else
            caption="Zählart"
            :text="getZaehlart"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <lhm-text-field
            caption="Quelle"
            :text="getQuelle"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-autocomplete
            v-model="zaehlung.wetter"
            :items="getWetter"
            label="Wetter"
            :disabled="isZaehlungReadonly"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="12"
          md="12"
        >
          <v-textarea
            v-model="zaehlung.kommentar"
            label="Kommentar"
            rows="2"
            row-height="10"
            counter="255"
            maxlength="255"
            readonly
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="12"
          md="12"
        >
          <v-textarea
            v-model="zaehlung.zaehlsituation"
            label="Zählsituation"
            rows="2"
            row-height="10"
            counter="255"
            maxlength="255"
            :disabled="isZaehlungReadonly"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="12"
          md="12"
        >
          <v-textarea
            v-model="zaehlung.zaehlsituationErweitert"
            label="erweiterte Zählsituation"
            rows="2"
            row-height="10"
            counter="255"
            maxlength="255"
            :disabled="isZaehlungReadonly"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-sheet>
</template>

<script setup lang="ts">
import type KeyVal from "@/types/common/KeyVal";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { computed, onMounted, ref } from "vue";

import LhmTextField from "@/components/common/LhmTextField.vue";
import { quelleText } from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import { wetterDropDown } from "@/types/enum/Wetter";
import { zaehlartenDropDown, zaehlartText } from "@/types/enum/Zaehlart";
import { zaehldauerText } from "@/types/enum/Zaehldauer";
import { useDateUtils } from "@/util/DateUtils";

interface Props {
  height: string;
}

defineProps<Props>();

const datepickerMenuModel = ref<boolean>(false);
const datepickerModel = ref<Date>(new Date());

const dateUtils = useDateUtils();

onMounted(() => {
  resetDatum();
});

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const getSonderzaehlungText = computed<string>(() => {
  return zaehlung.value.sonderzaehlung ? "Ja" : "Nein";
});

const getZaehldauer = computed<string | undefined>(() => {
  return zaehldauerText.get(zaehlung.value.zaehldauer);
});

const getQuelle = computed<string | undefined>(() => {
  return quelleText.get(zaehlung.value.quelle);
});

const getZaehlintervall = computed<string>(() => {
  return `${zaehlung.value.zaehlIntervall} min`;
});

const getWetter = computed<Array<KeyVal>>(() => {
  return wetterDropDown;
});

const getZaehlarten = computed<Array<KeyVal>>(() => {
  return zaehlartenDropDown;
});

const isZaehlungReadonly = computed<boolean>(() => {
  return ![Status.COUNTING, Status.CORRECTION].includes(zaehlung.value.status);
});

const formattedDate = computed(() => {
  return datepickerModel.value.toLocaleDateString();
});

const isZaehlungInstructed = computed<boolean>(() => {
  return zaehlung.value.status === Status.INSTRUCTED;
});

const formattedDateAsText = computed<string>(() => {
  return dateUtils.formatDate(zaehlung.value.datum);
});

const getZaehlart = computed<string | undefined>(() => {
  return zaehlartText.get(zaehlung.value.zaehlart);
});

function resetDatum(): void {
  datepickerModel.value = dateUtils.getDatumOfString(zaehlung.value.datum);
}

function saveDate(): void {
  datepickerMenuModel.value = false;
  zaehlung.value.datum = dateUtils.formatDateForBackend(datepickerModel.value);
}

function closeMenu(): void {
  datepickerMenuModel.value = false;
  resetDatum();
}
</script>
