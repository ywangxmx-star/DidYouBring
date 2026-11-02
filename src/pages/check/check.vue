<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripDetail, TripItem } from '@/api/types'

const tripId = ref(0)
const detail = ref<TripDetail | null>(null)
const pending = ref<Record<number, boolean>>({})
const showRemind = ref(false)

const progressText = computed(() => {
  const t = detail.value?.trip
  if (!t) return '0/0'
  return `${t.checked_count}/${t.total_count}`
})

const percent = computed(() => {
  const t = detail.value?.trip
  if (!t || !t.total_count) return 0
  return Math.round((t.checked_count / t.total_count) * 100)
})

const unchecked = computed(() => detail.value?.items.filter((i) => !i.is_checked) || [])
const uncheckedRequired = computed(() => unchecked.value.filter((i) => i.is_required))

onLoad((q) => {
  tripId.value = Number(q?.id || 0)
  load()
})

async function load() {
  try {
    detail.value = await api.tripDetail(tripId.value)
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载失败', icon: 'none' })
  }
}

async function toggle(item: TripItem) {
  if (!detail.value) return
  const next = !item.is_checked
  item.is_checked = next
  pending.value[item.id] = true
  const t = detail.value.trip
  t.checked_count = detail.value.items.filter((i) => i.is_checked).length
  try {
    detail.value = await api.checkItem(tripId.value, item.id, next)
  } catch (e: any) {
    item.is_checked = !next
    t.checked_count = detail.value.items.filter((i) => i.is_checked).length
    uni.showToast({ title: e.message || '同步失败', icon: 'none' })
  } finally {
    delete pending.value[item.id]
  }
}

function addTemp() {
  uni.showModal({
    title: '临时添加物品',
    editable: true,
    placeholderText: '输入物品名称',
    success: async (r) => {
      if (!r.confirm || !r.content?.trim()) return
      try {
        detail.value = await api.addTempItem(tripId.value, { name: r.content.trim() })
      } catch (e: any) {
        uni.showToast({ title: e.message || '添加失败', icon: 'none' })
      }
    },
  })
}

async function removeTemp(item: TripItem) {
  try {
    detail.value = await api.deleteTempItem(tripId.value, item.id)
  } catch (e: any) {
    uni.showToast({ title: e.message || '删除失败', icon: 'none' })
  }
}

function prepareLeave() {
  if (!detail.value) return
  if (!detail.value.trip.total_count) {
    uni.showToast({ title: '请先配置物品', icon: 'none' })
    return
  }
  if (unchecked.value.length === 0) {
    finish(false)
    return
  }
  showRemind.value = true
}

async function finish(confirmUnchecked: boolean) {
  try {
    const res = await api.completeTrip(tripId.value, confirmUnchecked)
    showRemind.value = false
    uni.redirectTo({ url: `/pages/check/done?id=${res.trip.id}` })
  } catch (e: any) {
    uni.showToast({ title: e.message || '完成失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="page" v-if="detail">
    <view class="top">
      <view class="name">{{ detail.trip.scene_name }}</view>
      <view class="prog">{{ progressText }} 已确认 · {{ percent }}%</view>
      <view class="bar"><view class="bar-inner" :style="{ width: percent + '%' }" /></view>
    </view>

    <view class="list">
      <view
        v-for="item in detail.items"
        :key="item.id"
        class="row"
        :class="{ checked: item.is_checked }"
        @click="toggle(item)"
      >
        <view class="check">{{ item.is_checked ? '✓' : '' }}</view>
        <view class="info">
          <view class="title">{{ item.item_name }}</view>
          <view class="tags">
            <text v-if="item.is_important" class="tag imp">重要</text>
            <text v-if="item.is_required" class="tag req">必查</text>
            <text v-if="item.is_temporary" class="tag tmp">临时</text>
          </view>
        </view>
        <text v-if="item.is_temporary" class="del" @click.stop="removeTemp(item)">删</text>
      </view>
    </view>

    <view class="footer">
      <button class="btn btn-ghost" @click="addTemp">临时添加</button>
      <button class="btn btn-primary" @click="prepareLeave">准备出门</button>
    </view>

    <view v-if="showRemind" class="mask" @click="showRemind = false">
      <view class="sheet" @click.stop>
        <view class="sheet-title">还有 {{ unchecked.length }} 件未确认</view>
        <view v-if="uncheckedRequired.length" class="warn">含 {{ uncheckedRequired.length }} 件必查项</view>
        <view class="unchecked">
          <text v-for="i in unchecked" :key="i.id" class="u-item">
            {{ i.item_name }}<text v-if="i.is_required">（必查）</text>
          </text>
        </view>
        <button class="btn btn-ghost" @click="showRemind = false">返回继续检查</button>
        <button class="btn btn-primary" style="margin-top: 16rpx" @click="finish(true)">
          我确认不需要这些物品，仍然出门
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { padding: 24rpx 24rpx 180rpx; min-height: 100vh; }
.top { background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 20rpx; }
.name { font-size: 36rpx; font-weight: 700; }
.prog { margin-top: 8rpx; color: var(--muted); font-size: 24rpx; }
.bar { margin-top: 16rpx; height: 12rpx; background: var(--line); border-radius: 999rpx; overflow: hidden; }
.bar-inner { height: 100%; background: var(--primary); }
.list { display: flex; flex-direction: column; gap: 16rpx; }
.row {
  display: flex; align-items: center; gap: 20rpx;
  background: #fff; border-radius: 20rpx; padding: 28rpx 24rpx;
}
.row.checked { opacity: 0.72; }
.check {
  width: 56rpx; height: 56rpx; border-radius: 16rpx;
  border: 3rpx solid var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; font-weight: 700;
}
.row.checked .check { background: var(--primary); }
.info { flex: 1; }
.title { font-size: 30rpx; font-weight: 600; }
.tags { margin-top: 8rpx; display: flex; gap: 10rpx; }
.tag { font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 8rpx; }
.imp { background: #f8ead8; color: var(--warn); }
.req { background: #f7e8e5; color: var(--danger); }
.tmp { background: var(--primary-soft); color: var(--primary); }
.del { color: var(--danger); font-size: 24rpx; padding: 12rpx; }
.footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; gap: 16rpx; padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(247,244,239,.96);
}
.footer .btn { flex: 1; }
.mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: flex-end;
}
.sheet {
  width: 100%; background: #fff; border-radius: 28rpx 28rpx 0 0;
  padding: 36rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}
.sheet-title { font-size: 32rpx; font-weight: 700; }
.warn { margin-top: 8rpx; color: var(--danger); font-size: 24rpx; }
.unchecked { margin: 20rpx 0 28rpx; display: flex; flex-direction: column; gap: 8rpx; }
.u-item { color: var(--muted); font-size: 26rpx; }
</style>
