import axios from "axios"

const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token")
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default instance
