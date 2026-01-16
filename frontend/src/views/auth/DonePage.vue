<template>
  <div class="done-page">
    <Header12306 />
    <div class="done-content">
      <a-result status="success" title="操作完成" />
    </div>
    <LoginFooter />
  </div>
</template>

<script setup>
import { Result as AResult } from "ant-design-vue"

import Header12306 from "../../components/Header12306.vue"
import LoginFooter from "../../components/LoginFooter.vue"

const aResult = AResult
</script>

<style scoped>
.done-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.done-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}
</style>
