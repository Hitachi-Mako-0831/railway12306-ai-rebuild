import { describe, it, expect } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"

import Header12306 from "../Header12306.vue"
import { useUserStore } from "../../stores/user"

const createWrapper = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/login", name: "Login", component: { template: "<div />" } },
      {
        path: "/user/profile",
        name: "UserProfile",
        component: { template: "<div />" },
      },
    ],
  })

  await router.push("/user/profile")
  await router.isReady()

  const userStore = useUserStore()
  userStore.isAuthenticated = true
  userStore.profile = {
    username: "demo_user",
    real_name: "测试用户A",
  }

  const wrapper = mount(Header12306, {
    global: {
      plugins: [pinia, router],
    },
  })

  return { wrapper, router, userStore }
}

describe("Header12306 user status", () => {
  it("toggles between unauth and auth states based on store", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: "/", name: "Home", component: { template: "<div />" } }],
    })

    await router.push("/")
    await router.isReady()

    const userStore = useUserStore()
    userStore.isAuthenticated = false

    const wrapper = mount(Header12306, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain("登录")
    expect(wrapper.text()).toContain("注册")

    userStore.isAuthenticated = true
    userStore.profile = { username: "demo_user" }
    await wrapper.vm.$forceUpdate?.()
    await flushPromises()

    expect(wrapper.text()).toContain("欢迎您")
  })

  it("shows login/register links when not authenticated", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/login", name: "Login", component: { template: "<div />" } },
        {
          path: "/register",
          name: "Register",
          component: { template: "<div />" },
        },
      ],
    })

    await router.push("/")
    await router.isReady()

    const wrapper = mount(Header12306, {
      global: {
        plugins: [pinia, router],
      },
    })

    const text = wrapper.text()
    expect(text).toContain("登录")
    expect(text).toContain("注册")
  })

  it("shows logout button when authenticated", async () => {
    const { wrapper } = await createWrapper()

    const text = wrapper.text()
    expect(text).toContain("欢迎您")
    expect(text).toContain("我的12306")
  })

  it("clears user store and redirects to login on logout", async () => {
    const { wrapper, router, userStore } = await createWrapper()

    const entry = wrapper.get(".user-entry")
    await entry.trigger("mouseenter")
    await flushPromises()

    const button = wrapper.get("button[data-test='logout']")
    await button.trigger("click")
    await flushPromises()

    expect(userStore.isAuthenticated).toBe(false)
    expect(userStore.profile).toBeNull()
    expect(router.currentRoute.value.fullPath).toBe("/login")
  })
})
