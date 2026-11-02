<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'

const id = ref(0)
const name = ref('')
const category = ref('日常用品')
const isImportant = ref(false)
const categories = ['数码设备', '证件票据', '日常用品', '儿童用品', '运动装备', '其他']

onLoad(async (q) => {
  id.value = Number(q?.id || 0)
  if (!id.value) return
  const item = await api.items().then((list) => list.find((i) => i.id === id.value))
  if (!item) return
  name.value = item.name
  category.value = item.category || '其他'
  isImportant.value = item.is_important
})

async function save() {
  if (!name.value.trim()) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  const payload = {
    name: name.value.trim(),
    category: category.value,
    is_important: isImportant.value,
  }
  if (id.value) await api.updateItem(id.value, payload)
  else await api.createItem(payload)
  uni.navigateBack()
}
</script>

<template>
  <view class="page">
    <view class="preview">
      <view class="preview-tile" :class="{ imp: isImportant }">{{ name.trim().slice(0, 1) || '?' }}</view>
      <view class="preview-name">{{ name.trim() || '新物品' }}</view>
      <view class="preview-cat">{{ category }}</view>
    </view>

    <view class="label">物品名称</view>
    <input
      class="input"
      v-model="name"
      placeholder="如：工牌"
      placeholder-class="input-placeholder"
      maxlength="64"
    />

    <view class="label">分类</view>
    <view class="cats">
      <view
        v-for="c in categories"
        :key="c"
        class="cat"
        :class="{ on: category === c }"
        hover-class="pressed"
        @click="category = c"
      >
        {{ c }}
      </view>
    </view>

    <view class="switch-row" :class="{ on: isImportant }" @click="isImportant = !isImportant">
      <view class="switch-text">
        <view class="switch-title">标记为重要物品</view>
        <view class="switch-sub">重要物品会在检查时高亮显示</view>
      </view>
      <view class="switch" :class="{ on: isImportant }">
        <view class="switch-knob" />
      </view>
    </view>

    <button class="btn btn-dark save" hover-class="btn-hover" @click="save">保存</button>
  </view>
</template>

<style scoped>
.page {
  padding: 32rpx 32rpx 64rpx;
}

.preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0 16rpx;
  text-align: center;
}

.preview-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 140rpx;
  border-radius: 44rpx;
  border: 4rpx solid var(--ink);
  background: var(--card);
  box-shadow: var(--shadow);
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1;
  transform: rotate(-6deg);
}

.preview-tile.imp {
  background: var(--primary);
}

.preview-name {
  margin-top: 28rpx;
  font-size: 36rpx;
  font-weight: 900;
}

.preview-cat {
  margin-top: 4rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--muted);
}

.cats {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.cat {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc((100% - 32rpx) / 3);
  height: 76rpx;
  border-radius: 22rpx;
  border: 3rpx solid var(--ink);
  background: var(--card);
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
}

.cat.on {
  background: var(--primary);
  box-shadow: var(--shadow-sm);
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 28rpx;
  margin: 40rpx 0 48rpx;
  border-radius: 28rpx;
  border: 4rpx solid var(--ink);
  background: var(--card);
}

.switch-row.on {
  background: var(--primary-soft);
}

.switch-title {
  font-size: 30rpx;
  font-weight: 800;
}

.switch-sub {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: var(--muted);
}

.switch {
  display: flex;
  align-items: center;
  width: 104rpx;
  height: 60rpx;
  flex-shrink: 0;
  padding: 0 6rpx;
  border-radius: 999rpx;
  border: 4rpx solid var(--ink);
  background: var(--bg);
  transition: background 0.2s ease;
}

.switch.on {
  justify-content: flex-end;
  background: var(--ink);
}

.switch-knob {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--card);
  border: 3rpx solid var(--ink);
}

.switch.on .switch-knob {
  background: var(--primary);
  border-color: var(--primary);
}

.save {
  width: 100%;
}
</style>
