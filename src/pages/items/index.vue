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
    <view class="search-wrap">
      <input class="input" v-model="keyword" placeholder="搜索物品" confirm-type="search" @confirm="load" />
    </view>
    <view v-if="!list.length" class="empty">还没有物品，先添加一件吧</view>
    <view v-for="item in list" :key="item.id" class="row" @click="goEdit(item.id)">
      <view>
        <view class="name">{{ item.name }}</view>
        <view class="meta">
          <text>{{ item.category || '其他' }}</text>
          <text v-if="item.is_important" class="imp">重要</text>
        </view>
      </view>
      <text class="del" @click.stop="remove(item)">删除</text>
    </view>
    <view class="fab">
      <button class="btn btn-primary" @click="goEdit()">添加物品</button>
    </view>
  </view>
</template>

<style scoped>
.page { padding: 24rpx 24rpx 160rpx; }
.search-wrap { margin-bottom: 20rpx; }
.row {
  background: #fff; border-radius: 20rpx; padding: 28rpx;
  margin-bottom: 16rpx; display: flex; justify-content: space-between; align-items: center;
}
.name { font-size: 30rpx; font-weight: 600; }
.meta { margin-top: 8rpx; color: var(--muted); font-size: 24rpx; display: flex; gap: 12rpx; }
.imp { color: var(--warn); }
.del { color: var(--danger); font-size: 24rpx; }
.fab { position: fixed; left: 24rpx; right: 24rpx; bottom: calc(24rpx + env(safe-area-inset-bottom)); }
</style>
