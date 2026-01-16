import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"
import Antd from "ant-design-vue"
import { login } from "../../../api/auth"

import LoginPage from "../LoginPage.vue"

vi.mock("../../../api/auth", () => ({
  login: vi.fn(() =>
    Promise.resolve({
      data: {
        code: 0,
        message: "ok",
        data: {
          token: "test-token",
          user: {
            username: "test",
            real_name: "测试用户",
            id_type: "id_card",
            id_number: "123456789012345678",
            phone: "13800138000",
            email: "test@example.com",
            user_type: "adult",
          },
        },
      },
    }),
  ),
}))

describe("LoginPage", () => {
  const mountLogin = async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/login", name: "Login", component: { template: "<div />" } },
        {
          path: "/user",
          name: "UserWelcome",
          component: { template: "<div />" },
        },
      ],
    })

    await router.push("/login")
    await router.isReady()

    return mount(LoginPage, {
      global: {
        plugins: [Antd, pinia, router],
        stubs: {
          Header12306: true,
          LoginFooter: true,
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    })
  }

  it("renders account and qrcode tabs", async () => {
    const wrapper = await mountLogin()
    const text = wrapper.text()
    expect(text).toContain("账号登录")
    expect(text).toContain("扫码登录")
  })

  it("validates empty fields on submit", async () => {
    const wrapper = await mountLogin()

    const button = wrapper.get("button")
    await button.trigger("click")

    await wrapper.vm.$nextTick()

    expect(login).not.toHaveBeenCalled()
  })
})
