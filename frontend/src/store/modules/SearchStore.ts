import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useSearchStore = defineStore("searchStore", () => {
    const changeTabEvent = ref<number>(0);

    const resetFormEvent = ref<boolean>(false);

    const getGetChangeTabEvent = computed(() => changeTabEvent.value);

    const getResetFormEvent = computed(() => resetFormEvent.value);

    function setChangeTabEvent(payload: number) {
        changeTabEvent.value = payload;
    }
    function setResetFormEvent(payload: boolean) {
        resetFormEvent.value = payload;
    }

    return {
        getGetChangeTabEvent,
        getResetFormEvent,
        setChangeTabEvent,
        setResetFormEvent,
    };
});
