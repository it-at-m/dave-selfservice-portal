<template>
    <v-sheet
        width="100%"
        :height="height"
        :max-height="height"
        class="overflow-y-auto"
    >
        <v-card-text>
            <h1>Hier kommen die Kontaktinfos rein</h1>
        </v-card-text>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class KontaktForm extends Vue {
    @Prop()
    readonly height!: string;
}
</script>