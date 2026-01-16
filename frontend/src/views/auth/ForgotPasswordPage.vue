<template>
  <div class="forgot-password-page">
    <Header12306 />
    <div class="forgot-content">
      <a-card class="forgot-card" title="找回密码">
        <a-form layout="vertical">
          <a-form-item label="用户名/邮箱/手机号">
            <a-input v-model:value="account" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" block @click="handleNext">下一步</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <LoginFooter />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import {
  Card as ACard,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Button as AButton,
} from "ant-design-vue"

import Header12306 from "../../components/Header12306.vue"
import LoginFooter from "../../components/LoginFooter.vue"
import { requestPasswordReset } from "../../api/auth"

const aCard = ACard
const aForm = AForm
const aFormItem = AFormItem
const aInput = AInput
const aButton = AButton

const router = useRouter()

const account = ref("")

const handleNext = async () => {
  if (!account.value.trim()) {
    return
  }

  await requestPasswordReset({ account: account.value })
  router.push({ name: "Done" })
}
</script>

<style scoped>
.forgot-password-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.forgot-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.forgot-card {
  width: 400px;
}
</style>
