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
    return (
      pendingUploadedFileReads.value === 0 &&
      !isEmpty(knotenarmValidationResults) &&
      isEveryKnotenarmValid
    );
  });

  const pendingUploadedFileReads = ref<number>(0);
  const uploadedFilesChanged = ref<boolean>(false);

  function setValidationStatusForKnotenarm(
    knotenarm: KnotenarmDTO,
    isUploadedFileValid: boolean
  ) {
    uploadedFileForKnotenarmnummerValid.value.set(
      knotenarm.nummer,
      isUploadedFileValid
    );
  }

  function initUploadedFilesForKnotenarme(knotenarme: Array<KnotenarmDTO>) {
    uploadedFileForKnotenarmnummerValid.value = new Map<number, boolean>();
    knotenarme.forEach((knotenarm) => {
      if (knotenarm.filename?.trim().length > 0) {
        uploadedFileForKnotenarmnummerValid.value.set(knotenarm.nummer, true);
      } else {
        uploadedFileForKnotenarmnummerValid.value.set(knotenarm.nummer, false);
      }
    });
  }

  function startUploadedFileRead() {
    pendingUploadedFileReads.value++;
  }

  function finishUploadedFileRead() {
    pendingUploadedFileReads.value = Math.max(
      0,
      pendingUploadedFileReads.value - 1
    );
  }

  function initPendingUploadedFileReads() {
    pendingUploadedFileReads.value = 0;
  }

  return {
    setValidationStatusForKnotenarm,
    initUploadedFilesForKnotenarme,
    isSavingOfUploadedFilesPossible,
    uploadedFilesChanged,
    startUploadedFileRead,
    finishUploadedFileRead,
    initPendingUploadedFileReads,
  };
});
