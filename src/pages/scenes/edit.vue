<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { Item } from '@/api/types'

const id = ref(0)
const name = ref('')
const icon = ref('custom')
const items = ref<Item[]>([])
const selected = ref<Record<number, { on: boolean; required: boolean }>>({})

const selectedCount = computed(() => Object.values(selected.value).filter((v) => v.on).length)

onLoad(async (q) => {
  id.value = Number(q?.id || 0)
  items.value = await api.items()
  if (!id.value) {
    items.value.forEach((it) => {
      selected.value[it.id] = { on: false, required: false }
    })
    return
  }
  const detail = await api.sceneDetail(id.value)
  name.value = detail.name
  icon.value = detail.icon || 'custom'
  const map: Record<number, { on: boolean; required: boolean }> = {}
  items.value.forEach((it) => {
    map[it.id] = { on: false, required: false }
  })
  detail.items.forEach((si) => {
    map[si.item_id] = { on: true, required: si.is_required }
  })
  selected.value = map
})

function toggle(itemId: number) {
  const cur = selected.value[itemId] || { on: false, required: false }
  selected.value[itemId] = { ...cur, on: !cur.on }
}

function toggleReq(itemId: number) {
  const cur = selected.value[itemId]
  if (!cur?.on) return
  selected.value[itemId] = { ...cur, required: !cur.required }
}

async function save() {
  if (!name.value.trim()) {
    uni.showToast({ title: '请输入场景名称', icon: 'none' })
    return
  }
  let sceneId = id.value
  if (!sceneId) {
    const created = await api.createScene({ name: name.value.trim(), icon: icon.value })
    sceneId = created.id
  } else {
    await api.updateScene(sceneId, { name: name.value.trim(), icon: icon.value })
  }
  const payload = Object.entries(selected.value)
    .filter(([, v]) => v.on)
    .map(([itemId, v], idx) => ({
      item_id: Number(itemId),
      sort: idx + 1,
      is_required: v.required,
    }))
  await api.setSceneItems(sceneId, payload)
  uni.navigateBack()
}
</script>

<template>
  <view class="page">
    <view class="label">场景名称</view>
    <input
      class="input"
      v-model="name"
      placeholder="如：周一通勤"
      placeholder-class="input-placeholder"
      maxlength="64"
    />

    <view class="label-row">
      <view class="label">关联物品</view>
      <view class="count">已选 {{ selectedCount }}</view>
    </view>

    <view v-if="!items.length" class="empty">
      <view class="empty-badge">+</view>
      <text>请先在物品页添加物品</text>
    </view>

    <view class="list">
      <view
        v-for="it in items"
        :key="it.id"
        class="row"
        :class="{ on: selected[it.id]?.on }"
        @click="toggle(it.id)"
      >
        <view class="check">
          <text v-if="selected[it.id]?.on" class="check-mark">✓</text>
        </view>
        <text class="name">{{ it.name }}</text>
        <view
          class="pill-btn req"
          :class="{ active: selected[it.id]?.required, disabled: !selected[it.id]?.on }"
          hover-class="pressed"
          @click.stop="toggleReq(it.id)"
        >
          必查
        </view>
      </view>
    </view>

    <view class="dock">
      <button class="btn btn-dark" hover-class="btn-hover" @click="save">保存场景</button>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding: 8rpx 32rpx 220rpx;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.count {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
  padding: 0 18rpx;
  margin-top: 20rpx;
  border-radius: 999rpx;
  background: var(--ink);
  color: var(--primary);
  font-size: 22rpx;
  font-weight: 800;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
}

.row.on {
  background: var(--primary-soft);
  box-shadow: var(--shadow-sm);
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  flex-shrink: 0;
  border-radius: 16rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
}

.row.on .check {
  background: var(--ink);
}

.check-mark {
  color: var(--primary);
  font-size: 26rpx;
  font-weight: 900;
  line-height: 1;
}

.name {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 800;
}

.req.active {
  background: var(--accent);
  border-color: var(--ink);
  color: var(--card);
}

.req.disabled {
  opacity: 0.35;
}
</style>
