<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripDetail } from '@/api/types'

const detail = ref<TripDetail | null>(null)

onLoad(async (q) => {
  detail.value = await api.recordDetail(Number(q?.id || 0))
})
</script>

<template>
  <view class="page" v-if="detail">
    <view class="head">
      <view class="name">{{ detail.trip.scene_name }}</view>
      <view class="meta">{{ detail.trip.checked_count }}/{{ detail.trip.total_count }} 已确认</view>
    </view>
    <view v-for="item in detail.items" :key="item.id" class="row">
      <text class="mark">{{ item.is_checked ? '✓' : '○' }}</text>
      <view>
        <view class="title">{{ item.item_name }}</view>
        <view class="tags">
          <text v-if="item.is_important">重要</text>
          <text v-if="item.is_required">必查</text>
          <text v-if="item.is_temporary">临时</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { padding: 24rpx; }
.head { background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 16rpx; }
.name { font-size: 34rpx; font-weight: 700; }
.meta { margin-top: 8rpx; color: var(--muted); }
.row {
  background: #fff; border-radius: 16rpx; padding: 24rpx;
  margin-bottom: 12rpx; display: flex; gap: 16rpx; align-items: center;
}
.mark { width: 40rpx; color: var(--primary); font-weight: 700; }
.title { font-size: 28rpx; }
.tags { margin-top: 6rpx; color: var(--muted); font-size: 22rpx; display: flex; gap: 12rpx; }
</style>
