import { useUserStore } from '@/store/auth/user'

export default {
  computed: {
    $currentUser () {
      return useUserStore().currentUser
    }
  }
}
