<template>
  <div class="profile-page">
    <Header12306 />
    <div class="profile-content">
      <a-card title="个人信息">
        <div class="section-title">基本信息</div>
        <a-form layout="vertical">
          <a-form-item label="用户名">
            <span class="field-text">{{ basic.username }}</span>
          </a-form-item>
          <a-form-item label="姓名">
            <template v-if="!editing">
              <span class="field-text">{{ basic.real_name }}</span>
            </template>
            <template v-else>
              <a-input
                v-model:value="editForm.real_name"
                data-test="real-name-input"
              />
            </template>
          </a-form-item>
          <a-form-item label="国家/地区">
            <span class="field-text">中国</span>
          </a-form-item>
          <a-form-item label="证件类型">
            <span class="field-text">{{ idTypeLabel }}</span>
          </a-form-item>
          <a-form-item label="证件号码">
            <span class="field-text">{{ maskedIdNumber }}</span>
          </a-form-item>
          <a-form-item label="核验状态">
            <span class="field-text status-ok">已通过核验</span>
          </a-form-item>
        </a-form>
        <div class="actions">
          <a-button
            v-if="!editing"
            type="primary"
            data-test="edit-basic"
            @click="startEdit"
          >
            编辑
          </a-button>
          <template v-else>
            <a-button
              class="mr-8"
              type="primary"
              data-test="save-basic"
              :loading="saving"
              @click="handleSave"
            >
              保存
            </a-button>
            <a-button @click="cancelEdit">取消</a-button>
          </template>
        </div>

        <div class="divider" />

        <div class="section-title">联系方式</div>
        <a-form layout="vertical">
          <a-form-item label="手机号">
            <template v-if="!contactEditing">
              <span class="field-text">
                {{ maskedPhone }}
                <span class="hint">(已通过核验)</span>
              </span>
            </template>
            <template v-else>
              <a-input v-model:value="contactForm.phone" placeholder="手机号" />
              <div class="hint">(修改后需重新核验)</div>
            </template>
          </a-form-item>
          <a-form-item label="邮箱">
            <template v-if="!contactEditing">
              <span class="field-text">
                {{ basic.email }}
                <span class="hint">(已通过核验)</span>
              </span>
            </template>
            <template v-else>
              <a-input v-model:value="contactForm.email" placeholder="邮箱" />
            </template>
          </a-form-item>
        </a-form>
        <div class="actions">
          <a-button
            v-if="!contactEditing"
            type="primary"
            data-test="edit-contact"
            @click="startContactEdit"
          >
            编辑联系方式
          </a-button>
          <template v-else>
            <a-button
              class="mr-8"
              type="primary"
              data-test="save-contact"
              :loading="contactSaving"
              @click="handleContactSave"
            >
              保存
            </a-button>
            <a-button @click="cancelContactEdit">取消</a-button>
          </template>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import {
  Card as ACard,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Button as AButton,
} from "ant-design-vue"

import Header12306 from "../../components/Header12306.vue"
import { getProfile, updateProfile } from "../../api/auth"
import { useUserStore } from "../../stores/user"

const aCard = ACard
const aForm = AForm
const aFormItem = AFormItem
const aInput = AInput
const aButton = AButton

const userStore = useUserStore()

const editing = ref(false)
const saving = ref(false)
const contactEditing = ref(false)
const contactSaving = ref(false)

const editForm = reactive({
  real_name: "",
})

const contactForm = reactive({
  phone: "",
  email: "",
})

const basic = computed(() => userStore.profile || {})

const idTypeLabel = computed(() => {
  if (basic.value.id_type === "id_card") return "居民身份证"
  return basic.value.id_type || ""
})

const maskedIdNumber = computed(() => {
  const value = basic.value.id_number || ""
  if (value.length <= 4) return value
  return `${value.slice(0, 3)}************${value.slice(-4)}`
})

const maskedPhone = computed(() => {
  const value = basic.value.phone || ""
  if (value.length <= 7) return value
  return `${value.slice(0, 3)}****${value.slice(-4)}`
})

const loadProfile = async () => {
  const res = await getProfile()
  if (!res || !res.data) return
  const payload = res.data
  if (payload.data) {
    userStore.setProfile(payload.data)
  }
}

const startEdit = () => {
  editForm.real_name = basic.value.real_name || ""
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const handleSave = async () => {
  if (!editForm.real_name) return
  saving.value = true
  try {
    const res = await updateProfile({ real_name: editForm.real_name })
    if (res && res.data && res.data.data) {
      userStore.setProfile(res.data.data)
    }
    editing.value = false
  } finally {
    saving.value = false
  }
}

const startContactEdit = () => {
  contactForm.phone = basic.value.phone || ""
  contactForm.email = basic.value.email || ""
  contactEditing.value = true
}

const cancelContactEdit = () => {
  contactEditing.value = false
}

const handleContactSave = async () => {
  if (!contactForm.phone && !contactForm.email) return
  contactSaving.value = true
  try {
    const res = await updateProfile({
      phone: contactForm.phone,
      email: contactForm.email,
    })
    if (res && res.data && res.data.data) {
      userStore.setProfile(res.data.data)
    }
    contactEditing.value = false
  } finally {
    contactSaving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.profile-content {
  flex: 1;
  padding: 24px;
  background: #f0f2f5;
}

.section-title {
  margin-bottom: 16px;
  font-weight: 600;
}

.field-text {
  color: #333;
}

.status-ok {
  color: #52c41a;
}

.actions {
  margin-top: 16px;
}

.actions .mr-8 {
  margin-right: 8px;
}

.divider {
  margin: 24px 0;
  border-top: 1px dashed #d9d9d9;
}

.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}
</style>
