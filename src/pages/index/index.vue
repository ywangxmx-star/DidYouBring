<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { HomeData, Scene } from '@/api/types'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const data = ref<HomeData | null>(null)
const loading = ref(false)

const tileColors = ['#FFD23F', '#FFFFFF', '#FF5B3A', '#17171C']

const greet = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const dateText = computed(() => {
  const d = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${week}`
})

const activePercent = computed(() => {
  const t = data.value?.active_trip
  if (!t || !t.total_count) return 0
  return Math.round((t.checked_count / t.total_count) * 100)
})

function tileStyle(index: number) {
  const bg = tileColors[index % tileColors.length]
  const dark = bg === '#17171C' || bg === '#FF5B3A'
  return { background: bg, color: dark ? '#FFFFFF' : '#17171C' }
}

async function load() {
  loading.value = true
  try {
    await user.ensureLogin()
    data.value = await api.home()
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  load()
})

async function startScene(scene: Scene) {
  try {
    const trip = await api.createTrip(scene.id, 'reject')
    uni.navigateTo({ url: `/pages/check/check?id=${trip.trip.id}` })
  } catch (e: any) {
    if (e.code === 40901 && e.data?.active_trip) {
      const active = e.data.active_trip
      uni.showModal({
        title: '存在未完成检查',
        content: `「${active.scene_name}」尚未完成，继续还是重新开始？`,
        confirmText: '继续',
        cancelText: '重新开始',
        success: async (r) => {
          if (r.confirm) {
            uni.navigateTo({ url: `/pages/check/check?id=${active.id}` })
          } else if (r.cancel) {
            const trip = await api.createTrip(scene.id, 'abandon_and_create')
            uni.navigateTo({ url: `/pages/check/check?id=${trip.trip.id}` })
          }
        },
      })
      return
    }
    uni.showToast({ title: e.message || '创建失败', icon: 'none' })
  }
}

function goScenes() {
  uni.navigateTo({ url: '/pages/scenes/index' })
}

function resume() {
  const t = data.value?.active_trip
  if (!t) return
  uni.navigateTo({ url: `/pages/check/check?id=${t.id}` })
}

async function abandonActive() {
  const t = data.value?.active_trip
  if (!t) return
  uni.showModal({
    title: '放弃检查',
    content: '确定放弃当前未完成检查吗？',
    success: async (r) => {
      if (!r.confirm) return
      await api.abandonTrip(t.id)
      load()
    },
  })
}

onShareAppMessage(() => ({
  title: '带了么？出门前 30 秒，啥也不落下',
  path: '/pages/index/index',
}))

onShareTimeline(() => ({
  title: '带了么？出门前 30 秒，啥也不落下',
  query: '',
}))
</script>

<template>
  <view class="page">
    <view class="top">
      <view class="brand">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="brand-name">带了么</text>
      </view>
      <view class="date-chip">{{ dateText }}</view>
    </view>

    <view class="hero card">
      <view class="hero-sticker">出门前</view>
      <view class="hero-greet">{{ greet }}</view>
      <view class="hero-title">钥匙、手机、钱包</view>
      <view class="hero-title">今天一个都不落下</view>
      <view class="hero-sub">选个场景，30 秒过一遍清单</view>
    </view>

    <view v-if="data?.active_trip" class="resume card">
      <view class="resume-head">
        <view class="resume-dot" />
        <text class="resume-label">检查进行中</text>
      </view>
      <view class="resume-title">{{ data.active_trip.scene_name }}</view>
      <view class="resume-bar">
        <view class="resume-bar-inner" :style="{ width: activePercent + '%' }" />
      </view>
      <view class="resume-meta">
        已确认 {{ data.active_trip.checked_count }} / {{ data.active_trip.total_count }}
      </view>
      <view class="resume-actions">
        <button class="btn btn-ghost resume-btn" hover-class="btn-hover" @click="abandonActive">放弃</button>
        <button class="btn btn-dark resume-btn grow" hover-class="btn-hover" @click="resume">
          <text>继续检查</text>
          <text class="btn-icon">→</text>
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-head">
        <text class="section-title">出行场景</text>
        <view class="pill-btn" hover-class="pressed" @click="goScenes">管理</view>
      </view>

      <view v-if="!data?.scenes?.length && !loading" class="empty">
        <view class="empty-badge">+</view>
        <text>还没有场景，去管理里新建一个吧</text>
      </view>

      <view class="grid">
        <view
          v-for="(s, i) in data?.scenes || []"
          :key="s.id"
          class="scene card"
          hover-class="pressed"
          @click="startScene(s)"
        >
          <view class="scene-icon" :style="tileStyle(i)">{{ s.name.slice(0, 1) }}</view>
          <view class="scene-name">{{ s.name }}</view>
          <view class="scene-tag" :class="{ mine: s.scene_type !== 'system' }">
            {{ s.scene_type === 'system' ? '系统' : '我的' }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="data?.recent_scenes?.length" class="section">
      <view class="section-head">
        <text class="section-title">最近使用</text>
      </view>
      <view class="recent">
        <view
          v-for="s in data.recent_scenes"
          :key="s.id"
          class="recent-item"
          hover-class="pressed"
          @click="startScene(s)"
        >
          {{ s.name }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx 32rpx 64rpx;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.logo {
  width: 80rpx;
  height: 80rpx;
  transform: rotate(-8deg);
}

.brand-name {
  font-size: 40rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
}

.date-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
  font-size: 22rpx;
  font-weight: 700;
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72rpx 32rpx 56rpx;
  margin-bottom: 40rpx;
  background: var(--primary);
  text-align: center;
}

.hero-sticker {
  position: absolute;
  top: -22rpx;
  right: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  border: 3rpx solid var(--ink);
  background: var(--accent);
  color: var(--card);
  font-size: 22rpx;
  font-weight: 800;
  transform: rotate(6deg);
}

.hero-greet {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  border-radius: 999rpx;
  background: var(--ink);
  color: var(--primary);
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
}

.hero-title {
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.3;
  color: var(--ink);
}

.hero-sub {
  margin-top: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--ink);
  opacity: 0.72;
}

.resume {
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.resume-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.resume-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: var(--accent);
}

.resume-label {
  font-size: 22rpx;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 2rpx;
}

.resume-title {
  margin-top: 12rpx;
  font-size: 36rpx;
  font-weight: 900;
}

.resume-bar {
  height: 24rpx;
  margin-top: 20rpx;
  border-radius: 999rpx;
  border: 3rpx solid var(--ink);
  background: var(--bg);
  overflow: hidden;
}

.resume-bar-inner {
  height: 100%;
  background: var(--primary);
  border-right: 3rpx solid var(--ink);
}

.resume-meta {
  margin-top: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--muted);
}

.resume-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.resume-btn {
  flex: 1;
  height: 88rpx;
  font-size: 28rpx;
}

.resume-btn.grow {
  flex: 2;
}

.section {
  margin-bottom: 40rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 900;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(50% - 12rpx);
  padding: 36rpx 20rpx 32rpx;
  text-align: center;
  transition: transform 0.12s ease;
}

.scene-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 32rpx;
  border: 4rpx solid var(--ink);
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1;
}

.scene-name {
  margin-top: 20rpx;
  font-size: 30rpx;
  font-weight: 800;
}

.scene-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  padding: 0 16rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: var(--bg);
  color: var(--muted);
  font-size: 20rpx;
  font-weight: 700;
}

.scene-tag.mine {
  background: var(--primary-soft);
  color: var(--ink);
}

.recent {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
  box-shadow: var(--shadow-sm);
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
}
</style>
