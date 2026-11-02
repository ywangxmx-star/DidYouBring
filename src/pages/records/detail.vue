<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripDetail } from '@/api/types'

const detail = ref<TripDetail | null>(null)

onLoad(async (q) => {
  detail.value = await api.recordDetail(Number(q?.id || 0))
})

const percent = computed(() => {
  const t = detail.value?.trip
  if (!t || !t.total_count) return 0
  return Math.round((t.checked_count / t.total_count) * 100)
})

const startedAt = computed(() => {
  const t = detail.value?.trip.started_at
  return t ? t.replace('T', ' ').slice(0, 16) : '-'
})
</script>

<template>
  <view class="page" v-if="detail">
    <view class="head card">
      <view class="head-name">{{ detail.trip.scene_name }}</view>
      <view class="head-time">{{ startedAt }}</view>
      <view class="head-stats">
        <view class="head-stat">
          <text class="head-num">{{ detail.trip.checked_count }}/{{ detail.trip.total_count }}</text>
          <text class="head-label">已确认</text>
        </view>
        <view class="head-stat">
          <text class="head-num">{{ percent }}%</text>
          <text class="head-label">完成度</text>
        </view>
      </view>
    </view>

    <view class="list">
      <view v-for="item in detail.items" :key="item.id" class="row" :class="{ checked: item.is_checked }">
        <view class="mark">
          <text class="mark-glyph">{{ item.is_checked ? '✓' : '' }}</text>
        </view>
        <view class="info">
          <view class="title">{{ item.item_name }}</view>
          <view v-if="item.is_important || item.is_required || item.is_temporary" class="tags">
            <text v-if="item.is_important" class="tag tag-imp">重要</text>
            <text v-if="item.is_required" class="tag tag-req">必查</text>
            <text v-if="item.is_temporary" class="tag tag-tmp">临时</text>
          </view>
        </view>
        <text class="state">{{ item.is_checked ? '已带' : '未确认' }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx 32rpx 64rpx;
}

.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  background: var(--primary);
  text-align: center;
}

.head-name {
  font-size: 44rpx;
  font-weight: 900;
}

.head-time {
  margin-top: 6rpx;
  font-size: 24rpx;
  font-weight: 700;
  opacity: 0.7;
}

.head-stats {
  display: flex;
  gap: 20rpx;
  width: 100%;
  margin-top: 28rpx;
}

.head-stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: 24rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
}

.head-num {
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.2;
}

.head-label {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--muted);
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
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  border-radius: 50%;
  border: 3rpx solid var(--ink);
}

.row.checked .mark {
  background: var(--ink);
}

.mark-glyph {
  color: var(--primary);
  font-size: 24rpx;
  font-weight: 900;
  line-height: 1;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 28rpx;
  font-weight: 800;
}

.tags {
  display: flex;
  gap: 10rpx;
  margin-top: 8rpx;
}

.state {
  font-size: 22rpx;
  font-weight: 800;
  color: var(--accent);
}

.row.checked .state {
  color: var(--muted);
}
</style>
