import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useChatStore = defineStore("chatStore", () => {
  // ref()s become state properties
  const notificationsEventSwitch = ref<boolean>(false);
  // computed()s become getters
  const getNotificationsEventSwitch = computed(
    () => notificationsEventSwitch.value
  );
  // function()s become actions
  function resetNotificationsEventSwitch() {
    notificationsEventSwitch.value = !notificationsEventSwitch.value;
  }

  return {
    getNotificationsEventSwitch,
    resetNotificationsEventSwitch,
  };
});
