import type { ChatMessage, Data } from './types'

export const loadMessageObject = (id: string): Data | null => {
    const itemString = localStorage.getItem(id)
    if (itemString) {
        return JSON.parse(itemString)
    }
    return null
}

// Initially, load all messages of the chat room
export const loadMessageList = (data: Data): ChatMessage[] => {
    let currentNodeId = data.current_node
    let message_list: ChatMessage[] = []

    let currentNode = data.mapping[currentNodeId]
    while (currentNode.parentMessageId) {
        message_list.unshift(currentNode)
        currentNode = data.mapping[currentNode.parentMessageId]
    }
    return message_list
}

export const saveConversation = (conversationId: string, data: Data) => {
    localStorage.setItem(conversationId, JSON.stringify(data))
}

export const deleteConversation = (id: string) => {
    try {
        localStorage.removeItem(id)
    } catch (e) {
        console.log(e)
    }
}
