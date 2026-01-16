import { createRouter, createWebHistory } from "vue-router"

import LoginPage from "../views/auth/LoginPage.vue"
import RegisterPage from "../views/auth/RegisterPage.vue"
import ForgotPasswordPage from "../views/auth/ForgotPasswordPage.vue"
import VerifyCodePage from "../views/auth/VerifyCodePage.vue"
import NewPasswordPage from "../views/auth/NewPasswordPage.vue"
import DonePage from "../views/auth/DonePage.vue"
import UserLayout from "../views/user/UserLayout.vue"
import UserWelcomePage from "../views/user/UserWelcomePage.vue"
import ProfilePage from "../views/user/ProfilePage.vue"

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPasswordPage,
  },
  {
    path: "/verify-code",
    name: "VerifyCode",
    component: VerifyCodePage,
  },
  {
    path: "/new-password",
    name: "NewPassword",
    component: NewPasswordPage,
  },
  {
    path: "/done",
    name: "Done",
    component: DonePage,
  },
  {
    path: "/user",
    component: UserLayout,
    children: [
      {
        path: "",
        name: "UserWelcome",
        component: UserWelcomePage,
      },
      {
        path: "profile",
        name: "UserProfile",
        component: ProfilePage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
