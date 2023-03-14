import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useStatusStore = defineStore('status', () => {
    const isLoading = ref(false)

    return { isLoading }
})
