import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"
import Antd from "ant-design-vue"

import RegisterPage from "../RegisterPage.vue"

vi.mock("../../../api/auth", () => ({
  register: vi.fn(() =>
    Promise.resolve({
      data: {
        code: 0,
        message: "ok",
        data: null,
      },
    }),
  ),
}))

describe("RegisterPage account info", () => {
  const mountRegister = async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/register", name: "Register", component: { template: "<div />" } },
        { path: "/login", name: "Login", component: { template: "<div />" } },
      ],
    })

    await router.push("/register")
    await router.isReady()

    return mount(RegisterPage, {
      global: {
        plugins: [Antd, router],
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

  it("shows password strength as weak for digits only", async () => {
    const wrapper = await mountRegister()

    const passwordInput = wrapper.find("input[placeholder='密码']")
    await passwordInput.setValue("123456")

    await wrapper.vm.$nextTick()

    const strengthText = wrapper.get("[data-test='password-strength-text']")
    expect(strengthText.text()).toContain("弱")
  })

  it("shows mismatch error when confirm password not equal", async () => {
    const wrapper = await mountRegister()

    const confirmRules = wrapper.vm.rules.confirmPassword
    const validator = confirmRules[1].validator

    await expect(validator({}, "Abc1234X")).rejects.toThrow(
      "两次输入密码不一致",
    )
  })

  it("shows error for invalid id card number", async () => {
    const wrapper = await mountRegister()

    const idRules = wrapper.vm.rules.idNumber
    const validator = idRules[1].validator

    await expect(validator({}, "12345")).rejects.toThrow(
      "请输入正确的身份证号码",
    )
  })
})
