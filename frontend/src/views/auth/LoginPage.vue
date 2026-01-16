<template>
  <div class="login-page">
    <Header12306 />
    <div class="login-content">
      <a-card class="login-card">
        <a-tabs>
          <a-tab-pane key="account" tab="账号登录">
            <a-form
              ref="formRef"
              :model="form"
              :rules="rules"
              layout="vertical"
            >
              <a-form-item name="username" label="用户名/邮箱/手机号">
                <a-input
                  v-model:value="form.username"
                  placeholder="用户名/邮箱/手机号"
                >
                  <template #prefix>
                    <span class="input-icon">U</span>
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item name="password" label="密码">
                <a-input-password
                  v-model:value="form.password"
                  placeholder="密码"
                  :visibility-toggle="false"
                >
                  <template #prefix>
                    <span class="input-icon">P</span>
                  </template>
                </a-input-password>
              </a-form-item>
              <a-form-item>
                <a-button
                  type="primary"
                  block
                  :loading="submitting"
                  @click="handleSubmit"
                >
                  登录
                </a-button>
              </a-form-item>
              <div class="login-links">
                <router-link to="/register">注册12306账号</router-link>
                <router-link to="/forgot-password">忘记密码</router-link>
              </div>
            </a-form>
          </a-tab-pane>
          <a-tab-pane key="qrcode" tab="扫码登录">
            <div class="qrcode-placeholder">二维码占位</div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
    <LoginFooter />
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { message } from "ant-design-vue"

import Header12306 from "../../components/Header12306.vue"
import LoginFooter from "../../components/LoginFooter.vue"
import { login } from "../../api/auth"
import { useUserStore } from "../../stores/user"
import { useLoginSessionStore } from "../../stores/loginSession"

const formRef = ref()

const form = reactive({
  username: "",
  password: "",
})

const rules = {
  username: [
    {
      required: true,
      message: "请输入用户名/邮箱/手机号",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
    {
      min: 6,
      message: "密码长度不能小于6位",
    },
  ],
}

const submitting = ref(false)

const router = useRouter()
const userStore = useUserStore()
const loginSessionStore = useLoginSessionStore()

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value
    .validate()
    .then(async () => {
      submitting.value = true
      try {
        loginSessionStore.setCredentials({
          username: form.username,
          password: form.password,
        })
        const response = await login({
          username: form.username,
          password: form.password,
        })
        const body = response.data
        if (!body || typeof body.code === "undefined") {
          message.error("登录失败")
          return
        }
        if (body.code !== 0) {
          message.error(body.message || "登录失败")
          return
        }
        const token = body.data?.token
        const user = body.data?.user
        userStore.setAuthenticated(true)
        if (user) {
          userStore.setProfile(user)
        }
        if (typeof window !== "undefined" && token) {
          window.localStorage.setItem("auth_token", token)
        }
        router.push({ name: "UserWelcome" })
      } catch (error) {
        const response = error?.response
        const data = response?.data
        let errorMessage = "登录失败"
        if (data?.message) {
          errorMessage = data.message
        } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
          const first = data.detail[0]
          if (typeof first.msg === "string") {
            errorMessage = first.msg
          }
        }
        message.error(errorMessage)
      } finally {
        submitting.value = false
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.login-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.login-card {
  width: 400px;
}

.input-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
}

.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.qrcode-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
</style>
