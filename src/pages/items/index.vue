<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { Item } from '@/api/types'

const list = ref<Item[]>([])
const keyword = ref('')

async function load() {
  list.value = await api.items(keyword.value)
}

onShow(load)

function goEdit(id?: number) {
  uni.navigateTo({ url: id ? `/pages/items/edit?id=${id}` : '/pages/items/edit' })
}

async function remove(item: Item) {
  uni.showModal({
    title: '删除物品',
    content: `确定删除「${item.name}」吗？`,
    success: async (r) => {
      if (!r.confirm) return
      await api.deleteItem(item.id)
      load()
    },
  })
}
</script>

<template>
  <view class="page">
    <view class="head">
      <view class="head-title">我的物品</view>
      <view class="head-count">{{ list.length }} 件</view>
    </view>

    <view class="field search">
      <view class="field-icon">
        <view class="search-glyph" />
      </view>
      <input
        class="field-input"
        v-model="keyword"
        placeholder="搜索物品"
        placeholder-class="input-placeholder"
        confirm-type="search"
        @confirm="load"
      />
      <view class="field-spacer" />
    </view>

    <view v-if="!list.length" class="empty">
      <view class="empty-badge">+</view>
      <text>还没有物品，先添加一件吧</text>
    </view>

    <view class="list">
      <view v-for="item in list" :key="item.id" class="row" hover-class="pressed" @click="goEdit(item.id)">
        <view class="avatar" :class="{ imp: item.is_important }">{{ item.name.slice(0, 1) }}</view>
        <view class="info">
          <view class="name">{{ item.name }}</view>
          <view class="meta">
            <text class="cat">{{ item.category || '其他' }}</text>
            <text v-if="item.is_important" class="tag tag-imp">重要</text>
          </view>
        </view>
        <view class="pill-btn danger" hover-class="pressed" @click.stop="remove(item)">删除</view>
      </view>
    </view>

    <view class="dock">
      <button class="btn btn-primary" hover-class="btn-hover" @click="goEdit()">
        <text class="btn-icon">+</text>
        <text>添加物品</text>
      </button>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx 32rpx 220rpx;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.head-title {
  font-size: 44rpx;
  font-weight: 900;
}

.head-count {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: var(--ink);
  color: var(--primary);
  font-size: 22rpx;
  font-weight: 800;
}

.search {
  margin-bottom: 32rpx;
}

.search-glyph {
  position: relative;
  width: 22rpx;
  height: 22rpx;
  margin: -4rpx 0 0 -4rpx;
  border-radius: 50%;
  border: 4rpx solid var(--ink);
}

.search-glyph::after {
  content: '';
  position: absolute;
  right: -10rpx;
  bottom: -8rpx;
  width: 10rpx;
  height: 4rpx;
  border-radius: 4rpx;
  background: var(--ink);
  transform: rotate(45deg);
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

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  border: 3rpx solid var(--ink);
  background: var(--bg);
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1;
}

.avatar.imp {
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
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.cat {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--muted);
}
</style>
