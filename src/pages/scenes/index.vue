<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { Scene } from '@/api/types'

const list = ref<Scene[]>([])

async function load() {
  list.value = await api.scenes()
}

onShow(load)

function create() {
  uni.navigateTo({ url: '/pages/scenes/edit' })
}

function edit(s: Scene) {
  if (s.scene_type === 'system') {
    uni.showActionSheet({
      itemList: ['复制为个人场景'],
      success: async (r) => {
        if (r.tapIndex === 0) {
          const copied = await api.copyScene(s.id)
          uni.navigateTo({ url: `/pages/scenes/edit?id=${copied.id}` })
        }
      },
    })
    return
  }
  uni.navigateTo({ url: `/pages/scenes/edit?id=${s.id}` })
}

async function remove(s: Scene) {
  if (s.scene_type === 'system') return
  uni.showModal({
    title: '删除场景',
    content: `确定删除「${s.name}」吗？`,
    success: async (r) => {
      if (!r.confirm) return
      await api.deleteScene(s.id)
      load()
    },
  })
}
</script>

<template>
  <view class="page">
    <view v-for="s in list" :key="s.id" class="row" @click="edit(s)">
      <view>
        <view class="name">{{ s.name }}</view>
        <view class="meta">{{ s.scene_type === 'system' ? '系统场景（可复制）' : '我的场景' }}</view>
      </view>
      <text v-if="s.scene_type === 'custom'" class="del" @click.stop="remove(s)">删除</text>
    </view>
    <view class="fab">
      <button class="btn btn-primary" @click="create">新建场景</button>
    </view>
  </view>
</template>

<style scoped>
.page { padding: 24rpx 24rpx 160rpx; }
.row {
  background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 16rpx;
  display: flex; justify-content: space-between; align-items: center;
}
.name { font-size: 30rpx; font-weight: 600; }
.meta { margin-top: 8rpx; color: var(--muted); font-size: 24rpx; }
.del { color: var(--danger); }
.fab { position: fixed; left: 24rpx; right: 24rpx; bottom: calc(24rpx + env(safe-area-inset-bottom)); }
</style>
