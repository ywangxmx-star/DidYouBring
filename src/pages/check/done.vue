<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripDetail } from '@/api/types'

const detail = ref<TripDetail | null>(null)

onLoad(async (q) => {
  const id = Number(q?.id || 0)
  detail.value = await api.tripDetail(id)
})

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

const tip = () => {
  const t = detail.value?.trip
  if (!t) return ''
  if (t.status === 'completed') return '检查完成，准备出发吧。'
  if (t.status === 'completed_partial') return '已确认出门，记得留意未确认物品。'
  return '本次检查已结束。'
}
</script>

<template>
  <view class="page" v-if="detail">
    <view class="card">
      <view class="title">{{ detail.trip.scene_name }}</view>
      <view class="tip">{{ tip() }}</view>
      <view class="meta">已确认 {{ detail.trip.checked_count }} / {{ detail.trip.total_count }}</view>
      <view class="meta">未确认 {{ detail.trip.total_count - detail.trip.checked_count }} 件</view>
      <view v-if="detail.trip.has_unchecked_required" class="warn">存在未确认必查项</view>
    </view>
    <button class="btn btn-primary" @click="goHome">回到首页</button>
  </view>
</template>

<style scoped>
.page { padding: 48rpx 32rpx; }
.card {
  background: #fff; border-radius: 28rpx; padding: 40rpx 32rpx; margin-bottom: 32rpx;
  background-image: linear-gradient(180deg, #eaf3ef, #fff 48%);
}
.title { font-size: 40rpx; font-weight: 700; }
.tip { margin-top: 16rpx; font-size: 28rpx; color: var(--primary); }
.meta { margin-top: 12rpx; color: var(--muted); }
.warn { margin-top: 16rpx; color: var(--danger); }
</style>
