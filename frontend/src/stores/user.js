import { defineStore } from "pinia"

export const useUserStore = defineStore("user", {
  state: () => ({
    isAuthenticated: false,
    profile: null,
  }),
  actions: {
    setAuthenticated(value) {
      this.isAuthenticated = value
    },
    setProfile(profile) {
      this.profile = profile
    },
    logout() {
      this.isAuthenticated = false
      this.profile = null
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("auth_token")
      }
    },
  },
  persist: true,
})
