import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useSearchStore = defineStore("searchStore", () => {
    const searchResult = ref<Array<number>>([]);

    const lastSearchQuery = ref<string>("");

    const getSearchResult = computed(() => searchResult.value);

    const getLastSearchQuery = computed(() => lastSearchQuery.value);

    function setSearchResult(payload: Array<number>) {
        searchResult.value = payload;
    }
    function setLastSearchQuery(payload: string) {
        lastSearchQuery.value = payload;
    }

    return {
        getSearchResult,
        getLastSearchQuery,
        setSearchResult,
        setLastSearchQuery,
    };
});
