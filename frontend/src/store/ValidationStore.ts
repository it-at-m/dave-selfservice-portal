import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";

import { defineStore } from "pinia";
import { computed, ref } from "vue";

import UploadedFileStatus from "@/types/enum/UploadedFileStatus";

export const useValidationStore = defineStore("validationStore", () => {
  const uploadedFileStatusByKnotenarm = ref<Map<number, UploadedFileStatus>>(
    new Map<number, UploadedFileStatus>()
  );

  const isSavingPossible = computed(() => {
    if (pendingUploadedFileReads.value > 0) {
      return false;
    }
    const statuses = Array.from(uploadedFileStatusByKnotenarm.value.values());
    const noFilesUploaded = statuses.every(
      (status) => status === UploadedFileStatus.MISSING
    );
    const everyFileIsValid = statuses.every(
      (status) => status === UploadedFileStatus.VALID
    );
    return noFilesUploaded || everyFileIsValid;
  });

  const pendingUploadedFileReads = ref<number>(0);
  const uploadedFilesChanged = ref<boolean>(false);

  /**
   * Setzt den UploadFileStatus (MISSING, VALID, INVALID) für den übergebenen Knotenarm in der
   * uploadedFileStatusByKnotenarm-Map.
   *
   * @param knotenarm dessen Status aktualisiert werden soll
   * @param status neuer Status des Knotenarms
   */
  function setUploadedFileStatus(
    knotenarm: KnotenarmDTO,
    status: UploadedFileStatus
  ) {
    uploadedFileStatusByKnotenarm.value.set(knotenarm.nummer, status);
  }

  /**
   * Initialisiert die uploadedFileStatusByKnotenarm-Map für alle Knotenarme der Zählung.
   * Wenn bereits Dateien hochgeladen wurden, wird der Status auf VALID gesetzt, sonst auf MISSING.
   *
   * @param knotenarme Array von KnotenarmDTOs der Zählung
   */
  function initUploadedFileStatus(knotenarme: Array<KnotenarmDTO>) {
    uploadedFileStatusByKnotenarm.value = new Map(
      knotenarme.map((knotenarm) => [
        knotenarm.nummer,
        knotenarm.filename?.trim()
          ? UploadedFileStatus.VALID
          : UploadedFileStatus.MISSING,
      ])
    );
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
    setUploadedFileStatus,
    initUploadedFileStatus,
    isSavingPossible,
    uploadedFilesChanged,
    startUploadedFileRead,
    finishUploadedFileRead,
    initPendingUploadedFileReads,
  };
});
