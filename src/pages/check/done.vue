<script setup lang="ts">
import { computed, ref } from 'vue'
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

const allDone = computed(() => detail.value?.trip.status === 'completed')

const headline = computed(() => {
  const t = detail.value?.trip
  if (!t) return ''
  if (t.status === 'completed') return '全部带齐！'
  if (t.status === 'completed_partial') return '出发吧，留意一下'
  return '本次检查已结束'
})

const tip = computed(() => {
  const t = detail.value?.trip
  if (!t) return ''
  if (t.status === 'completed') return '安心出门，今天也是顺利的一天'
  if (t.status === 'completed_partial') return '有物品未确认，路上记得想一想'
  return '下次出门前再来检查一遍'
})
</script>

<template>
  <view class="page" v-if="detail">
    <view class="stamp" :class="{ partial: !allDone }">
      <text class="stamp-mark">{{ allDone ? '✓' : '!' }}</text>
    </view>

    <view class="headline">{{ headline }}</view>
    <view class="tip">{{ tip }}</view>

    <view class="ticket card">
      <view class="ticket-name">{{ detail.trip.scene_name }}</view>
      <view class="ticket-divider" />
      <view class="stats">
        <view class="stat">
          <text class="stat-num">{{ detail.trip.checked_count }}</text>
          <text class="stat-label">已确认</text>
        </view>
        <view class="stat-sep" />
        <view class="stat">
          <text class="stat-num">{{ detail.trip.total_count - detail.trip.checked_count }}</text>
          <text class="stat-label">未确认</text>
        </view>
      </view>
      <view v-if="detail.trip.has_unchecked_required" class="warn">存在未确认的必查项</view>
    </view>

    <button class="btn btn-dark home-btn" hover-class="btn-hover" @click="goHome">回到首页</button>
  </view>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 96rpx 40rpx 64rpx;
  text-align: center;
}

.stamp {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  border-radius: 64rpx;
  border: 6rpx solid var(--ink);
  background: var(--primary);
  box-shadow: 0 12rpx 0 var(--ink);
  transform: rotate(-8deg);
}

.stamp.partial {
  background: var(--accent);
}

.stamp-mark {
  font-size: 110rpx;
  font-weight: 900;
  line-height: 1;
  color: var(--ink);
}

.stamp.partial .stamp-mark {
  color: var(--card);
}

.headline {
  margin-top: 56rpx;
  font-size: 56rpx;
  font-weight: 900;
}

.tip {
  margin-top: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--muted);
}

.ticket {
  width: 100%;
  padding: 40rpx 32rpx;
  margin: 56rpx 0 48rpx;
}

.ticket-name {
  font-size: 34rpx;
  font-weight: 900;
}

.ticket-divider {
  height: 0;
  margin: 28rpx 0;
  border-top: 4rpx dashed var(--ink);
}

.stats {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-num {
  font-size: 72rpx;
  font-weight: 900;
  line-height: 1.1;
}

.stat-label {
  margin-top: 6rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--muted);
}

.stat-sep {
  width: 4rpx;
  height: 96rpx;
  border-radius: 4rpx;
  background: var(--line);
}

.warn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  margin-top: 28rpx;
  border-radius: 16rpx;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 24rpx;
  font-weight: 800;
}

.home-btn {
  width: 100%;
}
</style>
