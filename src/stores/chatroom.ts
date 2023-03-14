import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Data, ChatMessage } from '@/lib/Type'
import { ChatCompletionRequestMessageRoleEnum } from '@/lib/Type'
import { v4 as uuid } from 'uuid'

export const useChatRoomStore = defineStore('chatroom', () => {
    // these variables are resposible for displaying the messages
    const current_message_list = reactive<ChatMessage[]>([])
    const conversationId = ref('')
    const data = ref(<Data | null>null)

    function $reset() {
        conversationId.value = ''
        data.value = null
        current_message_list.length = 0
    }

    // click child to switch next or previous
    const switchNode = (index: number, increment: number) => {
        // increment: +1 or -1
        // +1: next child
        // -1: previouse child

        // collect the messages
        let tmp_message_list: ChatMessage[] = []
        let childNode = current_message_list[index]
        let parentId = childNode.parentMessageId
        if (parentId && data.value) {
            let parentNode = data.value.mapping[parentId]

            // find the index of child in parent
            let child_index = parentNode.children.indexOf(childNode.id)
            let nextChildId = parentNode.children[child_index + increment]

            // collect the message from the next child to the end node
            let currentNode = data.value.mapping[nextChildId]
            while (currentNode.children.length > 0) {
                tmp_message_list.push(currentNode)
                currentNode = data.value.mapping[currentNode.children[0]]
            }

            // Don't forget to collect the last one node
            tmp_message_list.push(currentNode)
            data.value.current_node = currentNode.id

            // replace the old messages with the other messages from next child
            current_message_list.splice(index)
            current_message_list.push(...tmp_message_list)
        }
    }

    // Initially, load all messages of the chat room
    const loadCurrentMessages = () => {
        let currentNodeId = data.value?.current_node

        // reset array
        current_message_list.splice(0, current_message_list.length)
        if (currentNodeId && data.value) {
            let currentNode = data.value.mapping[currentNodeId]
            while (currentNode.parentMessageId) {
                current_message_list.unshift(currentNode)
                currentNode = data.value.mapping[currentNode.parentMessageId]
            }
        }
    }

    const loadMessageObject = (id: string) => {
        conversationId.value = id
        let item_string = localStorage.getItem(id)
        if (item_string) {
            data.value = JSON.parse(item_string)
            loadCurrentMessages()
        } else {
            throw Error('cannot read: ' + id)
        }
    }

    // edit message
    const editMessage = (index: number, message: string) => {
        let childNode = current_message_list[index]
        let parentId = childNode.parentMessageId
        if (parentId && data.value) {
            let id = uuid()
            data.value.mapping[parentId].children.push(id)
            let editNode = {
                id,
                role: ChatCompletionRequestMessageRoleEnum.User,
                text: message,
                children: [],
                parentMessageId: parentId
            }
            data.value.mapping[id] = editNode

            // replace the old messages with the other messages from next child
            current_message_list.splice(index)
            current_message_list.push(editNode)
            data.value.current_node = id
        }
        saveConversation()
    }

    // regenerate the response
    // add message
    const addMessage = (message: ChatMessage) => {
        if (message.parentMessageId && data.value) {
            let orignial_child_length = data.value.mapping[message.parentMessageId].children.length
            console.log(orignial_child_length)
            console.log(data.value.mapping[message.parentMessageId])
            data.value.mapping[message.parentMessageId].children.push(message.id)
            let newNode = {
                id: message.id,
                role: message.role,
                text: message.text,
                children: [],
                parentMessageId: message.parentMessageId
            }
            data.value.mapping[message.id] = newNode
            // add a new message by the user
            if (orignial_child_length == 0) {
                current_message_list.push(newNode)
            }
            // for regenerate by the assistant
            else {
                current_message_list.pop()
                current_message_list.push(newNode)
            }
            data.value.current_node = newNode.id
            saveConversation()
        }
    }

    const createConversation = (new_data: Data) => {
        data.value = new_data
        conversationId.value = new_data.current_node
        saveConversation()
    }

    const saveConversation = () => {
        if (data.value) {
            localStorage.setItem(conversationId.value, JSON.stringify(data.value))
        }
    }

    const deleteConversation = (id: string) => {
        try {
            localStorage.removeItem(id)
        } catch (e) {
            console.log(e)
        }
        $reset()
    }

    return {
        data,
        conversationId,
        current_message_list,
        $reset,
        switchNode,
        loadMessageObject,
        loadCurrentMessages,
        addMessage,
        editMessage,
        createConversation,
        deleteConversation
    }
})
