<template>
  <div class="verify-code-page">
    <Header12306 />
    <div class="verify-content">
      <a-card class="verify-card" title="验证码验证">
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-form-item name="idLast4" label="证件号后4位">
            <a-input v-model:value="form.idLast4" placeholder="证件号后4位" />
          </a-form-item>
          <a-form-item name="smsCode" label="短信验证码">
            <a-input v-model:value="form.smsCode" placeholder="短信验证码" />
          </a-form-item>
          <a-form-item>
            <a-button
              data-test="send-sms"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ sendButtonText }}
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button
              data-test="confirm-sms"
              type="primary"
              block
              :loading="submitting"
              @click="handleConfirm"
            >
              确定
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <LoginFooter />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue"

import Header12306 from "../../components/Header12306.vue"
import LoginFooter from "../../components/LoginFooter.vue"
import { sendLoginVerifyCode, login } from "../../api/auth"
import { useLoginSessionStore } from "../../stores/loginSession"

const formRef = ref()

const form = reactive({
  idLast4: "",
  smsCode: "",
})

const rules = {
  idLast4: [
    {
      required: true,
      message: "请输入证件号后4位",
    },
    {
      len: 4,
      message: "证件号后4位长度为4位",
    },
  ],
  smsCode: [
    {
      required: true,
      message: "请输入短信验证码",
    },
    {
      len: 6,
      message: "短信验证码为6位数字",
    },
  ],
}

const countdown = ref(0)
let timerId

const sendButtonText = computed(() => {
  if (countdown.value <= 0) return "获取验证码"
  return `${countdown.value}秒后可重发`
})

const submitting = ref(false)

const loginSession = useLoginSessionStore()

const startCountdown = () => {
  countdown.value = 60
  if (timerId) {
    clearInterval(timerId)
  }
  timerId = setInterval(() => {
    if (countdown.value <= 1) {
      clearInterval(timerId)
      countdown.value = 0
      return
    }
    countdown.value -= 1
  }, 1000)
}

const handleSendCode = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validateFields(["idLast4"])
    await sendLoginVerifyCode({
      username: loginSession.username,
      id_last4: form.idLast4,
    })
    startCountdown()
  } catch {
    return
  }
}

const handleConfirm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    try {
      await login({
        username: loginSession.username,
        password: loginSession.password,
        id_last4: form.idLast4,
        sms_code: form.smsCode,
      })
    } finally {
      submitting.value = false
    }
  } catch {
    return
  }
}
</script>

<style scoped>
.verify-code-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.verify-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.verify-card {
  width: 400px;
}
</style>
