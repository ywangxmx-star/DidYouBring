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
    <view class="head">
      <view class="head-title">场景管理</view>
      <view class="head-sub">系统场景可复制后自定义</view>
    </view>

    <view v-if="!list.length" class="empty">
      <view class="empty-badge">+</view>
      <text>还没有场景，新建一个吧</text>
    </view>

    <view class="list">
      <view v-for="s in list" :key="s.id" class="row" hover-class="pressed" @click="edit(s)">
        <view class="tile" :class="{ mine: s.scene_type === 'custom' }">{{ s.name.slice(0, 1) }}</view>
        <view class="info">
          <view class="name">{{ s.name }}</view>
          <view class="meta">{{ s.scene_type === 'system' ? '系统场景 · 点击复制' : '我的场景 · 点击编辑' }}</view>
        </view>
        <view
          v-if="s.scene_type === 'custom'"
          class="pill-btn danger"
          hover-class="pressed"
          @click.stop="remove(s)"
        >
          删除
        </view>
        <view v-else class="pill-btn">复制</view>
      </view>
    </view>

    <view class="dock">
      <button class="btn btn-primary" hover-class="btn-hover" @click="create">
        <text class="btn-icon">+</text>
        <text>新建场景</text>
      </button>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx 32rpx 220rpx;
}

.head {
  margin-bottom: 28rpx;
}

.head-title {
  font-size: 44rpx;
  font-weight: 900;
}

.head-sub {
  margin-top: 4rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--muted);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 28rpx;
  border-radius: 28rpx;
  border: 4rpx solid var(--ink);
  background: var(--card);
  box-shadow: var(--shadow-sm);
}

.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84rpx;
  height: 84rpx;
  flex-shrink: 0;
  border-radius: 26rpx;
  border: 3rpx solid var(--ink);
  background: var(--bg);
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1;
}

.tile.mine {
  background: var(--primary);
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 30rpx;
  font-weight: 800;
}

.meta {
  margin-top: 6rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: var(--muted);
}
</style>
