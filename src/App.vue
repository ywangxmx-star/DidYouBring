<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(async () => {
  const user = useUserStore()
  await user.ensureLogin()
})
</script>

<style>
@import './styles/app.css';
</style>
