import { useUserStore } from '@/store/user'

export default {
  computed: {
    $currentUser () {
      return useUserStore().currentUser
    }
  }
}
