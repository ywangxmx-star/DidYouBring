<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { HomeData, Scene } from '@/api/types'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const data = ref<HomeData | null>(null)
const loading = ref(false)

const greet = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const dateText = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

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
  title: '带了么？出门前快速检查物品',
  path: '/pages/index/index',
}))

onShareTimeline(() => ({
  title: '带了么？出门前快速检查物品',
  query: '',
}))
</script>

<template>
  <view class="page">
    <view class="hero">
      <view class="brand">带了么？</view>
      <view class="hello">{{ greet }} · {{ dateText }}</view>
      <view class="sub">选个场景，出门前快速确认</view>
    </view>

    <view v-if="data?.active_trip" class="resume">
      <view class="resume-main">
        <text class="resume-title">继续「{{ data.active_trip.scene_name }}」</text>
        <text class="resume-meta">{{ data.active_trip.checked_count }}/{{ data.active_trip.total_count }} 已确认</text>
      </view>
      <view class="resume-actions">
        <button class="btn btn-primary resume-btn" @click="resume">继续检查</button>
        <button class="btn btn-ghost resume-btn" @click="abandonActive">放弃</button>
      </view>
    </view>

    <view class="section">
      <view class="section-head">
        <text class="section-title">出行场景</text>
        <text class="link" @click="goScenes">管理</text>
      </view>
      <view class="grid">
        <view v-for="s in data?.scenes || []" :key="s.id" class="scene" @click="startScene(s)">
          <view class="scene-icon">{{ s.name.slice(0, 1) }}</view>
          <view class="scene-name">{{ s.name }}</view>
          <view class="scene-tag">{{ s.scene_type === 'system' ? '系统' : '我的' }}</view>
        </view>
      </view>
    </view>

    <view v-if="data?.recent_scenes?.length" class="section">
      <view class="section-title">最近使用</view>
      <view class="recent">
        <view v-for="s in data.recent_scenes" :key="s.id" class="recent-item" @click="startScene(s)">
          {{ s.name }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { padding: 32rpx 32rpx 48rpx; }
.hero {
  padding: 48rpx 8rpx 40rpx;
  background: linear-gradient(160deg, #e8f2ee 0%, #f7f4ef 55%, #f3ebe0 100%);
  border-radius: 28rpx;
  margin-bottom: 28rpx;
}
.brand {
  font-size: 56rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: var(--primary);
}
.hello { margin-top: 12rpx; color: var(--muted); font-size: 26rpx; }
.sub { margin-top: 8rpx; font-size: 28rpx; color: var(--text); }
.resume {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
  border: 2rpx solid var(--primary-soft);
}
.resume-title { font-size: 30rpx; font-weight: 600; display: block; }
.resume-meta { color: var(--muted); font-size: 24rpx; margin-top: 8rpx; display: block; }
.resume-actions { display: flex; gap: 16rpx; margin-top: 20rpx; }
.resume-btn { flex: 1; height: 72rpx; font-size: 26rpx; }
.section { margin-bottom: 36rpx; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: 600; }
.link { color: var(--primary); font-size: 26rpx; }
.grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.scene {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-sizing: border-box;
}
.scene-icon {
  width: 72rpx; height: 72rpx; border-radius: 20rpx;
  background: var(--primary-soft); color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; font-weight: 700;
}
.scene-name { margin-top: 16rpx; font-size: 30rpx; font-weight: 600; }
.scene-tag { margin-top: 8rpx; color: var(--muted); font-size: 22rpx; }
.recent { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 16rpx; }
.recent-item {
  background: #fff; padding: 16rpx 28rpx; border-radius: 999rpx;
  color: var(--text); font-size: 26rpx;
}
</style>
