<template>
  <div class="user-welcome">
    <div class="welcome-header">
      <h2>{{ greetingText }}</h2>
      <p class="welcome-sub">欢迎登录铁路12306个人中心</p>
    </div>
    <div class="welcome-body">
      <div class="welcome-left">
        <p class="safe-title">账户安全提示</p>
        <p class="safe-tip">请勿在公共场所保存密码，谨防钓鱼网站和诈骗。</p>
      </div>
      <div class="welcome-right">
        <div class="qrcode-box">
          <div class="qrcode-placeholder">二维码</div>
          <p class="qrcode-text">扫码下载官方客户端</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return "上午好"
  if (hour < 18) return "下午好"
  return "晚上好"
})
</script>

<style scoped>
.user-welcome {
  padding: 24px;
}

.welcome-header h2 {
  margin: 0;
}

.welcome-sub {
  margin-top: 4px;
  color: #666;
}

.welcome-body {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
}

.welcome-left {
  flex: 1;
}

.safe-title {
  font-weight: 600;
}

.safe-tip {
  margin-top: 8px;
  color: #666;
}

.welcome-right {
  width: 200px;
}

.qrcode-box {
  text-align: center;
}

.qrcode-placeholder {
  width: 160px;
  height: 160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
}

.qrcode-text {
  margin-top: 8px;
  color: #666;
}
</style>
