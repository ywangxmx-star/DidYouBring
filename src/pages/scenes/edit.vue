<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { Item } from '@/api/types'

const id = ref(0)
const name = ref('')
const icon = ref('custom')
const items = ref<Item[]>([])
const selected = ref<Record<number, { on: boolean; required: boolean }>>({})

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
    <input class="input" v-model="name" placeholder="如：周一通勤" maxlength="64" />
    <view class="label">关联物品</view>
    <view v-if="!items.length" class="empty">请先在物品页添加物品</view>
    <view v-for="it in items" :key="it.id" class="row">
      <view class="left" @click="toggle(it.id)">
        <view class="check" :class="{ on: selected[it.id]?.on }">{{ selected[it.id]?.on ? '✓' : '' }}</view>
        <text>{{ it.name }}</text>
      </view>
      <text class="req" :class="{ on: selected[it.id]?.required }" @click="toggleReq(it.id)">必查</text>
    </view>
    <button class="btn btn-primary save" @click="save">保存</button>
  </view>
</template>

<style scoped>
.page { padding: 32rpx 24rpx 48rpx; }
.label { margin: 24rpx 0 12rpx; color: var(--muted); font-size: 24rpx; }
.row {
  background: #fff; border-radius: 16rpx; padding: 24rpx;
  margin-bottom: 12rpx; display: flex; justify-content: space-between; align-items: center;
}
.left { display: flex; align-items: center; gap: 16rpx; }
.check {
  width: 44rpx; height: 44rpx; border-radius: 12rpx; border: 2rpx solid var(--primary);
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24rpx;
}
.check.on { background: var(--primary); }
.req { color: var(--muted); font-size: 24rpx; padding: 8rpx 12rpx; }
.req.on { color: var(--danger); font-weight: 600; }
.save { margin-top: 40rpx; }
</style>
