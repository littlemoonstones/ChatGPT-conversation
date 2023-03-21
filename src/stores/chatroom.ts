import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Data, ChatMessage } from '@/lib/types'
import { ChatCompletionRequestMessageRoleEnum } from '@/lib/types'
import { v4 as uuid } from 'uuid'
import {
    loadMessageObject,
    saveConversation,
    deleteConversation,
    loadMessageList
} from '@/lib/localStorageService'
import {
    switchNode,
    loadCurrentMessages,
    processMessage,
    MessageOperationType
} from '@/lib/chatRoomUtils'

export const useChatRoomStore = defineStore('chatroom', () => {
    // these variables are resposible for displaying the messages
    const currentMessageList = reactive<ChatMessage[]>([])
    const conversationId = ref('')
    const data = ref(<Data | null>null)

    function $reset() {
        conversationId.value = ''
        data.value = null
        currentMessageList.splice(0, currentMessageList.length)
    }

    const clickSwitchNode = (index: number, increment: number) => {
        switchNode(currentMessageList, index, increment, data.value)
    }

    const clickloadMessageObject = (id: string) => {
        data.value = loadMessageObject(id)
        conversationId.value = id
        currentMessageList.length = 0
        if (data.value) {
            currentMessageList.push(...loadMessageList(data.value))
        } else {
            throw Error('cannot read: ' + id)
        }
    }

    // edit message
    const editMessage = (index: number, message: string) => {
        const childNode = currentMessageList[index]
        const parentId = childNode.parentMessageId

        if (parentId && data.value) {
            const id = uuid()
            const editNode: ChatMessage = {
                id,
                role: ChatCompletionRequestMessageRoleEnum.User,
                text: message,
                children: [],
                parentMessageId: parentId
            }
            processMessage(
                currentMessageList,
                data.value,
                MessageOperationType.EDIT,
                editNode,
                index
            )
            saveConversation(conversationId.value, data.value)
            console.log("save")
        }
    }

    // regenerate the response
    // add message
    const addMessage = (newMessage: ChatMessage) => {
        processMessage(currentMessageList, data.value, MessageOperationType.ADD, newMessage)
        saveConversation(conversationId.value, data.value!)
    }

    const createConversation = (new_data: Data) => {
        data.value = new_data
        conversationId.value = new_data.current_node
        saveConversation(conversationId.value, data.value)
    }

    const clickDeleteConversation = (id: string) =>{
        deleteConversation(id)
        $reset()
    }

    return {
        data,
        conversationId,
        currentMessageList,
        $reset,
        clickSwitchNode,
        clickloadMessageObject,
        // loadMessageObject,
        loadCurrentMessages,
        addMessage,
        editMessage,
        createConversation,
        clickDeleteConversation
    }
})
