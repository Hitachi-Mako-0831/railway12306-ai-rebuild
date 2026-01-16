import { describe, it, expect, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import Antd from "ant-design-vue"
import { createPinia } from "pinia"
import { updateProfile } from "../../../api/auth"

import ProfilePage from "../ProfilePage.vue"

vi.mock("../../../api/auth", () => ({
  getProfile: vi.fn(() =>
    Promise.resolve({
      data: {
        code: 0,
        message: "ok",
        data: {
          username: "demo_user",
          real_name: "测试用户A",
          id_type: "id_card",
          id_number: "123456789012345678",
          phone: "13800138000",
          email: "demo@example.com",
          user_type: "adult",
        },
      },
    }),
  ),
  updateProfile: vi.fn(() =>
    Promise.resolve({
      data: {
        code: 0,
        message: "ok",
        data: {
          username: "demo_user",
          real_name: "测试用户B",
          id_type: "id_card",
          id_number: "123456789012345678",
          phone: "13800138000",
          email: "demo@example.com",
          user_type: "adult",
        },
      },
    }),
  ),
}))

describe("ProfilePage basic info and contact", () => {
  const mountProfile = async () => {
    const pinia = createPinia()

    const wrapper = mount(ProfilePage, {
      global: {
        plugins: [pinia, Antd],
        stubs: {
          Header12306: true,
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  it("renders username and masked id number", async () => {
    const wrapper = await mountProfile()

    const text = wrapper.text()
    expect(text).toContain("demo_user")
    expect(text).toContain("中国")
    expect(text).toContain("123************5678")
    expect(text).toContain("demo@example.com")
    expect(text).toContain("138****8000")
  })

  it("allows editing real_name only", async () => {
    const wrapper = await mountProfile()

    const editButton = wrapper.get("button[data-test='edit-basic']")
    await editButton.trigger("click")

    const nameInput = wrapper.get("input[data-test='real-name-input']")
    await nameInput.setValue("测试用户B")

    const saveButton = wrapper.get("button[data-test='save-basic']")
    await saveButton.trigger("click")

    await flushPromises()

    expect(updateProfile).toHaveBeenCalledWith({ real_name: "测试用户B" })
  })

  it("allows editing contact info", async () => {
    const wrapper = await mountProfile()

    const editButton = wrapper.get("button[data-test='edit-contact']")
    await editButton.trigger("click")

    const phoneInput = wrapper.find("input[placeholder='手机号']")
    const emailInput = wrapper.find("input[placeholder='邮箱']")

    if (phoneInput.exists()) {
      await phoneInput.setValue("13900139000")
    }
    if (emailInput.exists()) {
      await emailInput.setValue("new@example.com")
    }

    const saveButton = wrapper.get("button[data-test='save-contact']")
    await saveButton.trigger("click")

    await flushPromises()

    expect(updateProfile).toHaveBeenCalledWith({
      phone: "13900139000",
      email: "new@example.com",
    })
  })
})
