import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";

import { isEmpty } from "lodash";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useValidationStore = defineStore("validationStore", () => {
  const uploadedFileForKnotenarmnummerValid = ref<Map<number, boolean>>(
    new Map<number, boolean>()
  );

  const isSavingOfUploadedFilesPossible = computed(() => {
    const knotenarmValidationResults = Array.from(
      uploadedFileForKnotenarmnummerValid.value.values()
    );
    const isEveryKnotenarmValid = knotenarmValidationResults.every(
      (fileForKnotenarmnummerValid) => fileForKnotenarmnummerValid
    );
    return !isEmpty(knotenarmValidationResults) && isEveryKnotenarmValid;
  });

  function setValidationStatusForKnotenarm(
    knotenarm: KnotenarmDTO,
    isUploadedFileValid: boolean
  ) {
    uploadedFileForKnotenarmnummerValid.value.set(
      knotenarm.nummer,
      isUploadedFileValid
    );
  }

  function initUploadedFileForKnotenarmnummerValid(
    knotenarme: Array<KnotenarmDTO>
  ) {
    uploadedFileForKnotenarmnummerValid.value = new Map<number, boolean>();
    knotenarme.forEach((knotenarm) => {
      uploadedFileForKnotenarmnummerValid.value.set(knotenarm.nummer, false);
    });
  }

  return {
    setValidationStatusForKnotenarm,
    initUploadedFileForKnotenarmnummerValid,
    isSavingOfUploadedFilesPossible,
  };
});
