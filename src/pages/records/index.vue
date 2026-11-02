<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripRecord } from '@/api/types'

const list = ref<TripRecord[]>([])

const statusMap: Record<string, string> = {
  completed: '已完成',
  completed_partial: '有未确认项',
  abandoned: '已放弃',
}

async function load() {
  const res = await api.records()
  list.value = res.list || []
}

onShow(load)

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/records/detail?id=${id}` })
}

function fmt(t?: string | null) {
  if (!t) return '-'
  return t.replace('T', ' ').slice(0, 16)
}

async function remove(item: TripRecord) {
  uni.showModal({
    title: '删除记录',
    content: '删除后不可恢复',
    success: async (r) => {
      if (!r.confirm) return
      await api.deleteRecord(item.id)
      load()
    },
  })
}
</script>

<template>
  <view class="page">
    <view v-if="!list.length" class="empty">还没有检查记录，去首页开始一次吧</view>
    <view v-for="item in list" :key="item.id" class="row" @click="goDetail(item.id)">
      <view class="name">{{ item.scene_name }}</view>
      <view class="meta">{{ fmt(item.started_at) }} · {{ item.checked_count }}/{{ item.total_count }}</view>
      <view class="bottom">
        <text class="status">{{ statusMap[item.status] || item.status }}</text>
        <text class="del" @click.stop="remove(item)">删除</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { padding: 24rpx; }
.row { background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 16rpx; }
.name { font-size: 30rpx; font-weight: 600; }
.meta { margin-top: 8rpx; color: var(--muted); font-size: 24rpx; }
.bottom { margin-top: 16rpx; display: flex; justify-content: space-between; }
.status { color: var(--primary); font-size: 24rpx; }
.del { color: var(--danger); font-size: 24rpx; }
</style>
