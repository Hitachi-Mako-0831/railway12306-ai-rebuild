<template>
  <div class="register-page">
    <Header12306 />
    <div class="register-content">
      <a-card class="register-card" title="注册12306账号">
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-form-item name="username" label="用户名">
            <a-input v-model:value="form.username" placeholder="用户名" />
          </a-form-item>
          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="form.password"
              placeholder="密码"
            />
            <div class="password-strength">
              <div class="password-strength-bar">
                <div :class="['bar', strengthLevelClass]" />
              </div>
              <span
                data-test="password-strength-text"
                class="password-strength-text"
              >
                {{ strengthLabel }}
              </span>
            </div>
          </a-form-item>
          <a-form-item name="confirmPassword" label="确认密码">
            <a-input-password
              v-model:value="form.confirmPassword"
              placeholder="确认密码"
              @blur="handleConfirmBlur"
            />
          </a-form-item>
          <a-form-item name="idType" label="证件类型">
            <a-select v-model:value="form.idType" placeholder="请选择证件类型">
              <a-select-option value="id_card">居民身份证</a-select-option>
              <a-select-option value="hk_macau_resident">
                港澳居民居住证
              </a-select-option>
              <a-select-option value="tw_resident">
                台湾居民居住证
              </a-select-option>
              <a-select-option value="passport">护照</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="realName" label="姓名">
            <a-input v-model:value="form.realName" placeholder="姓名" />
          </a-form-item>
          <a-form-item name="idNumber" label="证件号码">
            <a-input v-model:value="form.idNumber" placeholder="证件号码" />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input v-model:value="form.email" />
          </a-form-item>
          <a-form-item label="手机号">
            <a-input v-model:value="form.phone" />
          </a-form-item>
          <a-form-item name="userType" label="优惠类型">
            <a-select
              v-model:value="form.userType"
              placeholder="请选择优惠类型"
            >
              <a-select-option value="adult">成人</a-select-option>
              <a-select-option value="child">儿童</a-select-option>
              <a-select-option value="student">学生</a-select-option>
              <a-select-option value="disabled_soldier">
                残疾军人
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              block
              :loading="submitting"
              @click="handleSubmit"
            >
              下一步
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <LoginFooter />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { message } from "ant-design-vue"

import Header12306 from "../../components/Header12306.vue"
import LoginFooter from "../../components/LoginFooter.vue"
import { register } from "../../api/auth"

const formRef = ref()

const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  idType: "id_card",
  realName: "",
  idNumber: "",
  email: "",
  phone: "",
  userType: "adult",
})

const usernamePattern = /^[A-Za-z][A-Za-z0-9_]{5,29}$/

const rules = {
  username: [
    { required: true, message: "请输入用户名" },
    {
      pattern: usernamePattern,
      message: "用户名需以字母开头，6-30位字母数字或_",
    },
  ],
  password: [
    { required: true, message: "请输入密码" },
    { min: 6, max: 20, message: "密码长度需为6-20位" },
    {
      validator(_, value) {
        if (!value) return Promise.resolve()
        const hasLetter = /[A-Za-z]/.test(value)
        const hasDigit = /[0-9]/.test(value)
        if (!hasLetter || !hasDigit) {
          return Promise.reject(new Error("密码必须包含字母和数字"))
        }
        return Promise.resolve()
      },
    },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码" },
    {
      validator(_, value) {
        if (!value) return Promise.resolve()
        if (value !== form.password) {
          return Promise.reject(new Error("两次输入密码不一致"))
        }
        return Promise.resolve()
      },
    },
  ],
  idType: [{ required: true, message: "请选择证件类型" }],
  realName: [
    { required: true, message: "请输入姓名" },
    {
      validator(_, value) {
        if (!value) return Promise.resolve()
        const pattern = /^[\u4e00-\u9fa5]{2,20}$/
        if (!pattern.test(value)) {
          return Promise.reject(new Error("姓名需为2-20位中文"))
        }
        return Promise.resolve()
      },
    },
  ],
  idNumber: [
    { required: true, message: "请输入证件号码" },
    {
      validator(_, value) {
        if (!value) return Promise.resolve()
        if (form.idType === "id_card") {
          const pattern = /^\d{17}[\dXx]$/
          if (!pattern.test(value)) {
            return Promise.reject(new Error("请输入正确的身份证号码"))
          }
        }
        return Promise.resolve()
      },
    },
  ],
  userType: [{ required: true, message: "请选择优惠类型" }],
}

const strengthScore = computed(() => {
  const value = form.password
  if (!value) return 0
  let score = 0
  if (/[0-9]/.test(value)) score += 1
  if (/[a-z]/.test(value)) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  if (value.length >= 12) score += 1
  return score
})

const strengthLabel = computed(() => {
  if (!form.password) return "强度：无"
  if (strengthScore.value <= 2) return "强度：弱"
  if (strengthScore.value === 3) return "强度：中"
  if (strengthScore.value === 4) return "强度：强"
  return "强度：很强"
})

const strengthLevelClass = computed(() => {
  if (!form.password) return "level-none"
  if (strengthScore.value <= 2) return "level-weak"
  if (strengthScore.value === 3) return "level-medium"
  if (strengthScore.value === 4) return "level-strong"
  return "level-very-strong"
})

const submitting = ref(false)

const router = useRouter()

const handleConfirmBlur = () => {
  if (!formRef.value) return
  formRef.value.validateFields(["confirmPassword"]).catch(() => {})
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value
    .validate()
    .then(async () => {
      submitting.value = true
      try {
        const response = await register({
          username: form.username,
          password: form.password,
          confirm_password: form.confirmPassword,
          real_name: form.realName,
          id_type: form.idType,
          id_number: form.idNumber,
          user_type: form.userType,
          phone: form.phone,
          email: form.email,
        })
        const body = response.data
        if (!body || typeof body.code === "undefined") {
          message.error("注册失败")
          return
        }
        if (body.code !== 0) {
          message.error(body.message || "注册失败")
          return
        }
        message.success("注册成功，请登录")
        router.push({ name: "Login" })
      } catch (error) {
        const response = error?.response
        const data = response?.data
        let errorMessage = "注册失败"
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
.register-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.register-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.register-card {
  width: 600px;
}

.password-strength {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.password-strength-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  margin-right: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.password-strength-bar .bar {
  height: 100%;
  width: 25%;
  transition:
    width 0.2s ease,
    background-color 0.2s ease;
}

.password-strength-bar .level-none {
  width: 0;
}

.password-strength-bar .level-weak {
  width: 25%;
  background-color: #ff4d4f;
}

.password-strength-bar .level-medium {
  width: 50%;
  background-color: #faad14;
}

.password-strength-bar .level-strong {
  width: 75%;
  background-color: #52c41a;
}

.password-strength-bar .level-very-strong {
  width: 100%;
  background-color: #1890ff;
}

.password-strength-text {
  font-size: 12px;
  color: #999;
}
</style>
