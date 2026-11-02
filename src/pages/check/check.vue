<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'
import type { TripDetail, TripItem } from '@/api/types'

const tripId = ref(0)
const detail = ref<TripDetail | null>(null)
const pending = ref<Record<number, boolean>>({})
const showRemind = ref(false)

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
    <view class="top card">
      <view class="top-row">
        <view class="top-info">
          <view class="eyebrow">正在检查</view>
          <view class="name">{{ detail.trip.scene_name }}</view>
        </view>
        <view class="count">
          <text class="count-num">{{ detail.trip.checked_count }}</text>
          <text class="count-total">/{{ detail.trip.total_count }}</text>
        </view>
      </view>
      <view class="bar">
        <view class="bar-inner" :style="{ width: percent + '%' }" />
      </view>
      <view class="prog">{{ percent === 100 ? '全部确认，可以出门啦' : `已完成 ${percent}%，继续加油` }}</view>
    </view>

    <view v-if="!detail.items.length" class="empty">
      <view class="empty-badge">!</view>
      <text>这个场景还没有物品，先临时添加一件吧</text>
    </view>

    <view class="list">
      <view
        v-for="item in detail.items"
        :key="item.id"
        class="row"
        :class="{ checked: item.is_checked }"
        @click="toggle(item)"
      >
        <view class="check">
          <text v-if="item.is_checked" class="check-mark">✓</text>
        </view>
        <view class="info">
          <view class="title">{{ item.item_name }}</view>
          <view v-if="item.is_important || item.is_required || item.is_temporary" class="tags">
            <text v-if="item.is_important" class="tag tag-imp">重要</text>
            <text v-if="item.is_required" class="tag tag-req">必查</text>
            <text v-if="item.is_temporary" class="tag tag-tmp">临时</text>
          </view>
        </view>
        <view
          v-if="item.is_temporary"
          class="del"
          hover-class="pressed"
          aria-label="删除临时物品"
          @click.stop="removeTemp(item)"
        >
          ×
        </view>
      </view>
    </view>

    <view class="dock">
      <button class="btn btn-ghost" hover-class="btn-hover" @click="addTemp">
        <text class="btn-icon">+</text>
        <text>临时添加</text>
      </button>
      <button class="btn btn-primary" hover-class="btn-hover" @click="prepareLeave">
        <text>准备出门</text>
        <text class="btn-icon">→</text>
      </button>
    </view>

    <view v-if="showRemind" class="mask" @click="showRemind = false">
      <view class="sheet" @click.stop>
        <view class="sheet-handle" />
        <view class="sheet-badge">!</view>
        <view class="sheet-title">还有 {{ unchecked.length }} 件没确认</view>
        <view v-if="uncheckedRequired.length" class="warn">其中 {{ uncheckedRequired.length }} 件是必查项</view>
        <view class="unchecked">
          <view v-for="i in unchecked" :key="i.id" class="u-item" :class="{ req: i.is_required }">
            {{ i.item_name }}
          </view>
        </view>
        <button class="btn btn-primary" hover-class="btn-hover" @click="showRemind = false">返回继续检查</button>
        <button class="btn btn-ghost sheet-second" hover-class="btn-hover" @click="finish(true)">
          不需要这些，仍然出门
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 220rpx;
}

.top {
  padding: 32rpx;
  margin-bottom: 32rpx;
  background: var(--primary);
}

.top-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.top-info {
  flex: 1;
  min-width: 0;
}

.eyebrow {
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  opacity: 0.7;
}

.name {
  margin-top: 4rpx;
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1.2;
}

.count {
  display: flex;
  align-items: baseline;
  line-height: 1;
}

.count-num {
  font-size: 80rpx;
  font-weight: 900;
}

.count-total {
  font-size: 32rpx;
  font-weight: 800;
  opacity: 0.6;
}

.bar {
  height: 28rpx;
  margin-top: 24rpx;
  border-radius: 999rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  background: var(--ink);
  transition: width 0.3s ease;
}

.prog {
  margin-top: 14rpx;
  font-size: 24rpx;
  font-weight: 700;
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
  padding: 28rpx;
  border-radius: 28rpx;
  border: 4rpx solid var(--ink);
  background: var(--card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, background 0.15s ease;
}

.row:active {
  transform: translateY(4rpx);
  box-shadow: none;
}

.row.checked {
  background: var(--primary-soft);
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  flex-shrink: 0;
  border-radius: 50%;
  border: 4rpx solid var(--ink);
  background: var(--card);
}

.row.checked .check {
  background: var(--ink);
}

.check-mark {
  color: var(--primary);
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 32rpx;
  font-weight: 800;
}

.row.checked .title {
  text-decoration: line-through;
  text-decoration-thickness: 4rpx;
  color: var(--muted);
}

.tags {
  display: flex;
  gap: 10rpx;
  margin-top: 10rpx;
}

.del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  flex-shrink: 0;
  border-radius: 18rpx;
  border: 3rpx solid var(--ink);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1;
}

.mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: rgba(23, 23, 28, 0.55);
}

.sheet {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  padding: 20rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  border-radius: 48rpx 48rpx 0 0;
  border-top: 4rpx solid var(--ink);
  background: var(--card);
  text-align: center;
}

.sheet-handle {
  align-self: center;
  width: 80rpx;
  height: 10rpx;
  margin-bottom: 28rpx;
  border-radius: 999rpx;
  background: var(--line);
}

.sheet-badge {
  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  border-radius: 36rpx;
  border: 4rpx solid var(--ink);
  background: var(--accent);
  box-shadow: var(--shadow-sm);
  color: var(--card);
  font-size: 56rpx;
  font-weight: 900;
  line-height: 1;
  transform: rotate(-6deg);
}

.sheet-title {
  margin-top: 28rpx;
  font-size: 38rpx;
  font-weight: 900;
}

.warn {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--accent);
}

.unchecked {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14rpx;
  margin: 32rpx 0 36rpx;
}

.u-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  border: 3rpx solid var(--ink);
  background: var(--bg);
  font-size: 26rpx;
  font-weight: 700;
}

.u-item.req {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.sheet-second {
  margin-top: 20rpx;
}
</style>
