import { defineStore } from "pinia";
import { ref } from "vue";

export const useKnotenarmFileStore = defineStore("knotenarmFileStore", () => {
  /** CSV-Inhalte der aktuellen Bearbeitung; jedes Arrayelement ist eine Zeile. */
  const filedataByKnotenarm = ref<Map<number, Array<string>>>(new Map());

  function getFiledata(nummer: number): Array<string> {
    return filedataByKnotenarm.value.get(nummer) ?? [];
  }

  function setFiledata(nummer: number, filedata: Array<string>) {
    filedataByKnotenarm.value.set(nummer, filedata);
  }

  function deleteFiledata(nummer: number) {
    filedataByKnotenarm.value.delete(nummer);
  }

  function reset() {
    filedataByKnotenarm.value = new Map();
  }

  return {
    filedataByKnotenarm,
    getFiledata,
    setFiledata,
    deleteFiledata,
    reset,
  };
});
