<template>
  <header class="header-12306">
    <div class="logo">Railway 12306</div>
    <div class="spacer" />
    <div v-if="!isAuthenticated" class="auth-links">
      <router-link to="/login">登录</router-link>
      <span>/</span>
      <router-link to="/register">注册</router-link>
    </div>
    <div v-else class="user-menu">
      <div
        class="user-entry"
        @mouseenter="menuVisible = true"
        @mouseleave="menuVisible = false"
      >
        <span class="welcome">欢迎您，{{ displayName }}</span>
        <div class="menu-trigger">我的12306</div>
        <ul v-if="menuVisible" class="user-dropdown">
          <li>火车票订单</li>
          <li>本人车票</li>
          <li>我的餐饮</li>
          <li>我的保险</li>
          <li>
            <router-link to="/user/profile">个人中心</router-link>
          </li>
          <li>账户安全</li>
          <li>
            <button
              class="logout-button"
              data-test="logout"
              @click="handleLogout"
            >
              退出登录
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { useUserStore } from "../stores/user"

const userStore = useUserStore()
const router = useRouter()

const menuVisible = ref(false)

const isAuthenticated = computed(() => userStore.isAuthenticated)
const displayName = computed(
  () => userStore.profile?.real_name || userStore.profile?.username || "用户",
)

const handleLogout = () => {
  userStore.logout()
  router.push("/login")
}
</script>

<style scoped>
.header-12306 {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: #0a56b5;
  color: #fff;
}

.logo {
  font-size: 20px;
  font-weight: 600;
}

.spacer {
  flex: 1;
}

.auth-links,
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome {
  margin-right: 8px;
}

.user-entry {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-trigger {
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  padding: 8px 0;
  background: #fff;
  color: #333;
  list-style: none;
  min-width: 140px;
}

.user-dropdown li {
  padding: 4px 16px;
}

.user-dropdown li:hover {
  background: #f5f5f5;
}

.logout-button {
  margin-left: 8px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #fff;
  border-radius: 2px;
  color: #fff;
  cursor: pointer;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

a {
  color: #fff;
}
</style>
