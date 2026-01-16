import { defineStore } from "pinia"

export const useLoginSessionStore = defineStore("loginSession", {
  state: () => ({
    username: "",
    password: "",
  }),
  actions: {
    setCredentials(payload) {
      this.username = payload.username
      this.password = payload.password
    },
    clear() {
      this.username = ""
      this.password = ""
    },
  },
})
