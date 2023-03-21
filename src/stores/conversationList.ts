import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Conversation } from '@/lib/types'

export const useListStore = defineStore('list', () => {
    const List = reactive<Conversation[]>([])

    const loadConversationList = () => {
        let item_str = localStorage.getItem('CONVERSATION_LIST')
        if (item_str) {
            let item: Conversation[] = JSON.parse(item_str)
            item.sort((a, b) => b.create_time - a.create_time)
            List.push(...item)
        }
    }

    const addConversation = (conversation: Conversation) => {
        List.unshift(conversation)
        saveConversationList()
    }

    const deleteConversationFromList = (index: number) => {
        List.splice(index, 1)
        saveConversationList()
    }

    const deleteConversationList = () => {
        List.splice(0, List.length)
        saveConversationList()
    }

    const saveConversationList = () => {
        localStorage.setItem('CONVERSATION_LIST', JSON.stringify(List))
    }

    return {
        List,
        loadConversationList,
        addConversation,
        deleteConversationFromList,
        deleteConversationList
    }
})
