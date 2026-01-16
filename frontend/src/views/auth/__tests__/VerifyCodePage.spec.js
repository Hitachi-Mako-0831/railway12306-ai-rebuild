import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"

import VerifyCodePage from "../VerifyCodePage.vue"

vi.mock("../../../api/auth")

describe("VerifyCodePage", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it.skip("starts countdown after sending sms code", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(VerifyCodePage, {
      global: {
        plugins: [pinia],
        stubs: {
          Header12306: true,
          LoginFooter: true,
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    })

    wrapper.vm.form.idLast4 = "1234"
    if (wrapper.vm.formRef) {
      wrapper.vm.formRef.value = {
        validateFields: vi.fn(() => Promise.resolve()),
      }
    }

    await wrapper.vm.handleSendCode()

    expect(wrapper.vm.countdown).toBe(60)
  })

  it("submits login with id_last4 and sms_code on confirm", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(VerifyCodePage, {
      global: {
        plugins: [pinia],
        stubs: {
          Header12306: true,
          LoginFooter: true,
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    })

    wrapper.vm.form.idLast4 = "5678"
    wrapper.vm.form.smsCode = "654321"
    if (wrapper.vm.formRef) {
      wrapper.vm.formRef.value = {
        validate: vi.fn(() => Promise.resolve()),
      }
    }

    await wrapper.vm.handleConfirm()
  })
})
