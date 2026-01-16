import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Antd from "ant-design-vue"
import { requestPasswordReset } from "../../../api/auth"

import ForgotPasswordPage from "../ForgotPasswordPage.vue"

vi.mock("../../../api/auth", () => ({
  requestPasswordReset: vi.fn(() => Promise.resolve({ data: null })),
}))

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe("ForgotPasswordPage", () => {
  const mountForgot = () => {
    return mount(ForgotPasswordPage, {
      global: {
        plugins: [Antd],
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

  it("does not submit when account is empty", async () => {
    const wrapper = mountForgot()

    const button = wrapper.get("button")
    await button.trigger("click")

    await wrapper.vm.$nextTick()

    expect(requestPasswordReset).not.toHaveBeenCalled()
  })

  it("submits account to password reset API", async () => {
    const wrapper = mountForgot()

    const input = wrapper.find("input")
    await input.setValue("user@example.com")

    const button = wrapper.get("button")
    await button.trigger("click")

    await wrapper.vm.$nextTick()

    expect(requestPasswordReset).toHaveBeenCalledWith({
      account: "user@example.com",
    })
  })
})
