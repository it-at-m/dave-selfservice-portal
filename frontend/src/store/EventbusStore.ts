import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useEventbusStore = defineStore("eventbusStore", () => {
  const changeTabEvent = ref<number>(0);

  const resetFormEvent = ref<boolean>(false);

  const getGetChangeTabEvent = computed(() => changeTabEvent.value);

  const getResetFormEvent = computed(() => resetFormEvent.value);

  function setChangeTabEvent(payload: number) {
    changeTabEvent.value = payload;
  }
  function setResetFormEvent() {
    resetFormEvent.value = !resetFormEvent.value;
  }

  return {
    getGetChangeTabEvent,
    getResetFormEvent,
    setChangeTabEvent,
    setResetFormEvent,
  };
});
