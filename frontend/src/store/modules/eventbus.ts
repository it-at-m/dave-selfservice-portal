export default {
  state: {
    changetabevent: 0,
    resetformevent: false,
  },
  getters: {
    getChangetabevent: (state: any) => {
      return state.changetabevent;
    },
    getResetformevent: (state: any) => {
      return state.resetformevent;
    }
  },
  mutations: {
    changetabevent(state: any, payload: number) {
      state.changetabevent = payload;
    },
    resetformevent(state: any, payload: boolean) {
      state.resetformevent = payload;
    }
  },
  actions: {
    setChangetabevent(context: any, payload: number) {
      context.commit('changetabevent', payload)
    },
    setResetformevent(context: any, payload: boolean) {
      context.commit('resetformevent', payload)
    }
  }
}