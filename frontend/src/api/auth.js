import request from "../utils/request"

export function login(data) {
  return request.post("/auth/login", data)
}

export function register(data) {
  return request.post("/auth/register", data)
}

export function sendLoginVerifyCode(data) {
  return request.post("/auth/login/verify-code", data)
}

export function getProfile() {
  return request.get("/users/profile")
}

export function updateProfile(data) {
  return request.put("/users/profile", data)
}

export function requestPasswordReset(data) {
  return request.post("/password-recovery/request", data)
}
