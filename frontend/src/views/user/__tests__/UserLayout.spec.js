import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"

import UserLayout from "../UserLayout.vue"
import UserWelcomePage from "../UserWelcomePage.vue"
import ProfilePage from "../ProfilePage.vue"

const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/user",
        component: UserLayout,
        children: [
          { path: "", name: "UserWelcome", component: UserWelcomePage },
          { path: "profile", name: "UserProfile", component: ProfilePage },
        ],
      },
    ],
  })
}

describe("UserLayout", () => {
  it("shows welcome page by default", async () => {
    const router = createTestRouter()
    await router.push("/user")
    await router.isReady()

    const wrapper = mount(UserLayout, {
      global: {
        plugins: [router],
        stubs: {
          Header12306: true,
        },
      },
    })

    expect(wrapper.text()).toContain("个人中心")
  })
})
