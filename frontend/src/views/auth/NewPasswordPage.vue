<template>
  <div class="new-password-page">
    <Header12306 />
    <div class="new-password-content">
      <a-card class="new-password-card" title="设置新密码">
        <a-form layout="vertical">
          <a-form-item label="新密码">
            <a-input-password />
          </a-form-item>
          <a-form-item label="确认新密码">
            <a-input-password />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" block>提交</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <LoginFooter />
  </div>
</template>

<script setup>
import {
  Card as ACard,
  Form as AForm,
  FormItem as AFormItem,
  InputPassword as AInputPassword,
  Button as AButton,
} from "ant-design-vue"

import Header12306 from "../../components/Header12306.vue"
import LoginFooter from "../../components/LoginFooter.vue"

const aCard = ACard
const aForm = AForm
const aFormItem = AFormItem
const aInputPassword = AInputPassword
const aButton = AButton
</script>

<style scoped>
.new-password-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.new-password-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.new-password-card {
  width: 400px;
}
</style>
