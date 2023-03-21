import { defineStore } from 'pinia'
import type { ChatMessage } from '@/lib/types'
import { reactive } from 'vue'

export const useResponseStore = defineStore('response', () => {
  const responses = reactive<Record<string, ChatMessage | null>>({})
  const status = reactive<Record<string, boolean>>({})

  const setResponse = (conversationId: string, response: ChatMessage) => {
    responses[conversationId] = response
  }

  const getResponse = (conversationId: string): ChatMessage | null => {
    return responses[conversationId] || null
  }

  const setLoading = (conversationId: string, isLoading: boolean) => {
    status[conversationId] = isLoading
  }

  const isLoading = (conversationId: string): boolean => {
    return status[conversationId] || false
  }

  return {
    responses,
    setResponse,
    getResponse,
    setLoading,
    isLoading,
  }
})
