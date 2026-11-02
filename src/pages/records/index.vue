<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripRecord } from '@/api/types'

const list = ref<TripRecord[]>([])

const statusMap: Record<string, string> = {
  completed: '已带齐',
  completed_partial: '有未确认',
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

function day(t?: string | null) {
  if (!t) return '--'
  return t.slice(8, 10)
}

function month(t?: string | null) {
  if (!t) return ''
  return `${Number(t.slice(5, 7))}月`
}

function time(t?: string | null) {
  if (!t) return '-'
  return t.replace('T', ' ').slice(11, 16)
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
    <view class="head">
      <view class="head-title">出门记录</view>
      <view class="head-count">{{ list.length }} 次</view>
    </view>

    <view v-if="!list.length" class="empty">
      <view class="empty-badge">0</view>
      <text>还没有检查记录，去首页开始一次吧</text>
    </view>

    <view class="list">
      <view v-for="item in list" :key="item.id" class="row" hover-class="pressed" @click="goDetail(item.id)">
        <view class="date" :class="item.status">
          <text class="date-day">{{ day(item.started_at) }}</text>
          <text class="date-month">{{ month(item.started_at) }}</text>
        </view>
        <view class="info">
          <view class="name">{{ item.scene_name }}</view>
          <view class="meta">
            <text>{{ time(item.started_at) }}</text>
            <text class="dot" />
            <text>{{ item.checked_count }}/{{ item.total_count }} 件</text>
          </view>
          <view class="status" :class="item.status">{{ statusMap[item.status] || item.status }}</view>
        </view>
        <view class="pill-btn danger" hover-class="pressed" @click.stop="remove(item)">删除</view>
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

.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 104rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  border: 3rpx solid var(--ink);
  background: var(--primary);
  line-height: 1;
}

.date.completed_partial {
  background: var(--accent);
  color: var(--card);
}

.date.abandoned {
  background: var(--bg);
  color: var(--muted);
}

.date-day {
  font-size: 40rpx;
  font-weight: 900;
}

.date-month {
  margin-top: 6rpx;
  font-size: 20rpx;
  font-weight: 700;
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
  margin-top: 6rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: var(--muted);
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--line);
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  padding: 0 14rpx;
  margin-top: 10rpx;
  border-radius: 10rpx;
  background: var(--primary-soft);
  font-size: 20rpx;
  font-weight: 800;
}

.status.completed_partial {
  background: var(--accent-soft);
  color: var(--accent);
}

.status.abandoned {
  background: var(--bg);
  color: var(--muted);
}
</style>
