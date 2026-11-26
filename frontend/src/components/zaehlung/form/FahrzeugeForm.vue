<template>
  <v-sheet
    width="100%"
    :height="height"
    :max-height="height"
    class="overflow-y-auto"
  >
    <v-card-text>
      <v-row
        dense
        no-gutters
      >
        <v-col
          cols="12"
          sm="6"
        >
          <v-checkbox
            v-model="pkw"
            label="Personenkraftwagen (Pkw)"
            color="grey-darken-1"
            hide-details
            readonly
          />
          <v-checkbox
            v-model="lkw"
            label="Lastkraftwagen (Lkw)"
            color="grey-darken-1"
            hide-details
            readonly
          />
          <v-checkbox
            v-model="lz"
            label="Lastzüge (Lz)"
            color="grey-darken-1"
            hide-details
            readonly
            dense
          />
          <v-checkbox
            v-model="bus"
            label="Bus"
            color="grey-darken-1"
            hide-details
            readonly
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-checkbox
            v-model="krad"
            label="Krafträder (Krad)"
            color="grey-darken-1"
            hide-details
            readonly
          />
          <v-checkbox
            v-model="rad"
            label="Radverkehr"
            color="grey-darken-1"
            hide-details
            readonly
          />
          <v-checkbox
            v-model="fuss"
            label="Fußverkehr"
            color="grey-darken-1"
            hide-details
            readonly
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-sheet>
</template>

<script setup lang="ts">
import type { ExternalZaehlungDTO } from "@/api/client";

import { ref } from "vue";

import { Fahrzeug } from "@/api/client";

interface Props {
  height: string;
}
defineProps<Props>();

const zaehlung = defineModel<ExternalZaehlungDTO>({
  required: true,
});

const pkw = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Pkw) ?? false
);
const lkw = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Lkw) ?? false
);
const lz = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Lz) ?? false
);
const bus = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Bus) ?? false
);
const krad = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Krad) ?? false
);
const rad = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Rad) ?? false
);
const fuss = ref<boolean>(
  zaehlung.value.kategorien?.includes(Fahrzeug.Fuss) ?? false
);
</script>
