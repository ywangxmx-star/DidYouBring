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
    <view class="label">物品名称</view>
    <input class="input" v-model="name" placeholder="如：工牌" maxlength="64" />
    <view class="label">分类</view>
    <view class="cats">
      <view
        v-for="c in categories"
        :key="c"
        class="cat"
        :class="{ on: category === c }"
        @click="category = c"
      >{{ c }}</view>
    </view>
    <view class="switch-row" @click="isImportant = !isImportant">
      <text>标记为重要物品</text>
      <text class="flag">{{ isImportant ? '是' : '否' }}</text>
    </view>
    <button class="btn btn-primary" @click="save">保存</button>
  </view>
</template>

<style scoped>
.page { padding: 32rpx; }
.label { margin: 24rpx 0 12rpx; color: var(--muted); font-size: 24rpx; }
.cats { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 24rpx; }
.cat {
  padding: 12rpx 20rpx; border-radius: 999rpx; background: #fff;
  border: 2rpx solid var(--line); font-size: 24rpx;
}
.cat.on { background: var(--primary-soft); border-color: var(--primary); color: var(--primary); }
.switch-row {
  background: #fff; border-radius: 16rpx; padding: 28rpx;
  display: flex; justify-content: space-between; margin-bottom: 40rpx;
}
.flag { color: var(--primary); font-weight: 600; }
</style>
