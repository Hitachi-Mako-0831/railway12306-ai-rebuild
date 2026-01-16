<template>
  <div class="user-layout">
    <Header12306 />
    <div class="user-main">
      <aside class="user-sider">
        <ul>
          <li>
            <router-link to="/user/profile">个人信息</router-link>
          </li>
        </ul>
      </aside>
      <section class="user-content">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import Header12306 from "../../components/Header12306.vue"
</script>

<style scoped>
.user-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.user-main {
  flex: 1;
  display: flex;
}

.user-sider {
  width: 200px;
  background: #f5f5f5;
}

.user-content {
  flex: 1;
  padding: 24px;
}
</style>
